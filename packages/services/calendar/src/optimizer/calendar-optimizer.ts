import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';
import type { CalendarEvent, TimeSlot } from '../types/index.js';

export interface ScheduleAnalysis {
  totalMeetingTime: number; // minutes
  fragmentedTime: number; // minutes in gaps < 30 min
  focusBlocks: number; // Number of 2+ hour blocks
  meetingCount: number;
  averageMeetingDuration: number;
  meetings: {
    event: CalendarEvent;
    value: number; // 0-1 score
    required: boolean;
    timing: {
      score: number; // 0-1, how optimal is the time
      issues: string[];
    };
  }[];
}

export interface OptimizationOpportunity {
  type:
    | 'consolidate_meetings'
    | 'skip_meeting'
    | 'reschedule_meeting'
    | 'create_focus_block'
    | 'reduce_meeting_duration';
  impact: 'high' | 'medium' | 'low';
  timeRecovered?: number; // minutes
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
    timeRecovered: number; // minutes
    focusTimeCreated: number; // minutes
    meetingsReduced: number;
    fragmentationReduced: number; // percentage
  };
}

export interface OptimizationAction {
  type: 'reschedule' | 'decline' | 'batch' | 'protect' | 'shorten';
  meeting?: CalendarEvent;
  newTime?: Date;
  reasoning: string;
  autoExecute: boolean; // Can be done automatically
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
export class CalendarOptimizer {
  constructor(private userId: UserId) {}

  /**
   * Analyze weekly schedule and identify optimization opportunities
   */
  async optimizeWeek(events: CalendarEvent[]): Promise<OptimizationPlan> {
    logger.info(
      {
        userId: this.userId,
        eventCount: events.length,
      },
      'Optimizing weekly schedule'
    );

    try {
      // Analyze current schedule
      const analysis = this.analyzeSchedule(events);

      // Identify optimization opportunities
      const opportunities = this.findOpportunities(analysis);

      // Create actionable plan
      const actions = this.createOptimizationActions(opportunities);

      // Calculate projected impact
      const projectedImpact = this.calculateProjectedImpact(opportunities);

      const plan: OptimizationPlan = {
        currentState: analysis,
        opportunities,
        actions,
        projectedImpact,
      };

      logger.info(
        {
          userId: this.userId,
          opportunityCount: opportunities.length,
          timeRecoverable: projectedImpact.timeRecovered,
        },
        'Optimization plan created'
      );

      return plan;
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to optimize schedule');
      throw error;
    }
  }

  /**
   * Analyze current schedule
   */
  private analyzeSchedule(events: CalendarEvent[]): ScheduleAnalysis {
    if (events.length === 0) {
      return {
        totalMeetingTime: 0,
        fragmentedTime: 0,
        focusBlocks: 0,
        meetingCount: 0,
        averageMeetingDuration: 0,
        meetings: [],
      };
    }

    // Calculate total meeting time
    const totalMeetingTime = events.reduce((sum, event) => {
      // Ensure duration is never negative (in case of malformed events)
      const duration = Math.max(0, (event.end.getTime() - event.start.getTime()) / (1000 * 60));
      return sum + duration;
    }, 0);

    // Calculate fragmented time
    const fragmentedTime = this.calculateFragmentedTime(events);

    // Count focus blocks (2+ hour uninterrupted periods)
    const focusBlocks = this.countFocusBlocks(events);

    // Average meeting duration
    const averageMeetingDuration = totalMeetingTime / events.length;

    // Analyze each meeting
    const meetings = events.map((event) => ({
      event,
      value: this.calculateMeetingValue(event),
      required: this.isMeetingRequired(event),
      timing: this.analyzeTimingScore(event),
    }));

    return {
      totalMeetingTime,
      fragmentedTime,
      focusBlocks,
      meetingCount: events.length,
      averageMeetingDuration,
      meetings,
    };
  }

  /**
   * Calculate fragmented time (gaps less than 30 minutes)
   */
  private calculateFragmentedTime(events: CalendarEvent[]): number {
    // Sort events by start time
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    let fragmentedTime = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const gapStart = sorted[i].end;
      const gapEnd = sorted[i + 1].start;
      const gapMinutes = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60);

      // Count gaps smaller than 30 minutes as fragmented
      if (gapMinutes > 0 && gapMinutes < 30) {
        fragmentedTime += gapMinutes;
      }
    }

    return fragmentedTime;
  }

  /**
   * Count focus blocks (2+ hour uninterrupted periods)
   */
  private countFocusBlocks(events: CalendarEvent[]): number {
    // Define working hours (9 AM - 6 PM)
    const workStart = 9;
    const workEnd = 18;

    // Get all days that have events
    const days = new Set(
      events.map((e) => e.start.toISOString().split('T')[0])
    );

    let focusBlockCount = 0;

    for (const day of days) {
      const dayEvents = events
        .filter((e) => e.start.toISOString().startsWith(day))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      // Find gaps in this day
      const date = new Date(day);
      let currentTime = new Date(date);
      currentTime.setHours(workStart, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(workEnd, 0, 0, 0);

      for (const event of dayEvents) {
        const gapMinutes =
          (event.start.getTime() - currentTime.getTime()) / (1000 * 60);

        // If gap is 120+ minutes, it's a focus block
        if (gapMinutes >= 120) {
          focusBlockCount++;
        }

        currentTime = event.end;
      }

      // Check final gap
      // Ensure currentTime doesn't exceed endOfDay (handles events that run past work hours)
      currentTime = new Date(Math.min(currentTime.getTime(), endOfDay.getTime()));
      const finalGapMinutes =
        (endOfDay.getTime() - currentTime.getTime()) / (1000 * 60);
      if (finalGapMinutes >= 120) {
        focusBlockCount++;
      }
    }

    return focusBlockCount;
  }

  /**
   * Calculate meeting value score
   */
  private calculateMeetingValue(event: CalendarEvent): number {
    let value = 0.5; // Base value

    // Organizer meetings are more valuable
    if (event.organizer?.email === this.userId) {
      value += 0.2;
    }

    // Small meetings (< 5 people) are often more valuable
    const attendeeCount = event.attendees?.length || 0;
    // Validate attendee count is reasonable (1-1000 people)
    if (attendeeCount > 0 && attendeeCount <= 1000) {
      if (attendeeCount <= 5) {
        value += 0.2;
      }

      // 1:1s are valuable
      if (attendeeCount === 2) {
        value += 0.1;
      }
    }

    // Meetings with important keywords
    const importantKeywords = ['1:1', 'one-on-one', 'review', 'planning', 'decision'];
    const title = event.title.toLowerCase();
    if (importantKeywords.some((keyword) => title.includes(keyword))) {
      value += 0.2;
    }

    // Recurring meetings may have declining value
    if (event.isRecurring) {
      value -= 0.1;
    }

    return Math.max(0, Math.min(1, value));
  }

  /**
   * Determine if meeting is required
   */
  private isMeetingRequired(event: CalendarEvent): boolean {
    // Meetings you organize are required
    if (event.organizer?.email === this.userId) {
      return true;
    }

    // 1:1s with direct reports or manager are required
    const attendeeCount = event.attendees?.length || 0;
    if (attendeeCount === 2) {
      return true;
    }

    // Status is confirmed and you accepted
    if (event.status === 'confirmed') {
      return true;
    }

    return false;
  }

  /**
   * Analyze timing score for meeting
   */
  private analyzeTimingScore(event: CalendarEvent): {
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 1.0;

    const hour = event.start.getHours();
    const day = event.start.getDay();

    // Early morning meetings (before 9 AM)
    if (hour < 9) {
      score -= 0.3;
      issues.push('Scheduled before typical working hours');
    }

    // Late afternoon meetings (after 5 PM)
    if (hour >= 17) {
      score -= 0.2;
      issues.push('Scheduled late in the day');
    }

    // Lunch time meetings (12-1 PM)
    if (hour === 12) {
      score -= 0.2;
      issues.push('Scheduled during typical lunch time');
    }

    // Monday morning or Friday afternoon
    if ((day === 1 && hour < 10) || (day === 5 && hour >= 15)) {
      score -= 0.15;
      issues.push('Suboptimal day/time combination');
    }

    // Weekend meetings
    if (day === 0 || day === 6) {
      score -= 0.5;
      issues.push('Scheduled on weekend');
    }

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Find optimization opportunities
   */
  private findOpportunities(analysis: ScheduleAnalysis): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Opportunity 1: Consolidate fragmented time
    if (analysis.fragmentedTime > 60) {
      opportunities.push({
        type: 'consolidate_meetings',
        impact: 'high',
        timeRecovered: analysis.fragmentedTime,
        description: `Found ${analysis.fragmentedTime.toFixed(0)} minutes of fragmented time - batch similar meetings together`,
      });
    }

    // Opportunity 2: Skip low-value meetings
    analysis.meetings.forEach(({ event, value, required }) => {
      if (!required && value < 0.3) {
        const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
        opportunities.push({
          type: 'skip_meeting',
          impact: 'medium',
          meeting: event,
          timeRecovered: duration,
          description: `Consider skipping: ${event.title} (low value score: ${value.toFixed(2)})`,
        });
      }
    });

    // Opportunity 3: Reschedule poorly-timed meetings
    analysis.meetings.forEach(({ event, timing }) => {
      if (timing.score < 0.5 && !this.isMeetingRequired(event)) {
        opportunities.push({
          type: 'reschedule_meeting',
          impact: 'low',
          meeting: event,
          betterTime: this.suggestBetterTime(event),
          description: `Reschedule ${event.title} to a more optimal time (current score: ${timing.score.toFixed(2)})`,
        });
      }
    });

    // Opportunity 4: Create focus blocks
    if (analysis.focusBlocks < 5) {
      opportunities.push({
        type: 'create_focus_block',
        impact: 'high',
        timeSlot: this.findBestFocusBlockSlot(analysis.meetings.map((m) => m.event)),
        description: `Only ${analysis.focusBlocks} focus blocks found - protect 2-hour blocks for deep work`,
      });
    }

    // Opportunity 5: Shorten long meetings
    analysis.meetings.forEach(({ event }) => {
      const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
      if (duration > 60 && !event.title.toLowerCase().includes('workshop')) {
        opportunities.push({
          type: 'reduce_meeting_duration',
          impact: 'medium',
          meeting: event,
          timeRecovered: duration - 45, // Suggest 45 min instead
          description: `${event.title} is ${duration} minutes - consider shortening to 45 minutes`,
        });
      }
    });

    return opportunities;
  }

  /**
   * Suggest better time for a meeting
   */
  private suggestBetterTime(event: CalendarEvent): Date {
    // Suggest Tuesday-Thursday, 10-11 AM or 2-3 PM
    const betterTime = new Date(event.start);

    // Move to Tuesday if not already Tue-Thu
    const day = betterTime.getDay();
    if (day < 2 || day > 4) {
      const daysToAdd = day === 1 ? 1 : day === 5 ? 4 : day === 0 ? 2 : 3;
      betterTime.setDate(betterTime.getDate() + daysToAdd);
    }

    // Move to 10 AM or 2 PM
    const hour = betterTime.getHours();
    if (hour < 10 || hour > 15) {
      betterTime.setHours(10, 0, 0, 0);
    } else if (hour > 11 && hour < 14) {
      betterTime.setHours(14, 0, 0, 0);
    }

    return betterTime;
  }

  /**
   * Find best slot for a focus block
   */
  private findBestFocusBlockSlot(events: CalendarEvent[]): TimeSlot {
    // Default to Tuesday morning 9-11 AM
    const tuesday = new Date();
    const dayOffset = (2 - tuesday.getDay() + 7) % 7 || 7; // Next Tuesday
    tuesday.setDate(tuesday.getDate() + dayOffset);
    tuesday.setHours(9, 0, 0, 0);

    const end = new Date(tuesday);
    end.setHours(11, 0, 0, 0);

    return { start: tuesday, end };
  }

  /**
   * Create actionable optimization plan
   */
  private createOptimizationActions(
    opportunities: OptimizationOpportunity[]
  ): OptimizationAction[] {
    return opportunities.map((opp) => {
      switch (opp.type) {
        case 'skip_meeting':
          return {
            type: 'decline',
            meeting: opp.meeting!,
            reasoning: opp.description,
            autoExecute: false, // Require approval
          };

        case 'reschedule_meeting':
          return {
            type: 'reschedule',
            meeting: opp.meeting!,
            newTime: opp.betterTime,
            reasoning: opp.description,
            autoExecute: false,
          };

        case 'create_focus_block':
          return {
            type: 'protect',
            reasoning: opp.description,
            autoExecute: true, // Can auto-create
          };

        case 'consolidate_meetings':
          return {
            type: 'batch',
            reasoning: opp.description,
            autoExecute: false,
          };

        case 'reduce_meeting_duration':
          return {
            type: 'shorten',
            meeting: opp.meeting!,
            reasoning: opp.description,
            autoExecute: false,
          };

        default:
          return {
            type: 'reschedule',
            reasoning: opp.description,
            autoExecute: false,
          };
      }
    });
  }

  /**
   * Calculate projected impact of optimizations
   */
  private calculateProjectedImpact(opportunities: OptimizationOpportunity[]): {
    timeRecovered: number;
    focusTimeCreated: number;
    meetingsReduced: number;
    fragmentationReduced: number;
  } {
    const timeRecovered = opportunities.reduce(
      (sum, opp) => sum + (opp.timeRecovered || 0),
      0
    );

    const focusTimeCreated = opportunities
      .filter((opp) => opp.type === 'create_focus_block')
      .length * 120; // 2 hours per focus block

    const meetingsReduced = opportunities.filter(
      (opp) => opp.type === 'skip_meeting'
    ).length;

    const fragmentationReduced = opportunities.some(
      (opp) => opp.type === 'consolidate_meetings'
    )
      ? 50
      : 0; // Percentage

    return {
      timeRecovered,
      focusTimeCreated,
      meetingsReduced,
      fragmentationReduced,
    };
  }
}
