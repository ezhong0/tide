import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';

export interface SchedulingRequest {
  title: string;
  attendees: string[];
  durationMinutes: number;
  preferredDateRange?: { start: Date; end: Date };
  requiredAttendees?: string[]; // Must attend
  optionalAttendees?: string[]; // Nice to have
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface TimeSlot {
  start: Date;
  end: Date;
  score: number; // 0-1, higher is better
  reasoning: string[];
  conflicts: string[];
  attendeeAvailability: Record<string, boolean>;
}

export interface SchedulingPreferences {
  focusTimeBlocks: FocusTimeBlock[];
  preferredMeetingTimes: TimeRange[];
  maxMeetingsPerDay: number;
  minGapBetweenMeetingsMinutes: number;
  preferredMeetingDurationMinutes: number;
  batchMeetings: boolean;
  protectLunchTime: boolean;
  lunchTimeStart: string;
  lunchTimeEnd: string;
  noMeetingDays: string[];
  timeZone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export interface FocusTimeBlock {
  day: string; // 'monday', 'tuesday', etc.
  start: string; // '09:00'
  end: string; // '12:00'
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface OptimizationFactor {
  name: string;
  weight: number;
  score: number;
  reasoning: string;
}

/**
 * Smart Scheduler
 * Find optimal meeting times considering preferences, availability, and productivity
 */
export class SmartScheduler {
  private db = createSupabase(true);

  /**
   * Find optimal time slots for a meeting
   */
  async findOptimalSlots(
    request: SchedulingRequest,
    userId: UserId
  ): Promise<TimeSlot[]> {
    logger.info({ userId, request }, 'Finding optimal time slots');

    // Get scheduling preferences
    const preferences = await this.getPreferences(userId);

    // Get existing calendar events
    const dateRange = request.preferredDateRange || this.getDefaultDateRange();
    const existingEvents = await this.getExistingEvents(userId, dateRange);

    // Generate candidate time slots
    const candidates = this.generateCandidateSlots(
      request,
      preferences,
      dateRange
    );

    // Score each candidate
    const scoredSlots = await Promise.all(
      candidates.map(slot => this.scoreTimeSlot(
        slot,
        request,
        preferences,
        existingEvents,
        userId
      ))
    );

    // Filter out low-scoring slots and sort
    const optimalSlots = scoredSlots
      .filter(slot => slot.score >= 0.5) // Minimum quality threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 suggestions

    logger.info({
      userId,
      candidatesCount: candidates.length,
      optimalCount: optimalSlots.length
    }, 'Found optimal slots');

    // Save suggestions
    await this.saveSuggestions(userId, request, optimalSlots);

    return optimalSlots;
  }

  /**
   * Get user scheduling preferences
   */
  private async getPreferences(userId: UserId): Promise<SchedulingPreferences> {
    const { data } = await this.db
      .from('scheduling_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      // Return defaults
      return {
        focusTimeBlocks: [
          { day: 'monday', start: '09:00', end: '12:00' },
          { day: 'wednesday', start: '09:00', end: '12:00' },
          { day: 'friday', start: '14:00', end: '17:00' }
        ],
        preferredMeetingTimes: [
          { start: '10:00', end: '11:00' },
          { start: '14:00', end: '15:00' }
        ],
        maxMeetingsPerDay: 6,
        minGapBetweenMeetingsMinutes: 15,
        preferredMeetingDurationMinutes: 30,
        batchMeetings: true,
        protectLunchTime: true,
        lunchTimeStart: '12:00',
        lunchTimeEnd: '13:00',
        noMeetingDays: [],
        timeZone: 'UTC',
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00'
      };
    }

    return {
      focusTimeBlocks: data.focus_time_blocks || [],
      preferredMeetingTimes: data.preferred_meeting_times || [],
      maxMeetingsPerDay: data.max_meetings_per_day || 6,
      minGapBetweenMeetingsMinutes: data.min_gap_between_meetings_minutes || 15,
      preferredMeetingDurationMinutes: data.preferred_meeting_duration_minutes || 30,
      batchMeetings: data.batch_meetings !== false,
      protectLunchTime: data.protect_lunch_time !== false,
      lunchTimeStart: data.lunch_time_start || '12:00',
      lunchTimeEnd: data.lunch_time_end || '13:00',
      noMeetingDays: data.no_meeting_days || [],
      timeZone: data.time_zone || 'UTC',
      workingHoursStart: data.working_hours_start || '09:00',
      workingHoursEnd: data.working_hours_end || '17:00'
    };
  }

  /**
   * Get existing calendar events
   */
  private async getExistingEvents(
    userId: UserId,
    dateRange: { start: Date; end: Date }
  ): Promise<any[]> {
    // This would call the calendar provider API
    // For now, return empty array
    return [];
  }

  /**
   * Generate candidate time slots
   */
  private generateCandidateSlots(
    request: SchedulingRequest,
    preferences: SchedulingPreferences,
    dateRange: { start: Date; end: Date }
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    while (current <= end) {
      // Skip weekends if not in working days
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Skip no-meeting days
      const dayName = this.getDayName(current).toLowerCase();
      if (preferences.noMeetingDays.includes(dayName)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Generate slots for this day
      const workStart = this.parseTime(preferences.workingHoursStart);
      const workEnd = this.parseTime(preferences.workingHoursEnd);

      for (let hour = workStart.hour; hour < workEnd.hour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(current);
          slotStart.setHours(hour, minute, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + request.durationMinutes);

          // Check if slot is within working hours
          if (slotEnd.getHours() > workEnd.hour ||
              (slotEnd.getHours() === workEnd.hour && slotEnd.getMinutes() > workEnd.minute)) {
            break;
          }

          slots.push({
            start: slotStart,
            end: slotEnd,
            score: 0,
            reasoning: [],
            conflicts: [],
            attendeeAvailability: {}
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  /**
   * Score a time slot
   */
  private async scoreTimeSlot(
    slot: TimeSlot,
    request: SchedulingRequest,
    preferences: SchedulingPreferences,
    existingEvents: any[],
    userId: UserId
  ): Promise<TimeSlot> {
    const factors: OptimizationFactor[] = [];

    // Factor 1: Respects focus time (weight: 0.25)
    const focusTimeScore = this.scoreFocusTime(slot, preferences);
    factors.push({
      name: 'Focus Time Protection',
      weight: 0.25,
      score: focusTimeScore,
      reasoning: focusTimeScore > 0.5 ? 'Does not conflict with focus time' : 'Conflicts with protected focus time'
    });

    // Factor 2: Preferred meeting times (weight: 0.20)
    const preferredTimeScore = this.scorePreferredTime(slot, preferences);
    factors.push({
      name: 'Preferred Time',
      weight: 0.20,
      score: preferredTimeScore,
      reasoning: preferredTimeScore > 0.5 ? 'Within preferred meeting hours' : 'Outside preferred times'
    });

    // Factor 3: Meeting batching (weight: 0.15)
    const batchingScore = this.scoreBatching(slot, existingEvents, preferences);
    factors.push({
      name: 'Meeting Batching',
      weight: 0.15,
      score: batchingScore,
      reasoning: batchingScore > 0.5 ? 'Groups meetings together' : 'Isolated meeting time'
    });

    // Factor 4: Daily meeting limit (weight: 0.15)
    const dailyLimitScore = this.scoreDailyLimit(slot, existingEvents, preferences);
    factors.push({
      name: 'Daily Meeting Limit',
      weight: 0.15,
      score: dailyLimitScore,
      reasoning: dailyLimitScore > 0.5 ? 'Within daily meeting limit' : 'Exceeds recommended meeting count'
    });

    // Factor 5: Gaps between meetings (weight: 0.10)
    const gapScore = this.scoreGaps(slot, existingEvents, preferences);
    factors.push({
      name: 'Meeting Gaps',
      weight: 0.10,
      score: gapScore,
      reasoning: gapScore > 0.5 ? 'Adequate gap for transitions' : 'Too close to other meetings'
    });

    // Factor 6: Lunch time protection (weight: 0.10)
    const lunchScore = this.scoreLunchTime(slot, preferences);
    factors.push({
      name: 'Lunch Protection',
      weight: 0.10,
      score: lunchScore,
      reasoning: lunchScore > 0.5 ? 'Does not conflict with lunch' : 'Conflicts with lunch time'
    });

    // Factor 7: Time of day energy (weight: 0.05)
    const energyScore = this.scoreEnergyLevel(slot);
    factors.push({
      name: 'Energy Level',
      weight: 0.05,
      score: energyScore,
      reasoning: energyScore > 0.7 ? 'High energy time' : energyScore > 0.4 ? 'Moderate energy' : 'Low energy time'
    });

    // Calculate weighted score
    const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);

    slot.score = totalScore;
    slot.reasoning = factors
      .filter(f => f.score > 0.7 || f.score < 0.3)
      .map(f => `${f.name}: ${f.reasoning}`);

    return slot;
  }

  /**
   * Score focus time protection
   */
  private scoreFocusTime(slot: TimeSlot, preferences: SchedulingPreferences): number {
    const dayName = this.getDayName(slot.start).toLowerCase();
    const focusBlock = preferences.focusTimeBlocks.find(block => block.day === dayName);

    if (!focusBlock) return 1.0; // No focus time this day

    const blockStart = this.parseTime(focusBlock.start);
    const blockEnd = this.parseTime(focusBlock.end);
    const slotTime = { hour: slot.start.getHours(), minute: slot.start.getMinutes() };

    const slotMinutes = slotTime.hour * 60 + slotTime.minute;
    const focusStartMinutes = blockStart.hour * 60 + blockStart.minute;
    const focusEndMinutes = blockEnd.hour * 60 + blockEnd.minute;

    if (slotMinutes >= focusStartMinutes && slotMinutes < focusEndMinutes) {
      return 0.0; // Conflicts with focus time
    }

    return 1.0; // No conflict
  }

  /**
   * Score preferred meeting time
   */
  private scorePreferredTime(slot: TimeSlot, preferences: SchedulingPreferences): number {
    const slotTime = { hour: slot.start.getHours(), minute: slot.start.getMinutes() };
    const slotMinutes = slotTime.hour * 60 + slotTime.minute;

    for (const preferred of preferences.preferredMeetingTimes) {
      const start = this.parseTime(preferred.start);
      const end = this.parseTime(preferred.end);
      const startMinutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;

      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        return 1.0; // Within preferred time
      }
    }

    return 0.5; // Not in preferred times but acceptable
  }

  /**
   * Score meeting batching
   */
  private scoreBatching(slot: TimeSlot, existingEvents: any[], preferences: SchedulingPreferences): number {
    if (!preferences.batchMeetings) return 0.5;

    // Check if there are adjacent meetings
    const hasAdjacentMeeting = existingEvents.some(event => {
      const eventEnd = new Date(event.endTime);
      const eventStart = new Date(event.startTime);
      const gapBefore = (slot.start.getTime() - eventEnd.getTime()) / (1000 * 60);
      const gapAfter = (eventStart.getTime() - slot.end.getTime()) / (1000 * 60);

      return (gapBefore >= 0 && gapBefore <= 30) || (gapAfter >= 0 && gapAfter <= 30);
    });

    return hasAdjacentMeeting ? 1.0 : 0.3;
  }

  /**
   * Score daily meeting limit
   */
  private scoreDailyLimit(slot: TimeSlot, existingEvents: any[], preferences: SchedulingPreferences): number {
    const dayStart = new Date(slot.start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const meetingsToday = existingEvents.filter(event => {
      const eventTime = new Date(event.startTime);
      return eventTime >= dayStart && eventTime <= dayEnd;
    }).length;

    if (meetingsToday >= preferences.maxMeetingsPerDay) {
      return 0.0; // Exceeds limit
    }

    const ratio = meetingsToday / preferences.maxMeetingsPerDay;
    return 1.0 - ratio; // Lower score as approaching limit
  }

  /**
   * Score gaps between meetings
   */
  private scoreGaps(slot: TimeSlot, existingEvents: any[], preferences: SchedulingPreferences): number {
    const minGap = preferences.minGapBetweenMeetingsMinutes;

    for (const event of existingEvents) {
      const eventEnd = new Date(event.endTime);
      const eventStart = new Date(event.startTime);

      const gapBefore = (slot.start.getTime() - eventEnd.getTime()) / (1000 * 60);
      const gapAfter = (eventStart.getTime() - slot.end.getTime()) / (1000 * 60);

      if ((gapBefore > 0 && gapBefore < minGap) || (gapAfter > 0 && gapAfter < minGap)) {
        return 0.0; // Insufficient gap
      }
    }

    return 1.0; // Adequate gaps
  }

  /**
   * Score lunch time protection
   */
  private scoreLunchTime(slot: TimeSlot, preferences: SchedulingPreferences): number {
    if (!preferences.protectLunchTime) return 0.5;

    const lunchStart = this.parseTime(preferences.lunchTimeStart);
    const lunchEnd = this.parseTime(preferences.lunchTimeEnd);
    const slotTime = { hour: slot.start.getHours(), minute: slot.start.getMinutes() };

    const slotMinutes = slotTime.hour * 60 + slotTime.minute;
    const lunchStartMinutes = lunchStart.hour * 60 + lunchStart.minute;
    const lunchEndMinutes = lunchEnd.hour * 60 + lunchEnd.minute;

    if (slotMinutes >= lunchStartMinutes && slotMinutes < lunchEndMinutes) {
      return 0.0; // Conflicts with lunch
    }

    return 1.0; // No conflict
  }

  /**
   * Score based on time of day energy levels
   */
  private scoreEnergyLevel(slot: TimeSlot): number {
    const hour = slot.start.getHours();

    // Morning (9-11): High energy
    if (hour >= 9 && hour < 11) return 0.9;

    // Late morning (11-12): Good energy
    if (hour >= 11 && hour < 12) return 0.8;

    // Early afternoon (13-14): Moderate energy (post-lunch dip)
    if (hour >= 13 && hour < 14) return 0.6;

    // Mid afternoon (14-16): Good energy
    if (hour >= 14 && hour < 16) return 0.8;

    // Late afternoon (16-17): Declining energy
    if (hour >= 16 && hour < 17) return 0.7;

    // Early morning or late: Lower energy
    return 0.5;
  }

  /**
   * Save scheduling suggestions
   */
  private async saveSuggestions(
    userId: UserId,
    request: SchedulingRequest,
    slots: TimeSlot[]
  ): Promise<void> {
    await this.db.from('smart_scheduling_suggestions').insert({
      user_id: userId,
      meeting_title: request.title,
      attendees: request.attendees,
      duration_minutes: request.durationMinutes,
      suggested_time_slots: slots.map(s => ({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        score: s.score
      })),
      reasoning: slots[0]?.reasoning || [],
      optimization_factors: ['focus_time', 'preferred_times', 'batching', 'energy_level'],
      confidence: slots[0]?.score || 0.5
    });
  }

  /**
   * Parse time string to hours and minutes
   */
  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * Get day name from date
   */
  private getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Get default date range (next 2 weeks)
   */
  private getDefaultDateRange(): { start: Date; end: Date } {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    return { start, end };
  }
}
