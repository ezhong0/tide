import { logger } from '@tide/logger';
import { SupabaseConnectionManager, getDefaultEventIntelligence } from '@tide/database';
import type { UserId, UserSettings, EventIntelligence } from '@tide/types';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  priority?: number; // 1-10
  isFlexible?: boolean;
  isRecurring?: boolean;
}

export interface Conflict {
  id?: string;
  type: 'double_booking' | 'overlapping' | 'back_to_back' | 'violates_focus_time' | 'exceeds_daily_limit';
  event1: CalendarEvent;
  event2?: CalendarEvent;
  priority1: number;
  priority2?: number;
  suggestedResolution: string;
  resolutionOptions: ResolutionOption[];
  autoResolvable: boolean;
}

export interface ResolutionOption {
  action: 'reschedule' | 'decline' | 'shorten' | 'accept_conflict';
  description: string;
  impactScore: number; // 0-1, lower is better (less disruptive)
  newTime?: { start: Date; end: Date };
}

export interface Optimization {
  id?: string;
  type: 'batch_meetings' | 'reduce_conflicts' | 'protect_focus_time' | 'balance_load' | 'reschedule_suggestion';
  currentState: any;
  suggestedState: any;
  reasoning: string;
  impactScore: number; // 0-1, higher is better
  estimatedTimeSavedMinutes: number;
  affectedEvents: CalendarEvent[];
}

/**
 * Calendar Optimizer & Conflict Resolver
 * Detects conflicts and suggests optimizations for better calendar management
 */
export class CalendarOptimizer {
  private db = SupabaseConnectionManager.getInstance(true);

  /**
   * Analyze calendar and suggest optimizations
   */
  async analyzeAndOptimize(
    userId: UserId,
    dateRange: { start: Date; end: Date }
  ): Promise<{ conflicts: Conflict[]; optimizations: Optimization[] }> {
    logger.info({ userId, dateRange }, 'Analyzing calendar for optimization');

    // Get calendar events
    const events = await this.getCalendarEvents(userId, dateRange);

    // Get scheduling preferences
    const preferences = await this.getSchedulingPreferences(userId);

    // Detect conflicts
    const conflicts = await this.detectConflicts(events, preferences, userId);

    // Generate optimizations
    const optimizations = await this.generateOptimizations(events, preferences, userId);

    // Save results
    await Promise.all([
      ...conflicts.map(c => this.saveConflict(c, userId)),
      ...optimizations.map(o => this.saveOptimization(o, userId))
    ]);

    logger.info({
      userId,
      conflictsCount: conflicts.length,
      optimizationsCount: optimizations.length
    }, 'Calendar analysis complete');

    return { conflicts, optimizations };
  }

  /**
   * Detect scheduling conflicts
   */
  private async detectConflicts(
    events: CalendarEvent[],
    preferences: any,
    userId: UserId
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // Check for double bookings and overlaps
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        if (this.eventsOverlap(event1, event2)) {
          const conflictType = this.eventsExactlyOverlap(event1, event2)
            ? 'double_booking'
            : 'overlapping';

          conflicts.push({
            type: conflictType,
            event1,
            event2,
            priority1: event1.priority || 5,
            priority2: event2.priority || 5,
            suggestedResolution: this.suggestResolution(event1, event2, conflictType),
            resolutionOptions: this.generateResolutionOptions(event1, event2),
            autoResolvable: this.isAutoResolvable(event1, event2)
          });
        }
      }
    }

    // Check for back-to-back meetings
    const sortedEvents = [...events].sort((a, b) =>
      a.startTime.getTime() - b.startTime.getTime()
    );

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];

      const gapMinutes = (next.startTime.getTime() - current.endTime.getTime()) / (1000 * 60);

      if (gapMinutes === 0) {
        conflicts.push({
          type: 'back_to_back',
          event1: current,
          event2: next,
          priority1: current.priority || 5,
          priority2: next.priority || 5,
          suggestedResolution: `Add ${preferences.minGapBetweenMeetingsMinutes || 15}min buffer between meetings`,
          resolutionOptions: this.generateBackToBackResolutions(current, next, preferences),
          autoResolvable: current.isFlexible || next.isFlexible || false
        });
      }
    }

    // Check focus time violations
    if (preferences.focusTimeBlocks) {
      for (const event of events) {
        const dayName = this.getDayName(event.startTime).toLowerCase();
        const focusBlock = preferences.focusTimeBlocks.find((b: any) => b.day === dayName);

        if (focusBlock && this.violatesFocusTime(event, focusBlock)) {
          conflicts.push({
            type: 'violates_focus_time',
            event1: event,
            priority1: event.priority || 5,
            suggestedResolution: `Reschedule outside focus time (${focusBlock.start}-${focusBlock.end})`,
            resolutionOptions: this.generateFocusTimeResolutions(event, focusBlock),
            autoResolvable: event.isFlexible || false
          });
        }
      }
    }

    // Check daily meeting limits
    const eventsByDay = this.groupEventsByDay(events);
    const maxMeetingsPerDay = preferences.maxMeetingsPerDay || 6;

    for (const [day, dayEvents] of Object.entries(eventsByDay)) {
      if (dayEvents.length > maxMeetingsPerDay) {
        const lowestPriority = dayEvents.sort((a, b) =>
          (a.priority || 5) - (b.priority || 5)
        )[0];

        conflicts.push({
          type: 'exceeds_daily_limit',
          event1: lowestPriority,
          priority1: lowestPriority.priority || 5,
          suggestedResolution: `Reschedule or decline to stay under ${maxMeetingsPerDay} meetings/day`,
          resolutionOptions: this.generateDailyLimitResolutions(lowestPriority),
          autoResolvable: lowestPriority.isFlexible || false
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate optimization suggestions
   */
  private async generateOptimizations(
    events: CalendarEvent[],
    preferences: any,
    userId: UserId
  ): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Optimization 1: Batch meetings together
    if (preferences.batchMeetings) {
      const batchingOpp = this.suggestMeetingBatching(events);
      if (batchingOpp) {
        optimizations.push(batchingOpp);
      }
    }

    // Optimization 2: Protect focus time
    const focusTimeOpp = this.suggestFocusTimeProtection(events, preferences);
    if (focusTimeOpp) {
      optimizations.push(focusTimeOpp);
    }

    // Optimization 3: Balance meeting load across week
    const balanceOpp = this.suggestLoadBalancing(events, preferences);
    if (balanceOpp) {
      optimizations.push(balanceOpp);
    }

    // Optimization 4: Reduce context switching
    const contextOpp = this.suggestReduceContextSwitching(events);
    if (contextOpp) {
      optimizations.push(contextOpp);
    }

    return optimizations;
  }

  /**
   * Suggest meeting batching
   */
  private suggestMeetingBatching(events: CalendarEvent[]): Optimization | null {
    const sortedEvents = [...events].sort((a, b) =>
      a.startTime.getTime() - b.startTime.getTime()
    );

    const isolatedMeetings = sortedEvents.filter((event, index) => {
      const prev = sortedEvents[index - 1];
      const next = sortedEvents[index + 1];

      const prevGap = prev ? (event.startTime.getTime() - prev.endTime.getTime()) / (1000 * 60) : 999;
      const nextGap = next ? (next.startTime.getTime() - event.endTime.getTime()) / (1000 * 60) : 999;

      return prevGap > 60 && nextGap > 60; // Isolated if >1hr gap on both sides
    });

    if (isolatedMeetings.length < 2) return null;

    return {
      type: 'batch_meetings',
      currentState: { isolatedCount: isolatedMeetings.length },
      suggestedState: { suggestBatching: true },
      reasoning: `${isolatedMeetings.length} isolated meetings could be batched together to reduce context switching`,
      impactScore: Math.min(isolatedMeetings.length * 0.2, 1.0),
      estimatedTimeSavedMinutes: isolatedMeetings.length * 15, // 15min saved per meeting
      affectedEvents: isolatedMeetings.slice(0, 3)
    };
  }

  /**
   * Suggest focus time protection
   */
  private suggestFocusTimeProtection(events: CalendarEvent[], preferences: any): Optimization | null {
    if (!preferences.focusTimeBlocks || preferences.focusTimeBlocks.length === 0) {
      return {
        type: 'protect_focus_time',
        currentState: { focusTimeBlocks: 0 },
        suggestedState: { suggestFocusTime: true },
        reasoning: 'No focus time blocks configured. Consider blocking 2-3 hour periods for deep work',
        impactScore: 0.8,
        estimatedTimeSavedMinutes: 120,
        affectedEvents: []
      };
    }

    return null;
  }

  /**
   * Suggest load balancing
   */
  private suggestLoadBalancing(events: CalendarEvent[], preferences: any): Optimization | null {
    const eventsByDay = this.groupEventsByDay(events);
    const counts = Object.values(eventsByDay).map((e: any) => e.length);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    if (maxCount - minCount > 3) {
      return {
        type: 'balance_load',
        currentState: { maxPerDay: maxCount, minPerDay: minCount },
        suggestedState: { balanced: true },
        reasoning: `Meeting load unbalanced: ${maxCount} meetings on busiest day vs ${minCount} on lightest`,
        impactScore: 0.7,
        estimatedTimeSavedMinutes: 30,
        affectedEvents: []
      };
    }

    return null;
  }

  /**
   * Suggest reducing context switching
   */
  private suggestReduceContextSwitching(events: CalendarEvent[]): Optimization | null {
    // Group by topic/type if we had that data
    // For now, just detect high frequency of meetings
    const avgGapMinutes = this.calculateAverageGap(events);

    if (avgGapMinutes < 30) {
      return {
        type: 'reduce_conflicts',
        currentState: { avgGap: avgGapMinutes },
        suggestedState: { targetGap: 45 },
        reasoning: 'Meetings are too tightly packed. Consider 45min gaps for preparation and transitions',
        impactScore: 0.6,
        estimatedTimeSavedMinutes: events.length * 5,
        affectedEvents: []
      };
    }

    return null;
  }

  /**
   * Check if events overlap
   */
  private eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return (
      event1.startTime < event2.endTime &&
      event2.startTime < event1.endTime
    );
  }

  /**
   * Check if events exactly overlap (double booking)
   */
  private eventsExactlyOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return (
      event1.startTime.getTime() === event2.startTime.getTime() ||
      event1.endTime.getTime() === event2.endTime.getTime()
    );
  }

  /**
   * Check if event violates focus time
   */
  private violatesFocusTime(event: CalendarEvent, focusBlock: any): boolean {
    const eventHour = event.startTime.getHours();
    const eventMinute = event.startTime.getMinutes();
    const [focusStartHour, focusStartMinute] = focusBlock.start.split(':').map(Number);
    const [focusEndHour, focusEndMinute] = focusBlock.end.split(':').map(Number);

    const eventMinutes = eventHour * 60 + eventMinute;
    const focusStartMinutes = focusStartHour * 60 + focusStartMinute;
    const focusEndMinutes = focusEndHour * 60 + focusEndMinute;

    return eventMinutes >= focusStartMinutes && eventMinutes < focusEndMinutes;
  }

  /**
   * Suggest conflict resolution
   */
  private suggestResolution(event1: CalendarEvent, event2: CalendarEvent, type: string): string {
    const priority1 = event1.priority || 5;
    const priority2 = event2.priority || 5;

    if (priority1 > priority2) {
      return `Keep "${event1.title}", reschedule "${event2.title}"`;
    } else if (priority2 > priority1) {
      return `Keep "${event2.title}", reschedule "${event1.title}"`;
    } else {
      return `Both meetings have equal priority - manual decision needed`;
    }
  }

  /**
   * Generate resolution options
   */
  private generateResolutionOptions(event1: CalendarEvent, event2: CalendarEvent): ResolutionOption[] {
    const options: ResolutionOption[] = [];

    // Option 1: Reschedule lower priority event
    const lowerPriority = (event1.priority || 5) <= (event2.priority || 5) ? event1 : event2;
    options.push({
      action: 'reschedule',
      description: `Reschedule "${lowerPriority.title}" to next available slot`,
      impactScore: 0.3,
      newTime: this.findNextAvailableSlot(lowerPriority)
    });

    // Option 2: Shorten meetings
    if (!event1.isRecurring && !event2.isRecurring) {
      options.push({
        action: 'shorten',
        description: 'Shorten both meetings to eliminate overlap',
        impactScore: 0.5
      });
    }

    // Option 3: Accept conflict
    options.push({
      action: 'accept_conflict',
      description: 'Keep both meetings (may require delegating one)',
      impactScore: 0.8
    });

    return options;
  }

  /**
   * Generate back-to-back resolution options
   */
  private generateBackToBackResolutions(event1: CalendarEvent, event2: CalendarEvent, preferences: any): ResolutionOption[] {
    const gap = preferences.minGapBetweenMeetingsMinutes || 15;

    return [
      {
        action: 'reschedule',
        description: `Add ${gap}min buffer by rescheduling "${event2.title}"`,
        impactScore: 0.2,
        newTime: {
          start: new Date(event1.endTime.getTime() + gap * 60 * 1000),
          end: new Date(event1.endTime.getTime() + gap * 60 * 1000 + (event2.endTime.getTime() - event2.startTime.getTime()))
        }
      },
      {
        action: 'accept_conflict',
        description: 'Keep back-to-back (may be tiring)',
        impactScore: 0.6
      }
    ];
  }

  /**
   * Generate focus time violation resolutions
   */
  private generateFocusTimeResolutions(event: CalendarEvent, focusBlock: any): ResolutionOption[] {
    return [
      {
        action: 'reschedule',
        description: `Move to after ${focusBlock.end}`,
        impactScore: 0.3
      },
      {
        action: 'reschedule',
        description: `Move to before ${focusBlock.start}`,
        impactScore: 0.3
      },
      {
        action: 'accept_conflict',
        description: 'Keep meeting during focus time',
        impactScore: 0.7
      }
    ];
  }

  /**
   * Generate daily limit resolutions
   */
  private generateDailyLimitResolutions(event: CalendarEvent): ResolutionOption[] {
    return [
      {
        action: 'reschedule',
        description: 'Move to next day with capacity',
        impactScore: 0.4
      },
      {
        action: 'decline',
        description: 'Decline this meeting',
        impactScore: 0.6
      }
    ];
  }

  /**
   * Check if conflict is auto-resolvable
   */
  private isAutoResolvable(event1: CalendarEvent, event2: CalendarEvent): boolean {
    const priority1 = event1.priority || 5;
    const priority2 = event2.priority || 5;

    // Auto-resolvable if priorities differ significantly and lower priority is flexible
    return (
      Math.abs(priority1 - priority2) >= 3 &&
      (event1.isFlexible || event2.isFlexible || false)
    );
  }

  /**
   * Find next available time slot
   */
  private findNextAvailableSlot(event: CalendarEvent): { start: Date; end: Date } {
    const duration = event.endTime.getTime() - event.startTime.getTime();
    const nextDay = new Date(event.startTime);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(10, 0, 0, 0); // Default to 10 AM next day

    return {
      start: nextDay,
      end: new Date(nextDay.getTime() + duration)
    };
  }

  /**
   * Group events by day
   */
  private groupEventsByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
    const grouped: Record<string, CalendarEvent[]> = {};

    for (const event of events) {
      const day = event.startTime.toISOString().split('T')[0];
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(event);
    }

    return grouped;
  }

  /**
   * Calculate average gap between meetings
   */
  private calculateAverageGap(events: CalendarEvent[]): number {
    const sorted = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const gaps: number[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = (sorted[i + 1].startTime.getTime() - sorted[i].endTime.getTime()) / (1000 * 60);
      if (gap > 0) {
        gaps.push(gap);
      }
    }

    return gaps.length > 0 ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length : 0;
  }

  /**
   * Get calendar events from database/provider
   */
  private async getCalendarEvents(userId: UserId, dateRange: { start: Date; end: Date }): Promise<CalendarEvent[]> {
    // This would fetch from calendar provider
    // For now, return empty array
    return [];
  }

  /**
   * Get scheduling preferences - now from users.settings
   */
  private async getSchedulingPreferences(userId: UserId): Promise<any> {
    const { data } = await this.db
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single();

    if (!data || !data.settings) {
      return {
        minGapBetweenMeetingsMinutes: 15,
        maxMeetingsPerDay: 6,
        batchMeetings: true,
        focusTimeBlocks: []
      };
    }

    const settings = data.settings as UserSettings;
    // Return scheduling-related settings
    return {
      minGapBetweenMeetingsMinutes: 15,
      maxMeetingsPerDay: 6,
      batchMeetings: true,
      focusTimeBlocks: [],
      ...settings // Merge with any scheduling-specific settings in UserSettings
    };
  }

  /**
   * Save conflict to database - stores in events.intelligence.conflicts
   */
  private async saveConflict(conflict: Conflict, userId: UserId): Promise<void> {
    const conflictData = {
      type: conflict.type,
      description: conflict.suggestedResolution,
      suggested_resolution: conflict.resolutionOptions[0]?.description || conflict.suggestedResolution
    };

    // Store conflict in first event's intelligence
    const { data: event1 } = await this.db
      .from('events')
      .select('intelligence')
      .eq('id', conflict.event1.id)
      .eq('user_id', userId)
      .single();

    if (event1) {
      const intelligence1 = event1.intelligence as EventIntelligence || getDefaultEventIntelligence();
      const updatedIntelligence1 = {
        ...intelligence1,
        conflicts: [...intelligence1.conflicts, conflictData]
      };

      await this.db
        .from('events')
        .update({ intelligence: updatedIntelligence1 })
        .eq('id', conflict.event1.id)
        .eq('user_id', userId);
    }

    // If there's a second event, store conflict there too
    if (conflict.event2) {
      const { data: event2 } = await this.db
        .from('events')
        .select('intelligence')
        .eq('id', conflict.event2.id)
        .eq('user_id', userId)
        .single();

      if (event2) {
        const intelligence2 = event2.intelligence as EventIntelligence || getDefaultEventIntelligence();
        const updatedIntelligence2 = {
          ...intelligence2,
          conflicts: [...intelligence2.conflicts, conflictData]
        };

        await this.db
          .from('events')
          .update({ intelligence: updatedIntelligence2 })
          .eq('id', conflict.event2.id)
          .eq('user_id', userId);
      }
    }
  }

  /**
   * Save optimization to database - stores in events.intelligence.optimization_suggestions
   */
  private async saveOptimization(optimization: Optimization, userId: UserId): Promise<void> {
    const optimizationData = {
      type: optimization.type,
      description: optimization.reasoning,
      impact_score: optimization.impactScore
    };

    // Store optimization in all affected events
    for (const event of optimization.affectedEvents) {
      const { data } = await this.db
        .from('events')
        .select('intelligence')
        .eq('id', event.id)
        .eq('user_id', userId)
        .single();

      if (data) {
        const intelligence = data.intelligence as EventIntelligence || getDefaultEventIntelligence();
        const updatedIntelligence = {
          ...intelligence,
          optimization_suggestions: [...intelligence.optimization_suggestions, optimizationData]
        };

        await this.db
          .from('events')
          .update({ intelligence: updatedIntelligence })
          .eq('id', event.id)
          .eq('user_id', userId);
      }
    }
  }

  private getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }
}
