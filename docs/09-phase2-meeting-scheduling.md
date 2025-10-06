# Phase 2: Meeting Scheduling Flow (Weeks 7-10)

## Philosophy Alignment

**Goal**: Complete end-to-end meeting scheduling from voice command → meeting confirmed in calendars

**Core Principle**: Build the flagship feature that demonstrates the product's value proposition: "15 messages to schedule a meeting → 1 voice command"

This phase focuses on the **highest-value, highest-complexity feature** that will validate product-market fit.

---

## Phase 2 Overview

**Timeline**: 4 weeks (Days 36-63)
**Team**: 4-5 engineers working in parallel

**Success Criteria**:
- ✅ Voice: "Schedule lunch with Sarah next week" → email sent with proposed times
- ✅ Sarah responds with chosen time → auto-creates calendar event for both
- ✅ Confirmation email sent automatically
- ✅ 95%+ of proposed times are actually free (no double-bookings)
- ✅ 90%+ completion rate (coordinations result in scheduled meeting)
- ✅ < 30 seconds from voice to draft approval
- ✅ Works for both Gmail/Google Calendar and Outlook users

---

## Phase 2.1: Context Engine Foundation (Week 7, Days 36-42)

**Why First**: Meeting scheduling needs user context (preferences, contact relationships, scheduling patterns)

### Sub-Phase 2.1.A: User Context Service (Days 36-38)
**Owner**: Backend Engineer #1
**Dependencies**: Phase 1 complete
**Parallel with**: 2.1.B, 2.1.C

#### Architecture

```typescript
// apps/api/src/services/context-engine/user-context.service.ts
export class UserContextService {
  /**
   * Retrieve comprehensive user context for command processing
   * Uses multi-level caching for performance
   */
  async getUserContext(userId: string): Promise<UserContext> {
    // L1 cache check (in-memory, 1 minute TTL)
    const cached = inMemoryCache.get(`user:context:${userId}`);
    if (cached) return cached;

    // L2 cache check (Redis, 10 minute TTL)
    const redisCached = await redis.get(`user:context:${userId}`);
    if (redisCached) {
      const parsed = JSON.parse(redisCached);
      inMemoryCache.set(`user:context:${userId}`, parsed, 60);
      return parsed;
    }

    // Build context from database
    const context = await this.buildUserContext(userId);

    // Store in caches
    await redis.setex(`user:context:${userId}`, 600, JSON.stringify(context));
    inMemoryCache.set(`user:context:${userId}`, context, 60);

    return context;
  }

  private async buildUserContext(userId: string): Promise<UserContext> {
    const [user, preferences, recentCommands, frequentContacts, vipContacts] =
      await Promise.all([
        db.user.findUnique({ where: { id: userId } }),
        db.userPreferences.findUnique({ where: { userId } }),
        this.getRecentCommands(userId, 10),
        this.getFrequentContacts(userId, 20),
        this.getVIPContacts(userId)
      ]);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone
      },
      preferences: {
        defaultTone: preferences.defaultTone,
        emailSignature: preferences.emailSignature,
        autoAcceptMeetings: preferences.autoAcceptMeetings
      },
      recentActivity: recentCommands,
      frequentContacts: frequentContacts.map(c => ({
        email: c.email,
        name: c.name,
        interactionCount: c.count,
        lastInteraction: c.lastDate
      })),
      vipContacts: vipContacts.map(c => ({
        email: c.email,
        name: c.name,
        relationship: c.relationship
      }))
    };
  }

  private async getRecentCommands(
    userId: string,
    limit: number
  ): Promise<RecentCommand[]> {
    return db.command.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        intent: true,
        timestamp: true,
        status: true
      }
    });
  }

  private async getFrequentContacts(
    userId: string,
    limit: number
  ): Promise<FrequentContact[]> {
    // Query emails to find most frequent contacts
    const result = await db.$queryRaw`
      SELECT
        UNNEST(to) as email,
        COUNT(*) as count,
        MAX(date) as last_date
      FROM emails
      WHERE user_id = ${userId}
        AND direction = 'sent'
        AND date > NOW() - INTERVAL '90 days'
      GROUP BY email
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return result as FrequentContact[];
  }

  private async getVIPContacts(userId: string): Promise<VIPContact[]> {
    const prefs = await db.userPreferences.findUnique({
      where: { userId },
      select: { vipContacts: true }
    });

    return (prefs.vipContacts as VIPContact[]) || [];
  }

  /**
   * Invalidate user context cache (call after preferences update)
   */
  async invalidateCache(userId: string): Promise<void> {
    inMemoryCache.delete(`user:context:${userId}`);
    await redis.del(`user:context:${userId}`);
  }
}
```

**Deliverables**:
- [ ] `UserContextService` with multi-level caching
- [ ] Recent commands retrieval (last 10)
- [ ] Frequent contacts analysis (90-day window)
- [ ] VIP contacts retrieval
- [ ] Cache invalidation on updates
- [ ] Performance: < 100ms with warm cache, < 500ms cold
- [ ] Unit tests (90%+ coverage)

---

### Sub-Phase 2.1.B: Contact Relationship Analysis (Days 36-38)
**Owner**: Backend Engineer #2
**Dependencies**: Phase 1
**Parallel with**: 2.1.A, 2.1.C

```typescript
// apps/api/src/services/context-engine/contact-analyzer.service.ts
export class ContactAnalyzerService {
  /**
   * Analyze relationship with a contact based on email history
   * Returns: tone, relationship type, communication patterns
   */
  async analyzeContact(
    userId: string,
    contactEmail: string
  ): Promise<ContactAnalysis> {
    // Check cache first
    const cached = await redis.get(`contact:analysis:${userId}:${contactEmail}`);
    if (cached) return JSON.parse(cached);

    // Check if we already have stored preferences
    const stored = await db.contactPreferences.findFirst({
      where: { userId, contactEmail }
    });

    if (stored && stored.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      // Preferences updated within 7 days, use them
      const analysis: ContactAnalysis = {
        email: contactEmail,
        name: stored.contactName,
        preferredTone: stored.preferredTone,
        relationshipType: stored.relationshipType,
        interactionCount: stored.interactionCount,
        averageResponseTime: stored.averageResponseTime,
        confidence: 'high'
      };

      await redis.setex(
        `contact:analysis:${userId}:${contactEmail}`,
        86400, // 1 day TTL
        JSON.stringify(analysis)
      );

      return analysis;
    }

    // Need to analyze from scratch
    return this.analyzeFromEmailHistory(userId, contactEmail);
  }

  private async analyzeFromEmailHistory(
    userId: string,
    contactEmail: string
  ): Promise<ContactAnalysis> {
    // Get email history with this contact
    const emails = await db.email.findMany({
      where: {
        userId,
        OR: [
          { from: contactEmail },
          { to: { array_contains: contactEmail } }
        ]
      },
      orderBy: { date: 'desc' },
      take: 50, // Last 50 emails
      select: {
        from: true,
        to: true,
        subject: true,
        body: true,
        date: true,
        snippet: true
      }
    });

    if (emails.length === 0) {
      // No history, return defaults
      return {
        email: contactEmail,
        name: this.extractNameFromEmail(contactEmail),
        preferredTone: 'professional',
        relationshipType: 'colleague',
        interactionCount: 0,
        confidence: 'low'
      };
    }

    // Use GPT to analyze relationship
    const analysis = await this.analyzeWithGPT(emails, contactEmail);

    // Calculate response time
    const avgResponseTime = this.calculateAverageResponseTime(emails, contactEmail);

    // Store for future use
    await db.contactPreferences.upsert({
      where: {
        userId_contactEmail: {
          userId,
          contactEmail
        }
      },
      create: {
        userId,
        contactEmail,
        contactName: analysis.name,
        preferredTone: analysis.preferredTone,
        relationshipType: analysis.relationshipType,
        interactionCount: emails.length,
        averageResponseTime: avgResponseTime
      },
      update: {
        contactName: analysis.name,
        preferredTone: analysis.preferredTone,
        relationshipType: analysis.relationshipType,
        interactionCount: emails.length,
        averageResponseTime: avgResponseTime,
        lastInteraction: new Date()
      }
    });

    const result: ContactAnalysis = {
      ...analysis,
      email: contactEmail,
      interactionCount: emails.length,
      averageResponseTime: avgResponseTime,
      confidence: emails.length > 10 ? 'high' : 'medium'
    };

    // Cache result
    await redis.setex(
      `contact:analysis:${userId}:${contactEmail}`,
      86400,
      JSON.stringify(result)
    );

    return result;
  }

  private async analyzeWithGPT(
    emails: EmailSample[],
    contactEmail: string
  ): Promise<GPTContactAnalysis> {
    const prompt = `Analyze the relationship between the user and ${contactEmail} based on these email exchanges.

Sample emails (most recent first):
${emails.slice(0, 10).map(e => `
From: ${e.from}
To: ${e.to.join(', ')}
Subject: ${e.subject}
Snippet: ${e.snippet}
Date: ${e.date.toISOString()}
`).join('\n---\n')}

Analyze and provide:
1. Contact's likely name (from email signatures/content)
2. Relationship type: boss, colleague, client, friend, vendor
3. Preferred communication tone: professional, casual, friendly, formal
4. Key patterns or notes about communication style

Respond in JSON format.`;

    const response = await callOpenAI(() =>
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing professional relationships from email communication patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3 // Lower temperature for more consistent analysis
      })
    );

    const analysis = JSON.parse(response.choices[0].message.content);

    return {
      name: analysis.name || this.extractNameFromEmail(contactEmail),
      relationshipType: analysis.relationshipType || 'colleague',
      preferredTone: analysis.preferredTone || 'professional',
      notes: analysis.notes
    };
  }

  private calculateAverageResponseTime(
    emails: EmailSample[],
    contactEmail: string
  ): number | null {
    // Find pairs of (user email → contact response)
    const responseTimes: number[] = [];

    for (let i = 0; i < emails.length - 1; i++) {
      const current = emails[i];
      const next = emails[i + 1];

      // Check if current is from contact and next is from user (response)
      if (current.from === contactEmail && next.from !== contactEmail) {
        const timeDiff = next.date.getTime() - current.date.getTime();
        responseTimes.push(timeDiff);
      }
    }

    if (responseTimes.length === 0) return null;

    const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    return Math.round(avgMs / 1000 / 60); // Convert to minutes
  }

  private extractNameFromEmail(email: string): string {
    const [localPart] = email.split('@');
    return localPart
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
```

**Deliverables**:
- [ ] Contact analysis using GPT-4
- [ ] Relationship type detection (boss, colleague, client, etc.)
- [ ] Tone preference detection
- [ ] Response time calculation
- [ ] Storage in `contact_preferences` table
- [ ] Cache strategy (1 day TTL)
- [ ] Unit tests with mocked GPT responses
- [ ] Integration test with real email samples

---

### Sub-Phase 2.1.C: Meeting Pattern Analysis (Days 36-38)
**Owner**: Backend Engineer #3
**Dependencies**: Phase 1
**Parallel with**: 2.1.A, 2.1.B

```typescript
// apps/api/src/services/context-engine/meeting-pattern-analyzer.service.ts
export class MeetingPatternAnalyzer {
  /**
   * Analyze user's meeting scheduling patterns
   * Returns: preferred times, typical durations, meeting-free preferences
   */
  async analyzeMeetingPatterns(userId: string): Promise<MeetingPatterns> {
    const cached = await redis.get(`meeting:patterns:${userId}`);
    if (cached) return JSON.parse(cached);

    // Get last 90 days of meetings
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const meetings = await db.calendarEvent.findMany({
      where: {
        userId,
        start: { gte: cutoff }
      },
      orderBy: { start: 'asc' }
    });

    const patterns = this.analyzePatterns(meetings);

    // Cache for 7 days
    await redis.setex(
      `meeting:patterns:${userId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(patterns)
    );

    return patterns;
  }

  private analyzePatterns(meetings: CalendarEvent[]): MeetingPatterns {
    // Analyze preferred meeting times
    const timeDistribution = this.analyzeTimeDistribution(meetings);

    // Analyze typical durations by meeting type
    const durationPatterns = this.analyzeDurations(meetings);

    // Analyze day-of-week preferences
    const dayPreferences = this.analyzeDayPreferences(meetings);

    // Detect meeting-free day patterns
    const meetingFreeDays = this.detectMeetingFreeDays(meetings);

    // Analyze back-to-back tolerance
    const backToBackTolerance = this.analyzeBackToBackTolerance(meetings);

    return {
      preferredTimes: timeDistribution,
      typicalDurations: durationPatterns,
      preferredDays: dayPreferences,
      meetingFreeDays,
      backToBackTolerance,
      totalMeetings: meetings.length,
      averageMeetingsPerWeek: meetings.length / 13 // 90 days ≈ 13 weeks
    };
  }

  private analyzeTimeDistribution(meetings: CalendarEvent[]): TimeDistribution {
    const distribution = {
      morning: 0,    // 8am-12pm
      lunch: 0,      // 12pm-2pm
      afternoon: 0,  // 2pm-5pm
      evening: 0     // 5pm-7pm
    };

    for (const meeting of meetings) {
      const hour = meeting.start.getHours();

      if (hour >= 8 && hour < 12) distribution.morning++;
      else if (hour >= 12 && hour < 14) distribution.lunch++;
      else if (hour >= 14 && hour < 17) distribution.afternoon++;
      else if (hour >= 17 && hour < 19) distribution.evening++;
    }

    const total = meetings.length;

    return {
      morning: distribution.morning / total,
      lunch: distribution.lunch / total,
      afternoon: distribution.afternoon / total,
      evening: distribution.evening / total
    };
  }

  private analyzeDurations(meetings: CalendarEvent[]): DurationPatterns {
    const durations = meetings.map(m =>
      (m.end.getTime() - m.start.getTime()) / 1000 / 60 // minutes
    );

    // Group by common durations
    const patterns: Record<number, number> = {};

    for (const duration of durations) {
      // Round to nearest 15 minutes
      const rounded = Math.round(duration / 15) * 15;
      patterns[rounded] = (patterns[rounded] || 0) + 1;
    }

    // Find most common durations
    const sorted = Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      mostCommon: sorted.map(([duration, count]) => ({
        duration: parseInt(duration),
        frequency: count / meetings.length
      })),
      average: durations.reduce((a, b) => a + b, 0) / durations.length
    };
  }

  private analyzeDayPreferences(meetings: CalendarEvent[]): DayPreferences {
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

    for (const meeting of meetings) {
      const day = meeting.start.getDay();
      dayCount[day]++;
    }

    const total = meetings.length;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    return days.map((day, idx) => ({
      day,
      frequency: dayCount[idx] / total
    }));
  }

  private detectMeetingFreeDays(meetings: CalendarEvent[]): string[] {
    // Group meetings by day of week
    const meetingsByDay: Record<string, number> = {};

    for (const meeting of meetings) {
      const day = meeting.start.toLocaleDateString('en-US', { weekday: 'long' });
      meetingsByDay[day] = (meetingsByDay[day] || 0) + 1;
    }

    // Find days with significantly fewer meetings
    const avgMeetings = Object.values(meetingsByDay).reduce((a, b) => a + b, 0) / 7;

    return Object.entries(meetingsByDay)
      .filter(([, count]) => count < avgMeetings * 0.3)
      .map(([day]) => day.toLowerCase());
  }

  private analyzeBackToBackTolerance(meetings: CalendarEvent[]): number {
    let backToBackCount = 0;
    let totalMeetings = meetings.length - 1;

    for (let i = 0; i < meetings.length - 1; i++) {
      const current = meetings[i];
      const next = meetings[i + 1];

      // Check if same day
      if (current.end.toDateString() === next.start.toDateString()) {
        const gap = next.start.getTime() - current.end.getTime();

        if (gap <= 5 * 60 * 1000) { // 5 minutes or less
          backToBackCount++;
        }
      }
    }

    return backToBackCount / totalMeetings; // Percentage of back-to-back
  }
}
```

**Deliverables**:
- [ ] Meeting time preference analysis
- [ ] Duration pattern detection
- [ ] Day-of-week preferences
- [ ] Meeting-free day detection
- [ ] Back-to-back tolerance calculation
- [ ] Cache strategy (7-day TTL)
- [ ] Unit tests with sample meeting data

---

## Phase 2.2: Meeting Scheduling Logic (Week 7-8, Days 39-49)

### Sub-Phase 2.2.A: Availability Calculator (Days 39-42)
**Owner**: Backend Engineer #1
**Dependencies**: Phase 1 (Calendar Service), 2.1.C
**Parallel with**: 2.2.B

**Core Algorithm**: Find free time slots that match user preferences

```typescript
// apps/api/src/services/meeting-scheduler/availability-calculator.service.ts
export class AvailabilityCalculator {
  constructor(
    private calendarService: CalendarService,
    private patternAnalyzer: MeetingPatternAnalyzer
  ) {}

  /**
   * Find best available time slots for a meeting
   * Considers: user availability, preferences, meeting patterns
   */
  async findBestSlots(
    userId: string,
    params: FindSlotsParams
  ): Promise<MeetingSlot[]> {
    // Get user's calendar events
    const events = await this.calendarService.getEvents(userId, {
      start: params.timeframe.start,
      end: params.timeframe.end
    });

    // Get user's meeting patterns
    const patterns = await this.patternAnalyzer.analyzeMeetingPatterns(userId);

    // Calculate all free slots
    const freeSlots = this.calculateFreeSlots(
      events,
      params.timeframe,
      params.duration
    );

    // Score and rank slots based on preferences
    const scoredSlots = this.scoreSlots(
      freeSlots,
      patterns,
      params.timeOfDay,
      params.meetingType
    );

    // Return top N slots
    return scoredSlots.slice(0, params.maxOptions || 3);
  }

  /**
   * Pure function: Calculate free time slots
   * NO side effects, easily testable
   */
  private calculateFreeSlots(
    events: CalendarEvent[],
    timeframe: Timeframe,
    durationMinutes: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const duration = durationMinutes * 60 * 1000; // Convert to ms

    // Sort events by start time
    const sortedEvents = [...events].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );

    // Start from beginning of timeframe
    let currentTime = new Date(timeframe.start);

    // Iterate through events, finding gaps
    for (const event of sortedEvents) {
      // Check gap before this event
      const gapEnd = event.start;

      if (gapEnd.getTime() - currentTime.getTime() >= duration) {
        // This gap is long enough
        slots.push({
          start: new Date(currentTime),
          end: new Date(Math.min(gapEnd.getTime(), currentTime.getTime() + duration)),
          duration: durationMinutes
        });
      }

      // Move current time to end of this event
      currentTime = new Date(Math.max(currentTime.getTime(), event.end.getTime()));
    }

    // Check gap after last event
    if (timeframe.end.getTime() - currentTime.getTime() >= duration) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(Math.min(timeframe.end.getTime(), currentTime.getTime() + duration)),
        duration: durationMinutes
      });
    }

    return this.filterBusinessHours(slots);
  }

  /**
   * Filter slots to business hours (8am-7pm)
   * Configurable per user in the future
   */
  private filterBusinessHours(slots: TimeSlot[]): TimeSlot[] {
    return slots.filter(slot => {
      const hour = slot.start.getHours();
      return hour >= 8 && hour < 19; // 8am-7pm
    });
  }

  /**
   * Score slots based on user preferences
   * Higher score = better fit
   */
  private scoreSlots(
    slots: TimeSlot[],
    patterns: MeetingPatterns,
    preferredTimeOfDay?: TimeOfDay,
    meetingType?: MeetingType
  ): MeetingSlot[] {
    return slots
      .map(slot => {
        let score = 100; // Base score

        const hour = slot.start.getHours();
        const day = slot.start.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        // Score based on time of day preference
        if (preferredTimeOfDay) {
          if (preferredTimeOfDay === 'morning' && hour >= 9 && hour < 12) score += 30;
          else if (preferredTimeOfDay === 'lunch' && hour >= 12 && hour < 14) score += 30;
          else if (preferredTimeOfDay === 'afternoon' && hour >= 14 && hour < 17) score += 30;
          else if (preferredTimeOfDay === 'evening' && hour >= 17 && hour < 19) score += 30;
          else score -= 20; // Doesn't match preference
        }

        // Score based on historical patterns
        const timeDistribution = patterns.preferredTimes;
        if (hour >= 8 && hour < 12) score += timeDistribution.morning * 20;
        else if (hour >= 12 && hour < 14) score += timeDistribution.lunch * 20;
        else if (hour >= 14 && hour < 17) score += timeDistribution.afternoon * 20;
        else if (hour >= 17 && hour < 19) score += timeDistribution.evening * 20;

        // Score based on day preference
        const dayPref = patterns.preferredDays.find(d => d.day === day);
        if (dayPref) {
          score += dayPref.frequency * 15;
        }

        // Penalize meeting-free days
        if (patterns.meetingFreeDays.includes(day)) {
          score -= 40;
        }

        // Penalize early mornings and late afternoons
        if (hour < 9) score -= 15;
        if (hour >= 17) score -= 10;

        // Round to nice times (on the hour or half hour)
        const minutes = slot.start.getMinutes();
        if (minutes === 0) score += 10;
        else if (minutes === 30) score += 5;
        else score -= 5;

        // Meeting type specific scoring
        if (meetingType === 'lunch' && hour >= 12 && hour < 14) score += 40;
        if (meetingType === 'coffee' && (hour >= 9 && hour < 11)) score += 30;

        return {
          ...slot,
          score,
          reason: this.explainScore(slot, score, patterns, preferredTimeOfDay)
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private explainScore(
    slot: TimeSlot,
    score: number,
    patterns: MeetingPatterns,
    preferredTimeOfDay?: TimeOfDay
  ): string {
    const hour = slot.start.getHours();
    const reasons: string[] = [];

    if (preferredTimeOfDay && this.matchesTimeOfDay(hour, preferredTimeOfDay)) {
      reasons.push(`matches your preferred ${preferredTimeOfDay} time`);
    }

    if (slot.start.getMinutes() === 0 || slot.start.getMinutes() === 30) {
      reasons.push('on the hour/half-hour');
    }

    // Top preference time
    const topTime = Object.entries(patterns.preferredTimes)
      .sort(([, a], [, b]) => b - a)[0][0];

    if (this.matchesTimeOfDay(hour, topTime as TimeOfDay)) {
      reasons.push(`your most common meeting time`);
    }

    return reasons.join(', ') || 'available time';
  }

  private matchesTimeOfDay(hour: number, timeOfDay: TimeOfDay): boolean {
    if (timeOfDay === 'morning') return hour >= 8 && hour < 12;
    if (timeOfDay === 'lunch') return hour >= 12 && hour < 14;
    if (timeOfDay === 'afternoon') return hour >= 14 && hour < 17;
    if (timeOfDay === 'evening') return hour >= 17 && hour < 19;
    return false;
  }

  /**
   * Find overlapping availability for multiple participants
   * Requires calendar access to all participants
   */
  async findOverlappingSlots(
    userIds: string[],
    params: FindSlotsParams
  ): Promise<MeetingSlot[]> {
    // Get availability for each participant in parallel
    const availabilities = await Promise.all(
      userIds.map(userId => this.findBestSlots(userId, {
        ...params,
        maxOptions: 20 // Get more options for intersection
      }))
    );

    // Find time slots that work for everyone
    const overlapping = this.findOverlaps(availabilities);

    // Return top 3
    return overlapping.slice(0, 3);
  }

  private findOverlaps(availabilities: MeetingSlot[][]): MeetingSlot[] {
    if (availabilities.length === 0) return [];
    if (availabilities.length === 1) return availabilities[0];

    // Start with first person's availability
    let overlaps = availabilities[0];

    // Intersect with each other person's availability
    for (let i = 1; i < availabilities.length; i++) {
      overlaps = this.intersectSlots(overlaps, availabilities[i]);
    }

    return overlaps;
  }

  private intersectSlots(slotsA: MeetingSlot[], slotsB: MeetingSlot[]): MeetingSlot[] {
    const intersections: MeetingSlot[] = [];

    for (const slotA of slotsA) {
      for (const slotB of slotsB) {
        const overlapStart = new Date(Math.max(
          slotA.start.getTime(),
          slotB.start.getTime()
        ));

        const overlapEnd = new Date(Math.min(
          slotA.end.getTime(),
          slotB.end.getTime()
        ));

        // Check if there's actual overlap
        if (overlapStart < overlapEnd) {
          const duration = (overlapEnd.getTime() - overlapStart.getTime()) / 1000 / 60;

          // Only include if overlap is long enough
          if (duration >= 15) {
            intersections.push({
              start: overlapStart,
              end: overlapEnd,
              duration,
              score: (slotA.score + slotB.score) / 2,
              reason: 'works for all participants'
            });
          }
        }
      }
    }

    return intersections.sort((a, b) => b.score - a.score);
  }
}
```

**Testing Strategy**:

```typescript
// apps/api/src/services/meeting-scheduler/__tests__/availability-calculator.test.ts
describe('AvailabilityCalculator', () => {
  describe('calculateFreeSlots', () => {
    it('should find gaps between meetings', () => {
      const events = [
        { start: new Date('2024-01-15T09:00:00'), end: new Date('2024-01-15T10:00:00') },
        { start: new Date('2024-01-15T14:00:00'), end: new Date('2024-01-15T15:00:00') }
      ];

      const timeframe = {
        start: new Date('2024-01-15T08:00:00'),
        end: new Date('2024-01-15T17:00:00')
      };

      const slots = calculator['calculateFreeSlots'](events, timeframe, 60);

      expect(slots).toHaveLength(3);
      expect(slots[0].start).toEqual(new Date('2024-01-15T08:00:00'));
      expect(slots[1].start).toEqual(new Date('2024-01-15T10:00:00'));
      expect(slots[2].start).toEqual(new Date('2024-01-15T15:00:00'));
    });

    it('should not suggest slots during existing meetings', () => {
      // Test overlapping meetings
    });

    it('should respect minimum duration', () => {
      // Test that small gaps are ignored
    });
  });

  describe('scoreSlots', () => {
    it('should prefer user\'s historical meeting times', () => {
      // Test scoring based on patterns
    });

    it('should boost on-the-hour times', () => {
      // Test time rounding preference
    });
  });
});
```

**Deliverables**:
- [ ] Free slot calculation algorithm (pure function)
- [ ] Slot scoring based on patterns
- [ ] Multi-participant overlap finding
- [ ] Business hours filtering
- [ ] Explanation generation for each slot
- [ ] 90%+ unit test coverage
- [ ] Performance: < 200ms for single user, < 500ms for multi-user

---

### Sub-Phase 2.2.B: Meeting Request Drafter (Days 39-42)
**Owner**: Backend Engineer #2
**Dependencies**: 2.1.A, 2.1.B (Context services)
**Parallel with**: 2.2.A

```typescript
// apps/api/src/services/meeting-scheduler/meeting-request-drafter.service.ts
export class MeetingRequestDrafter {
  constructor(
    private contactAnalyzer: ContactAnalyzerService,
    private userContextService: UserContextService
  ) {}

  /**
   * Draft meeting request email with proposed times
   * Tone and style adapted to recipient relationship
   */
  async draftMeetingRequest(
    userId: string,
    params: DraftMeetingRequestParams
  ): Promise<EmailDraft> {
    // Get user context
    const userContext = await this.userContextService.getUserContext(userId);

    // Analyze relationship with recipient(s)
    const recipientAnalyses = await Promise.all(
      params.recipients.map(email =>
        this.contactAnalyzer.analyzeContact(userId, email)
      )
    );

    // Determine appropriate tone (use most formal if multiple recipients)
    const tone = this.determineTone(recipientAnalyses);

    // Format proposed times
    const formattedTimes = this.formatProposedTimes(
      params.proposedTimes,
      userContext.user.timezone
    );

    // Generate email body using GPT
    const emailBody = await this.generateEmailBody({
      userName: userContext.user.name,
      recipients: recipientAnalyses,
      meetingType: params.meetingType,
      proposedTimes: formattedTimes,
      tone,
      additionalContext: params.additionalContext
    });

    // Generate subject line
    const subject = this.generateSubjectLine(params.meetingType, recipientAnalyses);

    return {
      to: params.recipients,
      subject,
      body: emailBody,
      tone,
      proposedTimes: params.proposedTimes,
      metadata: {
        meetingType: params.meetingType,
        duration: params.duration,
        recipientRelationships: recipientAnalyses.map(a => a.relationshipType)
      }
    };
  }

  private determineTone(analyses: ContactAnalysis[]): EmailTone {
    // Use most formal tone if multiple recipients with different relationships
    const tones = analyses.map(a => a.preferredTone);

    const formalityOrder = ['formal', 'professional', 'friendly', 'casual'];

    for (const tone of formalityOrder) {
      if (tones.includes(tone as EmailTone)) {
        return tone as EmailTone;
      }
    }

    return 'professional'; // Default
  }

  private formatProposedTimes(
    times: Date[],
    timezone: string
  ): FormattedTime[] {
    return times.map(time => ({
      date: time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
      }),
      time: time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone
      }),
      raw: time
    }));
  }

  private async generateEmailBody(params: {
    userName: string;
    recipients: ContactAnalysis[];
    meetingType: MeetingType;
    proposedTimes: FormattedTime[];
    tone: EmailTone;
    additionalContext?: string;
  }): Promise<string> {
    const { userName, recipients, meetingType, proposedTimes, tone, additionalContext } = params;

    const recipientNames = recipients
      .map(r => r.name)
      .join(recipients.length === 2 ? ' and ' : ', ');

    const prompt = `Draft a meeting request email with the following details:

From: ${userName}
To: ${recipientNames}
Relationship: ${recipients.map(r => r.relationshipType).join(', ')}
Meeting Type: ${meetingType}
Tone: ${tone}

Proposed times:
${proposedTimes.map((t, i) => `${i + 1}. ${t.date} at ${t.time}`).join('\n')}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Use ${tone} tone appropriate for ${recipients[0].relationshipType} relationship
- Be concise and friendly
- Present the times as options, not demands
- Include a clear call-to-action
- Don't be overly formal or stiff
- Match the style of ${recipientNames} based on their communication patterns

Generate only the email body (no subject line).`;

    const response = await callOpenAI(() =>
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing natural, professional meeting request emails that match the sender\'s communication style.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7 // Slightly higher for more natural variation
      })
    );

    return response.choices[0].message.content.trim();
  }

  private generateSubjectLine(
    meetingType: MeetingType,
    recipients: ContactAnalysis[]
  ): string {
    const recipientNames = recipients.length === 1
      ? recipients[0].name
      : recipients.length === 2
      ? `${recipients[0].name} and ${recipients[1].name}`
      : `${recipients[0].name} and others`;

    const meetingTypeMap: Record<MeetingType, string> = {
      lunch: 'Lunch',
      coffee: 'Coffee',
      discussion: 'Meeting',
      sync: 'Sync',
      review: 'Review',
      '1:1': '1:1'
    };

    const meetingLabel = meetingTypeMap[meetingType] || 'Meeting';

    return `${meetingLabel} with ${recipientNames}`;
  }
}
```

**Deliverables**:
- [ ] Meeting request drafting with GPT-4
- [ ] Tone adaptation based on recipient relationship
- [ ] Multi-recipient handling
- [ ] Time formatting with timezone
- [ ] Subject line generation
- [ ] Unit tests with mocked GPT responses
- [ ] Integration test with real contact analysis

---

(Continuing in next file due to length...)
