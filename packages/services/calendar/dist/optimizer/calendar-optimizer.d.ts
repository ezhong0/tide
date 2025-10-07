import type { UserId } from '@tide/types';
import type { CalendarEvent, TimeSlot } from '../types';
export interface ScheduleAnalysis {
    totalMeetingTime: number;
    fragmentedTime: number;
    focusBlocks: number;
    meetingCount: number;
    averageMeetingDuration: number;
    meetings: {
        event: CalendarEvent;
        value: number;
        required: boolean;
        timing: {
            score: number;
            issues: string[];
        };
    }[];
}
export interface OptimizationOpportunity {
    type: 'consolidate_meetings' | 'skip_meeting' | 'reschedule_meeting' | 'create_focus_block' | 'reduce_meeting_duration';
    impact: 'high' | 'medium' | 'low';
    timeRecovered?: number;
    meeting?: CalendarEvent;
    timeSlot?: TimeSlot;
    betterTime?: Date;
    description: string;
}
export interface OptimizationPlan {
    currentState: ScheduleAnalysis;
    opportunities: OptimizationOpportunity[];
    actions: OptimizationAction[];
    projectedImpact: {
        timeRecovered: number;
        focusTimeCreated: number;
        meetingsReduced: number;
        fragmentationReduced: number;
    };
}
export interface OptimizationAction {
    type: 'reschedule' | 'decline' | 'batch' | 'protect' | 'shorten';
    meeting?: CalendarEvent;
    newTime?: Date;
    reasoning: string;
    autoExecute: boolean;
}
export interface ExecutionResult {
    success: boolean;
    action: OptimizationAction;
    timeRecovered?: number;
    focusTime?: number;
    error?: string;
}
/**
 * Calendar Optimizer that analyzes and improves schedule efficiency
 */
export declare class CalendarOptimizer {
    private userId;
    constructor(userId: UserId);
    /**
     * Analyze weekly schedule and identify optimization opportunities
     */
    optimizeWeek(events: CalendarEvent[]): Promise<OptimizationPlan>;
    /**
     * Analyze current schedule
     */
    private analyzeSchedule;
    /**
     * Calculate fragmented time (gaps less than 30 minutes)
     */
    private calculateFragmentedTime;
    /**
     * Count focus blocks (2+ hour uninterrupted periods)
     */
    private countFocusBlocks;
    /**
     * Calculate meeting value score
     */
    private calculateMeetingValue;
    /**
     * Determine if meeting is required
     */
    private isMeetingRequired;
    /**
     * Analyze timing score for meeting
     */
    private analyzeTimingScore;
    /**
     * Find optimization opportunities
     */
    private findOpportunities;
    /**
     * Suggest better time for a meeting
     */
    private suggestBetterTime;
    /**
     * Find best slot for a focus block
     */
    private findBestFocusBlockSlot;
    /**
     * Create actionable optimization plan
     */
    private createOptimizationActions;
    /**
     * Calculate projected impact of optimizations
     */
    private calculateProjectedImpact;
}
//# sourceMappingURL=calendar-optimizer.d.ts.map