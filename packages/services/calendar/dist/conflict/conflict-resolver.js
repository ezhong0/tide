"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolver = void 0;
const logger_1 = require("@tide/logger");
/**
 * Conflict Resolver that detects and resolves calendar conflicts intelligently
 */
class ConflictResolver {
    constructor(userId) {
        this.userId = userId;
    }
    /**
     * Detect all conflicts in a set of events
     */
    async detectConflicts(events) {
        logger_1.logger.info({
            userId: this.userId,
            eventCount: events.length,
        }, 'Detecting calendar conflicts');
        const conflicts = [];
        // Sort events by start time
        const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
        // Check for overlaps and back-to-back conflicts
        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            for (let j = i + 1; j < sorted.length; j++) {
                const next = sorted[j];
                // No more overlaps possible
                if (next.start >= current.end) {
                    break;
                }
                // Detect type of conflict
                const conflict = this.analyzeConflict(current, next);
                if (conflict) {
                    conflicts.push(conflict);
                }
            }
        }
        logger_1.logger.info({
            userId: this.userId,
            conflictCount: conflicts.length,
        }, 'Conflicts detected');
        return conflicts;
    }
    /**
     * Analyze conflict between two events
     */
    analyzeConflict(event1, event2) {
        const start1 = event1.start.getTime();
        const end1 = event1.end.getTime();
        const start2 = event2.start.getTime();
        const end2 = event2.end.getTime();
        // Complete overlap (double booked)
        if (start2 < end1) {
            const overlapStart = Math.max(start1, start2);
            const overlapEnd = Math.min(end1, end2);
            return {
                timeSlot: {
                    start: new Date(overlapStart),
                    end: new Date(overlapEnd),
                },
                events: [event1, event2],
                severity: 'critical',
                type: 'double_booked',
            };
        }
        // Back-to-back (no buffer time)
        const gapMinutes = (start2 - end1) / (1000 * 60);
        if (gapMinutes === 0) {
            return {
                timeSlot: {
                    start: event1.end,
                    end: event2.start,
                },
                events: [event1, event2],
                severity: 'medium',
                type: 'back_to_back',
            };
        }
        // Travel conflict (need 15+ min between locations)
        if (gapMinutes > 0 &&
            gapMinutes < 15 &&
            event1.location &&
            event2.location &&
            event1.location !== event2.location) {
            return {
                timeSlot: {
                    start: event1.end,
                    end: event2.start,
                },
                events: [event1, event2],
                severity: 'high',
                type: 'travel_conflict',
            };
        }
        return null;
    }
    /**
     * Resolve a calendar conflict
     */
    async resolve(conflict) {
        logger_1.logger.info({
            userId: this.userId,
            conflictType: conflict.type,
            eventCount: conflict.events.length,
        }, 'Resolving conflict');
        try {
            // Score importance of conflicting events
            const scores = await Promise.all(conflict.events.map((e) => this.scoreImportance(e)));
            // Sort by importance (highest first)
            const ranked = conflict.events
                .map((event, i) => ({ event, score: scores[i] }))
                .sort((a, b) => b.score - a.score);
            // Keep most important event
            const toKeep = ranked[0];
            // Find alternatives for events to reschedule
            const toReschedule = ranked.slice(1);
            const reschedulePlans = await Promise.all(toReschedule.map(async (item) => {
                const alternatives = await this.findAlternatives(item.event, conflict.events.filter((e) => e.id !== item.event.id));
                return {
                    event: item.event,
                    alternatives,
                    autoReschedule: item.score < 0.5 && alternatives[0]?.score > 0.8,
                };
            }));
            const resolution = {
                conflict,
                keep: toKeep.event,
                reschedule: reschedulePlans,
                explanation: this.explainResolution(toKeep.event, toReschedule, conflict),
            };
            logger_1.logger.info({
                userId: this.userId,
                keepingEvent: toKeep.event.title,
                reschedulingCount: reschedulePlans.length,
            }, 'Conflict resolved');
            return resolution;
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, error }, 'Failed to resolve conflict');
            throw error;
        }
    }
    /**
     * Score event importance
     */
    async scoreImportance(event) {
        let score = 0.5; // Base score
        // You are the organizer
        if (event.organizer?.email === this.userId) {
            score += 0.3;
        }
        // Small meeting (more important)
        const attendeeCount = event.attendees?.length || 0;
        if (attendeeCount <= 3) {
            score += 0.2;
        }
        // 1:1 meetings are critical
        if (attendeeCount === 2) {
            score += 0.2;
        }
        // Important keywords in title
        const importantKeywords = [
            '1:1',
            'interview',
            'board',
            'executive',
            'ceo',
            'vp',
            'customer',
            'client',
            'demo',
            'presentation',
        ];
        const title = event.title.toLowerCase();
        if (importantKeywords.some((keyword) => title.includes(keyword))) {
            score += 0.3;
        }
        // Recurring meetings less important (can reschedule)
        if (event.isRecurring) {
            score -= 0.2;
        }
        // Declined or tentative events less important
        if (event.status === 'tentative') {
            score -= 0.2;
        }
        else if (event.status === 'cancelled') {
            score = 0;
        }
        // External attendees increase importance
        const hasExternalAttendees = event.attendees?.some((a) => this.isExternal(a.email));
        if (hasExternalAttendees) {
            score += 0.2;
        }
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Check if email is external
     */
    isExternal(email) {
        // Simplified - would check against company domain
        return !email.endsWith('@example.com');
    }
    /**
     * Find alternative time slots for an event
     */
    async findAlternatives(event, otherEvents) {
        const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
        const alternatives = [];
        // Generate candidate slots (next 7 days, working hours)
        const candidates = this.generateCandidateSlots(event.start, duration, 7);
        // Score each candidate
        for (const candidate of candidates) {
            // Check if slot conflicts with other events
            const hasConflict = otherEvents.some((other) => (candidate.start >= other.start && candidate.start < other.end) ||
                (candidate.end > other.start && candidate.end <= other.end));
            if (hasConflict) {
                continue;
            }
            // Score the slot
            const score = this.scoreTimeSlot(candidate, event);
            const reasoning = this.explainSlotScore(candidate, score);
            alternatives.push({ slot: candidate, score, reasoning });
        }
        // Sort by score
        return alternatives.sort((a, b) => b.score - a.score).slice(0, 5);
    }
    /**
     * Generate candidate time slots
     */
    generateCandidateSlots(fromDate, duration, days) {
        const slots = [];
        const startDate = new Date(fromDate);
        // Preferred hours: 9-10 AM, 10-11 AM, 2-3 PM, 3-4 PM
        const preferredHours = [9, 10, 14, 15];
        for (let d = 1; d <= days; d++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + d);
            // Skip weekends
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }
            for (const hour of preferredHours) {
                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setMinutes(end.getMinutes() + duration);
                slots.push({ start, end });
            }
        }
        return slots;
    }
    /**
     * Score a time slot
     */
    scoreTimeSlot(slot, originalEvent) {
        let score = 0.5;
        const hour = slot.start.getHours();
        const day = slot.start.getDay();
        // Optimal times (10-11 AM, 2-3 PM)
        if ((hour >= 10 && hour < 11) || (hour >= 14 && hour < 15)) {
            score += 0.3;
        }
        else if (hour >= 9 && hour < 17) {
            score += 0.1;
        }
        // Mid-week is better (Tue-Thu)
        if (day >= 2 && day <= 4) {
            score += 0.2;
        }
        // Same day of week as original
        if (day === originalEvent.start.getDay()) {
            score += 0.1;
        }
        // Same time as original
        if (hour === originalEvent.start.getHours()) {
            score += 0.15;
        }
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Explain slot score
     */
    explainSlotScore(slot, score) {
        const day = slot.start.toLocaleDateString('en-US', { weekday: 'long' });
        const time = slot.start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
        if (score > 0.8) {
            return `Optimal time: ${day} at ${time}`;
        }
        else if (score > 0.6) {
            return `Good time: ${day} at ${time}`;
        }
        else if (score > 0.4) {
            return `Acceptable time: ${day} at ${time}`;
        }
        else {
            return `Suboptimal time: ${day} at ${time}`;
        }
    }
    /**
     * Explain resolution decision
     */
    explainResolution(keeping, rescheduling, conflict) {
        const parts = [];
        // Explain conflict
        switch (conflict.type) {
            case 'double_booked':
                parts.push('Double booking detected - events overlap completely.');
                break;
            case 'back_to_back':
                parts.push('Back-to-back meetings - no buffer time between events.');
                break;
            case 'travel_conflict':
                parts.push('Insufficient travel time between different locations.');
                break;
            case 'overlap':
                parts.push('Partial overlap detected between events.');
                break;
        }
        // Explain decision
        parts.push(`Keeping "${keeping.title}" as it has higher priority (organizer, key stakeholders, or critical nature).`);
        // List what's being rescheduled
        if (rescheduling.length > 0) {
            const titles = rescheduling.map((r) => `"${r.event.title}"`).join(', ');
            parts.push(`Rescheduling: ${titles}.`);
        }
        return parts.join(' ');
    }
    /**
     * Auto-resolve conflicts if possible
     */
    async autoResolve(conflicts) {
        const resolved = [];
        const needsReview = [];
        for (const conflict of conflicts) {
            // Only auto-resolve low severity conflicts
            if (conflict.severity === 'low' || conflict.severity === 'medium') {
                try {
                    const resolution = await this.resolve(conflict);
                    // Only auto-execute if all reschedules are auto-approved
                    const canAutoExecute = resolution.reschedule.every((r) => r.autoReschedule);
                    if (canAutoExecute) {
                        resolved.push(resolution);
                    }
                    else {
                        needsReview.push(conflict);
                    }
                }
                catch (error) {
                    logger_1.logger.error({ error }, 'Failed to auto-resolve conflict');
                    needsReview.push(conflict);
                }
            }
            else {
                needsReview.push(conflict);
            }
        }
        logger_1.logger.info({
            userId: this.userId,
            resolvedCount: resolved.length,
            needsReviewCount: needsReview.length,
        }, 'Auto-resolution complete');
        return { resolved, needsReview };
    }
}
exports.ConflictResolver = ConflictResolver;
//# sourceMappingURL=conflict-resolver.js.map