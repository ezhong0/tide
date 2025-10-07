"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartScheduler = void 0;
const logger_1 = require("@tide/logger");
/**
 * Smart scheduler that finds optimal meeting times
 */
class SmartScheduler {
    /**
     * Schedule a meeting by finding optimal time slots
     */
    async scheduleMeeting(request, availability) {
        logger_1.logger.info({
            userId: request.userId,
            title: request.title,
            participants: request.participants.length,
        }, 'Scheduling meeting');
        try {
            // Find common available slots
            const commonSlots = this.findCommonAvailability(availability, request.duration);
            if (commonSlots.length === 0) {
                return {
                    success: false,
                    reasoning: 'No common availability found for all participants',
                };
            }
            // Score and rank slots
            const scoredSlots = await this.scoreSlots(commonSlots, request);
            const ranked = scoredSlots.sort((a, b) => (b.score || 0) - (a.score || 0));
            // Auto-schedule if confidence is high enough
            if (request.autoSchedule && ranked[0].score && ranked[0].score > 0.85) {
                return {
                    success: true,
                    suggestions: ranked.slice(0, 3),
                    reasoning: `Auto-scheduled for ${ranked[0].start.toLocaleString()} (confidence: ${ranked[0].score.toFixed(2)})`,
                };
            }
            return {
                success: true,
                suggestions: ranked.slice(0, 3),
                reasoning: `Found ${ranked.length} available time slots`,
            };
        }
        catch (error) {
            logger_1.logger.error({ userId: request.userId, error }, 'Failed to schedule meeting');
            throw error;
        }
    }
    /**
     * Find common availability across all participants
     */
    findCommonAvailability(availabilities, duration) {
        if (availabilities.length === 0) {
            return [];
        }
        // Start with first participant's availability
        let commonSlots = [...availabilities[0].slots];
        // Intersect with each additional participant's availability
        for (let i = 1; i < availabilities.length; i++) {
            commonSlots = this.intersectSlots(commonSlots, availabilities[i].slots);
        }
        // Filter slots that are long enough for the meeting
        return commonSlots.filter((slot) => {
            const slotDuration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
            return slotDuration >= duration;
        });
    }
    /**
     * Intersect two sets of time slots
     */
    intersectSlots(slots1, slots2) {
        const intersections = [];
        for (const slot1 of slots1) {
            for (const slot2 of slots2) {
                const start = new Date(Math.max(slot1.start.getTime(), slot2.start.getTime()));
                const end = new Date(Math.min(slot1.end.getTime(), slot2.end.getTime()));
                // Check if there's overlap
                if (start < end) {
                    intersections.push({ start, end });
                }
            }
        }
        return this.mergeOverlappingSlots(intersections);
    }
    /**
     * Merge overlapping time slots
     */
    mergeOverlappingSlots(slots) {
        if (slots.length === 0) {
            return [];
        }
        // Sort by start time
        const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());
        const merged = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const current = sorted[i];
            const last = merged[merged.length - 1];
            // Check if current overlaps with last
            if (current.start <= last.end) {
                // Merge by extending the end time
                last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
            }
            else {
                // No overlap, add as new slot
                merged.push(current);
            }
        }
        return merged;
    }
    /**
     * Score time slots based on multiple factors
     */
    async scoreSlots(slots, request) {
        return Promise.all(slots.map(async (slot) => {
            const factors = await this.calculateSlotScore(slot, request);
            const score = this.aggregateScore(factors);
            return {
                ...slot,
                score,
                factors,
            };
        }));
    }
    /**
     * Calculate score factors for a time slot
     */
    async calculateSlotScore(slot, request) {
        const weights = {
            timeOfDay: 0.25,
            dayOfWeek: 0.15,
            proximity: 0.15,
            preparation: 0.15,
            focus: 0.20,
            travel: 0.10,
        };
        return {
            timeOfDay: this.scoreTimeOfDay(slot, request.preferences?.timeOfDay),
            dayOfWeek: this.scoreDayOfWeek(slot, request.preferences?.dayOfWeek),
            proximity: 0.7, // Would check nearby meetings
            preparation: 0.8, // Would check buffer time
            focus: 0.9, // Would check impact on focus time
            travel: 1.0, // Would check travel requirements
        };
    }
    /**
     * Score time of day (prefer optimal meeting times)
     */
    scoreTimeOfDay(slot, preference) {
        const hour = slot.start.getHours();
        // Default scoring
        let score = 0.5;
        // Morning peak (10-11am)
        if (hour >= 10 && hour <= 11) {
            score = 1.0;
        }
        // Afternoon peak (2-3pm)
        else if (hour >= 14 && hour <= 15) {
            score = 0.9;
        }
        // Regular business hours
        else if (hour >= 9 && hour <= 17) {
            score = 0.7;
        }
        // Early morning or late afternoon
        else if (hour >= 8 && hour <= 18) {
            score = 0.5;
        }
        // Off hours
        else {
            score = 0.2;
        }
        // Adjust for preference
        if (preference) {
            if (preference === 'morning' && hour >= 8 && hour < 12) {
                score += 0.2;
            }
            else if (preference === 'afternoon' && hour >= 12 && hour < 17) {
                score += 0.2;
            }
            else if (preference === 'evening' && hour >= 17 && hour < 20) {
                score += 0.2;
            }
        }
        return Math.min(score, 1.0);
    }
    /**
     * Score day of week (prefer mid-week)
     */
    scoreDayOfWeek(slot, preferredDays) {
        const day = slot.start.getDay(); // 0-6, Sunday-Saturday
        // Default scoring
        let score = 0.5;
        // Tuesday-Thursday optimal
        if (day >= 2 && day <= 4) {
            score = 1.0;
        }
        // Monday okay
        else if (day === 1) {
            score = 0.7;
        }
        // Friday suboptimal
        else if (day === 5) {
            score = 0.5;
        }
        // Weekend
        else {
            score = 0.2;
        }
        // Adjust for preferred days
        if (preferredDays && preferredDays.includes(day)) {
            score += 0.2;
        }
        return Math.min(score, 1.0);
    }
    /**
     * Aggregate score factors into final score
     */
    aggregateScore(factors) {
        const weights = {
            timeOfDay: 0.25,
            dayOfWeek: 0.15,
            proximity: 0.15,
            preparation: 0.15,
            focus: 0.20,
            travel: 0.10,
        };
        const score = factors.timeOfDay * weights.timeOfDay +
            factors.dayOfWeek * weights.dayOfWeek +
            factors.proximity * weights.proximity +
            factors.preparation * weights.preparation +
            factors.focus * weights.focus +
            factors.travel * weights.travel;
        return Math.min(Math.max(score, 0), 1);
    }
    /**
     * Find conflicts in a time slot
     */
    async findConflicts(slot, events) {
        return events.filter((event) => {
            // Check if event overlaps with slot
            return ((event.start >= slot.start && event.start < slot.end) ||
                (event.end > slot.start && event.end <= slot.end) ||
                (event.start <= slot.start && event.end >= slot.end));
        });
    }
    /**
     * Generate time slots for a date range
     */
    generateTimeSlots(start, end, duration, workingHours = { start: 9, end: 17 }) {
        const slots = [];
        const current = new Date(start);
        while (current < end) {
            const hour = current.getHours();
            // Only generate slots during working hours
            if (hour >= workingHours.start && hour < workingHours.end) {
                const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
                // Make sure slot doesn't extend past working hours
                const dayEnd = new Date(current);
                dayEnd.setHours(workingHours.end, 0, 0, 0);
                if (slotEnd <= dayEnd) {
                    slots.push({
                        start: new Date(current),
                        end: slotEnd,
                    });
                }
            }
            // Move to next 30-minute slot
            current.setMinutes(current.getMinutes() + 30);
        }
        return slots;
    }
}
exports.SmartScheduler = SmartScheduler;
//# sourceMappingURL=smart-scheduler.js.map