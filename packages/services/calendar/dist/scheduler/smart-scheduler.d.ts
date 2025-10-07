import type { MeetingRequest, ScheduleResult, TimeSlot, CalendarEvent, Availability } from '../types/index.js';
/**
 * Smart scheduler that finds optimal meeting times
 */
export declare class SmartScheduler {
    /**
     * Schedule a meeting by finding optimal time slots
     */
    scheduleMeeting(request: MeetingRequest, availability: Availability[]): Promise<ScheduleResult>;
    /**
     * Find common availability across all participants
     */
    private findCommonAvailability;
    /**
     * Intersect two sets of time slots
     */
    private intersectSlots;
    /**
     * Merge overlapping time slots
     */
    private mergeOverlappingSlots;
    /**
     * Score time slots based on multiple factors
     */
    private scoreSlots;
    /**
     * Calculate score factors for a time slot
     */
    private calculateSlotScore;
    /**
     * Score time of day (prefer optimal meeting times)
     */
    private scoreTimeOfDay;
    /**
     * Score day of week (prefer mid-week)
     */
    private scoreDayOfWeek;
    /**
     * Aggregate score factors into final score
     */
    private aggregateScore;
    /**
     * Find conflicts in a time slot
     */
    findConflicts(slot: TimeSlot, events: CalendarEvent[]): Promise<CalendarEvent[]>;
    /**
     * Generate time slots for a date range
     */
    generateTimeSlots(start: Date, end: Date, duration: number, workingHours?: {
        start: number;
        end: number;
    }): TimeSlot[];
}
//# sourceMappingURL=smart-scheduler.d.ts.map