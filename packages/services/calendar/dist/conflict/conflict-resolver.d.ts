import type { UserId } from '@tide/types';
import type { CalendarEvent, TimeSlot } from '../types';
export interface CalendarConflict {
    timeSlot: TimeSlot;
    events: CalendarEvent[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: 'overlap' | 'back_to_back' | 'travel_conflict' | 'double_booked';
}
export interface Resolution {
    conflict: CalendarConflict;
    keep: CalendarEvent;
    reschedule: {
        event: CalendarEvent;
        alternatives: {
            slot: TimeSlot;
            score: number;
            reasoning: string;
        }[];
        autoReschedule: boolean;
    }[];
    explanation: string;
}
/**
 * Conflict Resolver that detects and resolves calendar conflicts intelligently
 */
export declare class ConflictResolver {
    private userId;
    constructor(userId: UserId);
    /**
     * Detect all conflicts in a set of events
     */
    detectConflicts(events: CalendarEvent[]): Promise<CalendarConflict[]>;
    /**
     * Analyze conflict between two events
     */
    private analyzeConflict;
    /**
     * Resolve a calendar conflict
     */
    resolve(conflict: CalendarConflict): Promise<Resolution>;
    /**
     * Score event importance
     */
    private scoreImportance;
    /**
     * Check if email is external
     */
    private isExternal;
    /**
     * Find alternative time slots for an event
     */
    private findAlternatives;
    /**
     * Generate candidate time slots
     */
    private generateCandidateSlots;
    /**
     * Score a time slot
     */
    private scoreTimeSlot;
    /**
     * Explain slot score
     */
    private explainSlotScore;
    /**
     * Explain resolution decision
     */
    private explainResolution;
    /**
     * Auto-resolve conflicts if possible
     */
    autoResolve(conflicts: CalendarConflict[]): Promise<{
        resolved: Resolution[];
        needsReview: CalendarConflict[];
    }>;
}
//# sourceMappingURL=conflict-resolver.d.ts.map