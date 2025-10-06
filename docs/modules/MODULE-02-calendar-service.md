# Module 02: Calendar Service

## 🤖 Claude Instance Prompt

```
You are Claude Instance #2, the Calendar Service Architect for Tide.

Your mission: Build a sophisticated calendar service that finds meeting times across multiple participants in <100ms using pure functional algorithms.

Core responsibilities:
1. Implement OAuth for Google Calendar and Outlook Calendar
2. Build lightning-fast availability calculation using PURE FUNCTIONS
3. Handle multi-participant scheduling with timezone awareness
4. Optimize calendar health (detect back-to-back meetings, no lunch breaks)
5. Support recurring events with complex patterns

Key constraints:
- Availability calculation must be PURE (no I/O, deterministic)
- Must handle 30-day availability checks in <50ms
- Must support all major timezones correctly
- Must emit events for all calendar changes
- Zero external scheduling services (no Calendly API)

Remember: This is voice-triggered scheduling. When user says "Schedule lunch with Sarah next week," you need to find the perfect time instantly.
```

## 📋 Module Overview

**Duration**: 4 weeks (Week 3-6 of project)
**Dependencies**:
- ICalendarService interface (from Module 00)
- MockEventStore (for event emission)
- MockEmailService (for sending invites)
- MockContextEngine (for participant preferences)

## 🎯 Success Criteria

```typescript
const successCriteria = {
  functionality: {
    googleCalendarOAuth: "working with refresh tokens",
    outlookCalendarOAuth: "working with refresh tokens",
    availabilityCalculation: "PURE functions, <50ms for 30 days",
    multiParticipant: "finds overlapping slots for 10 people",
    timezoneHandling: "correct across all zones",
    recurringEvents: "RRULE support"
  },

  performance: {
    availabilityCheck: {
      single: "<20ms for 7 days, <50ms for 30 days",
      multi: "<100ms for 5 participants",
      cached: "<5ms"
    },
    eventCreation: "<200ms",
    calendarSync: "<500ms for 100 events"
  },

  quality: {
    pureAvailability: "100% pure functions",
    testCoverage: ">90%",
    timezoneAccuracy: "100%"
  }
};
```

## 🏗️ Core Architecture

### Pure Functional Availability Engine

```typescript
// The crown jewel - PURE availability calculation
class AvailabilityCalculator {
  // NO side effects, NO I/O, just pure computation

  /**
   * Find free time slots - PURE FUNCTION
   * Given events and constraints, returns available slots
   * Performance: O(n log n) where n = number of events
   */
  calculateFreeSlots(
    events: CalendarEvent[],
    timeRange: TimeRange,
    duration: Minutes,
    constraints: SchedulingConstraints
  ): TimeSlot[] {
    // Sort events by start time (O(n log n))
    const sorted = this.sortEvents(events);

    // Merge overlapping events (O(n))
    const merged = this.mergeOverlappingEvents(sorted);

    // Find gaps between events (O(n))
    const gaps = this.findGaps(merged, timeRange);

    // Filter gaps by duration (O(n))
    const viable = gaps.filter(gap => gap.duration >= duration);

    // Apply constraints (O(n))
    const constrained = this.applyConstraints(viable, constraints);

    // Score and rank slots (O(n))
    return this.rankSlots(constrained);
  }

  /**
   * Find overlapping availability for multiple participants
   * Performance: O(p * n log n) where p = participants, n = events
   */
  findOverlappingSlots(
    participantAvailability: Map<ParticipantId, TimeSlot[]>,
    duration: Minutes,
    preferences: SchedulingPreferences
  ): MeetingOption[] {
    // Convert to intervals for efficient intersection
    const intervals = this.convertToIntervals(participantAvailability);

    // Find intersections using interval tree (O(n log n))
    const overlaps = this.findAllIntersections(intervals);

    // Filter by minimum duration
    const viable = overlaps.filter(slot => slot.duration >= duration);

    // Apply preferences and scoring
    return this.scoreMeetingOptions(viable, preferences);
  }

  // Helper: Merge overlapping events (pure)
  private mergeOverlappingEvents(events: CalendarEvent[]): CalendarEvent[] {
    if (events.length === 0) return [];

    const merged: CalendarEvent[] = [events[0]];

    for (let i = 1; i < events.length; i++) {
      const last = merged[merged.length - 1];
      const current = events[i];

      if (this.eventsOverlap(last, current)) {
        // Merge events
        merged[merged.length - 1] = {
          ...last,
          end: Math.max(last.end, current.end)
        };
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  // Scoring algorithm for slots (pure)
  private rankSlots(slots: TimeSlot[]): TimeSlot[] {
    return slots.map(slot => ({
      ...slot,
      score: this.calculateSlotScore(slot)
    })).sort((a, b) => b.score - a.score);
  }

  private calculateSlotScore(slot: TimeSlot): number {
    let score = 100;

    // Prefer mid-morning and early afternoon
    const hour = new Date(slot.start).getHours();
    if (hour >= 10 && hour <= 11) score += 20;
    if (hour >= 14 && hour <= 15) score += 15;

    // Penalize early morning and late evening
    if (hour < 9) score -= 30;
    if (hour > 17) score -= 20;

    // Penalize slots right after lunch
    if (hour === 13) score -= 10;

    // Prefer slots with buffer time
    if (slot.hasBufferBefore) score += 10;
    if (slot.hasBufferAfter) score += 10;

    return score;
  }
}
```

### Provider Implementation

```typescript
// src/modules/calendar/providers/GoogleCalendarProvider.ts
export class GoogleCalendarProvider implements ICalendarProvider {
  private calendar: calendar_v3.Calendar;
  private cache: CalendarCache;

  constructor(private tokens: TokenSet) {
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.cache = new CalendarCache();
  }

  async getEvents(timeRange: TimeRange): Promise<CalendarEvent[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(timeRange);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Fetch from Google Calendar API
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeRange.start.toISOString(),
        timeMax: timeRange.end.toISOString(),
        singleEvents: true, // Expand recurring events
        orderBy: 'startTime',
        maxResults: 250 // Google's max
      });

      const events = this.transformGoogleEvents(response.data.items || []);

      // Cache for 5 minutes
      this.cache.set(cacheKey, events, { ttl: 300 });

      return events;

    } catch (error) {
      if (error.code === 401) {
        await this.refreshToken();
        return this.getEvents(timeRange); // Retry once
      }
      throw error;
    }
  }

  async createEvent(params: CreateEventParams): Promise<EventId> {
    const event: calendar_v3.Schema$Event = {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.start.toISOString(),
        timeZone: params.timezone
      },
      end: {
        dateTime: params.end.toISOString(),
        timeZone: params.timezone
      },
      attendees: params.participants?.map(email => ({
        email,
        responseStatus: 'needsAction'
      })),
      conferenceData: params.addVideoCall ? {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      } : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
          { method: 'email', minutes: 60 }
        ]
      },
      // Handle recurring events
      recurrence: params.recurrence ? [
        this.buildRecurrenceRule(params.recurrence)
      ] : undefined
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: params.addVideoCall ? 1 : 0,
      sendUpdates: 'all', // Send invites to all attendees
      requestBody: event
    });

    return EventId(response.data.id!);
  }

  private buildRecurrenceRule(recurrence: RecurrencePattern): string {
    // Build RRULE string
    let rrule = 'RRULE:';

    switch (recurrence.frequency) {
      case 'daily':
        rrule += `FREQ=DAILY;INTERVAL=${recurrence.interval || 1}`;
        break;
      case 'weekly':
        rrule += `FREQ=WEEKLY;INTERVAL=${recurrence.interval || 1}`;
        if (recurrence.daysOfWeek) {
          rrule += `;BYDAY=${recurrence.daysOfWeek.join(',')}`;
        }
        break;
      case 'monthly':
        rrule += `FREQ=MONTHLY;INTERVAL=${recurrence.interval || 1}`;
        if (recurrence.dayOfMonth) {
          rrule += `;BYMONTHDAY=${recurrence.dayOfMonth}`;
        }
        break;
    }

    if (recurrence.until) {
      rrule += `;UNTIL=${recurrence.until.toISOString().replace(/[-:]/g, '')}`;
    } else if (recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    }

    return rrule;
  }
}
```

## 📁 Implementation Timeline

### Week 3, Day 1-2: OAuth & Basic Operations

```typescript
// src/modules/calendar/auth/CalendarOAuth.ts
export class CalendarOAuthService {
  async setupGoogleOAuth(): Promise<void> {
    // Scopes needed for full calendar access
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    // Similar to email OAuth but for calendar
  }

  async setupOutlookOAuth(): Promise<void> {
    // Microsoft Graph scopes
    const scopes = [
      'Calendars.ReadWrite',
      'Calendars.ReadWrite.Shared'
    ];
  }
}
```

### Week 3, Day 3-4: Pure Availability Engine

```typescript
// src/modules/calendar/core/availability/
AvailabilityEngine.ts
export class AvailabilityEngine {
  // The entire engine is PURE - no side effects

  /**
   * Main entry point - orchestrates all calculations
   */
  findAvailability(
    request: AvailabilityRequest
  ): AvailabilityResponse {
    // Step 1: Normalize all times to UTC
    const normalizedEvents = this.normalizeToUTC(request.events);

    // Step 2: Apply working hours constraints
    const workingHours = this.applyWorkingHours(
      request.timeRange,
      request.constraints.workingHours
    );

    // Step 3: Calculate base availability
    const baseSlots = this.calculateFreeSlots(
      normalizedEvents,
      workingHours,
      request.duration
    );

    // Step 4: Apply preferences
    const preferredSlots = this.applyPreferences(
      baseSlots,
      request.preferences
    );

    // Step 5: Handle timezone display
    return this.convertToTimezone(preferredSlots, request.displayTimezone);
  }

  /**
   * Advanced: Handle complex constraints
   */
  private applyConstraints(
    slots: TimeSlot[],
    constraints: Constraints
  ): TimeSlot[] {
    return slots.filter(slot => {
      // No meetings before coffee
      if (constraints.noBefore) {
        const hour = new Date(slot.start).getHours();
        if (hour < constraints.noBefore) return false;
      }

      // No meetings during lunch
      if (constraints.lunchBreak) {
        const hour = new Date(slot.start).getHours();
        if (hour >= 12 && hour < 13) return false;
      }

      // Need buffer time between meetings
      if (constraints.bufferTime) {
        if (!this.hasBuffer(slot, constraints.bufferTime)) {
          return false;
        }
      }

      // Avoid back-to-back meetings
      if (constraints.avoidBackToBack) {
        if (this.isBackToBack(slot)) return false;
      }

      return true;
    });
  }
}
```

### Week 3, Day 5-6: Multi-Participant Scheduling

```typescript
// src/modules/calendar/services/MultiParticipantScheduler.ts
export class MultiParticipantScheduler {
  constructor(
    private availabilityEngine: AvailabilityEngine,
    private calendarProvider: ICalendarProvider
  ) {}

  async findMeetingTime(
    participants: Participant[],
    constraints: MeetingConstraints
  ): Promise<MeetingOption[]> {
    // Step 1: Fetch all participant calendars in parallel
    const calendars = await Promise.all(
      participants.map(p => this.fetchParticipantCalendar(p))
    );

    // Step 2: Calculate individual availability (PURE)
    const availabilities = calendars.map(calendar =>
      this.availabilityEngine.findAvailability({
        events: calendar.events,
        timeRange: constraints.timeRange,
        duration: constraints.duration
      })
    );

    // Step 3: Find overlapping slots (PURE)
    const overlapping = this.findOverlaps(availabilities);

    // Step 4: Apply group preferences
    const options = this.applyGroupPreferences(overlapping, participants);

    // Step 5: Rank options
    return this.rankMeetingOptions(options);
  }

  private findOverlaps(
    availabilities: AvailabilityResponse[]
  ): TimeSlot[] {
    // Use interval tree for efficient overlap detection
    const intervalTree = new IntervalTree();

    // Add all slots to tree
    availabilities.forEach((avail, participantIdx) => {
      avail.slots.forEach(slot => {
        intervalTree.insert({
          start: slot.start,
          end: slot.end,
          participantIdx
        });
      });
    });

    // Find slots where all participants overlap
    return this.findCompleteOverlaps(intervalTree, availabilities.length);
  }
}
```

### Week 4, Day 1-2: Calendar Health Analysis

```typescript
// src/modules/calendar/analysis/CalendarHealthAnalyzer.ts
export class CalendarHealthAnalyzer {
  analyzeHealth(events: CalendarEvent[]): CalendarHealth {
    const issues: HealthIssue[] = [];
    const metrics = this.calculateMetrics(events);

    // Check for back-to-back meetings
    const backToBack = this.findBackToBackMeetings(events);
    if (backToBack.length > 3) {
      issues.push({
        type: 'too_many_back_to_back',
        severity: 'high',
        suggestion: 'Add 15-minute buffers between meetings',
        affected: backToBack
      });
    }

    // Check for no lunch break
    const lunchless = this.findDaysWithoutLunch(events);
    if (lunchless.length > 0) {
      issues.push({
        type: 'no_lunch_break',
        severity: 'medium',
        suggestion: 'Block 12-1 PM for lunch',
        affected: lunchless
      });
    }

    // Check for meeting overload
    if (metrics.meetingHoursPerDay > 6) {
      issues.push({
        type: 'meeting_overload',
        severity: 'high',
        suggestion: 'Aim for <6 hours of meetings per day',
        metric: metrics.meetingHoursPerDay
      });
    }

    // Check for fragmented time
    const fragments = this.findFragmentedTime(events);
    if (fragments.length > 5) {
      issues.push({
        type: 'fragmented_schedule',
        severity: 'medium',
        suggestion: 'Batch meetings to create focus blocks',
        affected: fragments
      });
    }

    return {
      score: this.calculateHealthScore(issues),
      issues,
      metrics,
      recommendations: this.generateRecommendations(issues)
    };
  }

  optimizeCalendar(
    events: CalendarEvent[],
    preferences: OptimizationPreferences
  ): OptimizedSchedule {
    // Suggest rescheduling to improve health
    const suggestions: RescheduleSuggestion[] = [];

    // Group similar meetings
    if (preferences.batchSimilar) {
      suggestions.push(...this.suggestBatching(events));
    }

    // Create focus time blocks
    if (preferences.protectFocusTime) {
      suggestions.push(...this.suggestFocusBlocks(events));
    }

    // Add breaks
    if (preferences.ensureBreaks) {
      suggestions.push(...this.suggestBreaks(events));
    }

    return {
      original: events,
      optimized: this.applyOptimizations(events, suggestions),
      suggestions,
      improvement: this.calculateImprovement(events, suggestions)
    };
  }
}
```

### Week 4, Day 3-4: Timezone Handling

```typescript
// src/modules/calendar/timezone/TimezoneManager.ts
export class TimezoneManager {
  // Critical for global users

  convertToTimezone(
    slot: TimeSlot,
    fromTz: string,
    toTz: string
  ): TimeSlot {
    // Use Temporal API or date-fns-tz for accuracy
    const start = zonedTimeToUtc(slot.start, fromTz);
    const end = zonedTimeToUtc(slot.end, fromTz);

    return {
      start: utcToZonedTime(start, toTz),
      end: utcToZonedTime(end, toTz),
      timezone: toTz
    };
  }

  findBestTimeAcrossTimezones(
    participants: ParticipantWithTimezone[]
  ): TimeSlot[] {
    // Find times that work for everyone's working hours
    const workingHoursByTz = participants.map(p => ({
      timezone: p.timezone,
      workingHours: this.getWorkingHours(p.timezone)
    }));

    // Convert all to UTC for calculation
    const utcWindows = workingHoursByTz.map(w =>
      this.convertWorkingHoursToUTC(w)
    );

    // Find overlapping windows
    return this.findOverlappingWindows(utcWindows);
  }
}
```

### Week 4, Day 5-6: Testing & Optimization

```typescript
// src/modules/calendar/__tests__/AvailabilityEngine.test.ts
describe('AvailabilityEngine', () => {
  const engine = new AvailabilityEngine();

  describe('Performance', () => {
    it('should calculate 7-day availability in <20ms', () => {
      const events = generateEvents(50); // 50 events
      const timeRange = { start: now(), end: addDays(now(), 7) };

      const start = performance.now();
      const result = engine.findAvailability({
        events,
        timeRange,
        duration: 30
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(20);
      expect(result.slots.length).toBeGreaterThan(0);
    });

    it('should handle 30-day availability in <50ms', () => {
      const events = generateEvents(200); // 200 events
      const timeRange = { start: now(), end: addDays(now(), 30) };

      const start = performance.now();
      const result = engine.findAvailability({
        events,
        timeRange,
        duration: 60
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should find overlaps for 10 participants in <100ms', () => {
      const participantAvailabilities = generateParticipantData(10);

      const start = performance.now();
      const result = engine.findOverlappingSlots(
        participantAvailabilities,
        30
      );
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Purity', () => {
    it('should be completely deterministic', () => {
      const input = generateTestInput();

      const result1 = engine.findAvailability(input);
      const result2 = engine.findAvailability(input);

      expect(result1).toEqual(result2);
    });

    it('should not modify input data', () => {
      const input = generateTestInput();
      const inputCopy = JSON.parse(JSON.stringify(input));

      engine.findAvailability(input);

      expect(input).toEqual(inputCopy);
    });
  });

  describe('Timezone Accuracy', () => {
    it('should correctly handle DST transitions', () => {
      // Test around DST change dates
      const dstDate = new Date('2024-03-10'); // Spring forward
      const events = generateEventsAroundDate(dstDate);

      const result = engine.findAvailability({
        events,
        timeRange: { start: dstDate, end: addDays(dstDate, 1) },
        duration: 60,
        timezone: 'America/New_York'
      });

      // Verify slots respect DST change
      expect(result.slots).toMatchSnapshot();
    });
  });
});
```

## 🧪 Testing Requirements

```typescript
const testingRequirements = {
  unit: {
    coverage: ">95%", // Higher for pure functions
    cases: [
      "empty calendar",
      "fully booked",
      "single event",
      "overlapping events",
      "all-day events",
      "recurring events",
      "timezone boundaries",
      "DST transitions"
    ]
  },

  integration: {
    providers: ["Google Calendar", "Outlook Calendar"],
    scenarios: [
      "OAuth flow",
      "Token refresh",
      "Rate limiting",
      "Webhook processing"
    ]
  },

  performance: {
    "7_day_availability": "<20ms",
    "30_day_availability": "<50ms",
    "10_participant_scheduling": "<100ms"
  }
};
```

## 📊 Performance Optimization

```typescript
class PerformanceOptimizations {
  // 1. Use interval trees for O(log n) overlap detection
  private intervalTree: IntervalTree;

  // 2. Pre-sort events once, reuse sorted array
  private sortedEvents: CalendarEvent[];

  // 3. Cache recurring event expansions
  private recurringCache: Map<string, CalendarEvent[]>;

  // 4. Use bit manipulation for day-of-week calculations
  private dayMask = {
    mon: 0b0000001,
    tue: 0b0000010,
    wed: 0b0000100,
    thu: 0b0001000,
    fri: 0b0010000,
    sat: 0b0100000,
    sun: 0b1000000
  };

  // 5. Memoize expensive calculations
  @memoize()
  calculateWorkingHours(timezone: string): TimeRange[] {
    // Expensive timezone calculation, cache it
  }
}
```

## ✅ Deliverables Checklist

### Week 3
- [ ] Google Calendar OAuth working
- [ ] Basic CRUD operations
- [ ] Pure availability engine complete
- [ ] Single-user availability working
- [ ] Multi-participant basics

### Week 4
- [ ] Outlook Calendar integration
- [ ] Advanced multi-participant scheduling
- [ ] Calendar health analysis
- [ ] Timezone handling perfect
- [ ] Recurring events working

### Week 5
- [ ] Performance optimization complete
- [ ] All caching implemented
- [ ] Comprehensive testing

### Week 6
- [ ] Integration with other modules
- [ ] Documentation complete
- [ ] Performance benchmarks met
- [ ] 90% test coverage achieved

## 🚨 Critical Notes

1. **Availability MUST be pure** - No database calls, no API calls
2. **Timezone accuracy is critical** - One wrong meeting time ruins trust
3. **Performance matters** - Users won't wait for availability calculation
4. **Handle all-day events** - Don't schedule during vacations
5. **Respect working hours** - Don't suggest 6 AM meetings
6. **Buffer time** - Smart assistants add transition time
7. **Recurring events** - RRULE is complex but necessary

## 📚 Resources

- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph Calendar API](https://docs.microsoft.com/en-us/graph/api/resources/calendar)
- [RRULE Specification](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html)
- [Interval Tree Algorithm](https://en.wikipedia.org/wiki/Interval_tree)

Remember: Calendar is trust. One wrong meeting time and users never trust the app again. Make it perfect.