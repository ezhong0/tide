# Calendar Module - Complete Implementation Guide

## Timeline: Week 3-6 (Days 15-42)

## Team: Backend Engineer #3 + #4

## Dependencies: Phase 0 complete (contracts, database, infrastructure)

---

## Module Overview

**Responsibility**: Handle ALL calendar operations (Google Calendar + Outlook Calendar)

**Core Functionality**:

- OAuth authentication (Google + Microsoft)
- Event CRUD operations
- Availability calculation (free/busy slots)
- Meeting scheduling intelligence
- Timezone-aware operations
- Calendar synchronization

**Module Boundaries**:

- ✅ YOU DO: All calendar operations, availability logic, event management
- ❌ YOU DON'T: Send emails (Email Module), Make AI decisions (AI Module), Store user preferences (Context Module)

**Integration Points**:

- IN: API requests from AI Module (check availability, create event)
- OUT: Calendar data to Context Module (for pattern analysis)
- STORAGE: `calendar_events` table, cache in Redis

---

## Architecture Pattern: Strategy Pattern + Functional Core

```typescript
// Strategy Pattern for providers
interface ICalendarProvider {
  createEvent(): Promise<CalendarEvent>;
  getEvents(): Promise<CalendarEvent[]>;
  updateEvent(): Promise<CalendarEvent>;
  deleteEvent(): Promise<void>;
}

class GoogleCalendarProvider implements ICalendarProvider {}
class OutlookCalendarProvider implements ICalendarProvider {}

// Functional Core: Pure availability calculation
class AvailabilityCalculator {
  calculateFreeSlots(events, timeframe, duration): TimeSlot[] {
    // Pure function - no side effects
  }
  scoreSlots(slots, preferences): ScoredSlot[] {
    // Pure function - testable without mocks
  }
}

// Imperative Shell: I/O operations
class CalendarService {
  async checkAvailability(userId, params): Promise<TimeSlot[]> {
    const events = await provider.getEvents(); // I/O
    const slots = calculator.calculateFreeSlots(events); // Pure
    await cache.set(slots); // I/O
    return slots;
  }
}
```

---

## Week 3: Google Calendar Integration (Engineer #3)

### Day 15-16: Google Calendar OAuth Setup

#### 1. Google Cloud Configuration

```bash
# Manual Steps (Document in README.md):
# 1. Go to https://console.cloud.google.com
# 2. Use existing project "Tide-Production" (created in Email Module setup)
# 3. Enable Google Calendar API
# 4. Add calendar scope to existing OAuth credentials
# 5. Authorized redirect URIs:
#    - http://localhost:3000/api/calendar/oauth/google/callback (dev)
#    - https://api-staging.tide.app/api/calendar/oauth/google/callback
#    - https://api.tide.app/api/calendar/oauth/google/callback
```

#### 2. Install Dependencies

```bash
cd apps/api
pnpm add googleapis
pnpm add -D @types/googleapis
```

#### 3. Google Calendar OAuth Service

```typescript
// apps/api/src/services/calendar/google/google-calendar-oauth.service.ts
import { google, Auth } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { encryptCredentials, decryptCredentials } from '../../../utils/encryption';
import { db } from '../../../db';
import { logger } from '../../../utils/logger';

export class GoogleCalendarOAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI!
    );
  }

  /**
   * Generate OAuth URL for calendar authorization
   * Can be called even if user already connected email
   */
  getAuthUrl(userId: string): string {
    const state = this.generateStateToken(userId);

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
      prompt: 'consent', // Force to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    state: string
  ): Promise<{ userId: string; tokens: OAuthTokens }> {
    const userId = this.verifyStateToken(state);

    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Incomplete tokens received from Google');
      }

      const oauthTokens: OAuthTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date!),
        scope: tokens.scope!.split(' '),
      };

      // Store encrypted in database
      await db.user.update({
        where: { id: userId },
        data: {
          calendar_provider: 'google',
          calendar_credentials: encryptCredentials(oauthTokens),
        },
      });

      logger.info({ userId }, 'Google Calendar OAuth completed');

      return { userId, tokens: oauthTokens };
    } catch (error) {
      logger.error({ userId, error }, 'Google Calendar OAuth failed');
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(userId: string): Promise<OAuthTokens> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { calendar_credentials: true },
    });

    if (!user || !user.calendar_credentials) {
      throw new Error('Calendar credentials not found');
    }

    const credentials = decryptCredentials(user.calendar_credentials);

    this.oauth2Client.setCredentials({
      refresh_token: credentials.refreshToken,
    });

    try {
      const { credentials: newCreds } = await this.oauth2Client.refreshAccessToken();

      const newTokens: OAuthTokens = {
        accessToken: newCreds.access_token!,
        refreshToken: newCreds.refresh_token || credentials.refreshToken,
        expiresAt: new Date(newCreds.expiry_date!),
        scope: newCreds.scope!.split(' '),
      };

      await db.user.update({
        where: { id: userId },
        data: {
          calendar_credentials: encryptCredentials(newTokens),
        },
      });

      logger.info({ userId }, 'Google Calendar token refreshed');

      return newTokens;
    } catch (error) {
      logger.error({ userId, error }, 'Calendar token refresh failed');
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Ensure valid token (refresh if needed)
   */
  async ensureValidToken(userId: string): Promise<OAuthTokens> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { calendar_credentials: true },
    });

    if (!user || !user.calendar_credentials) {
      throw new Error('Calendar credentials not found');
    }

    const credentials = decryptCredentials(user.calendar_credentials);

    // Refresh if expires in less than 5 minutes
    const expiresInMs = credentials.expiresAt.getTime() - Date.now();
    if (expiresInMs < 5 * 60 * 1000) {
      logger.info({ userId }, 'Calendar token expiring soon, refreshing');
      return this.refreshAccessToken(userId);
    }

    return credentials;
  }

  private generateStateToken(userId: string): string {
    // Use same implementation as email OAuth for consistency
    const crypto = require('crypto');
    const data = JSON.stringify({
      userId,
      timestamp: Date.now(),
      type: 'calendar',
    });
    return Buffer.from(data).toString('base64url');
  }

  private verifyStateToken(state: string): string {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());

      // Check timestamp (state valid for 10 minutes)
      const age = Date.now() - decoded.timestamp;
      if (age > 10 * 60 * 1000) {
        throw new Error('State token expired');
      }

      if (decoded.type !== 'calendar') {
        throw new Error('Invalid state token type');
      }

      return decoded.userId;
    } catch (error) {
      throw new Error('Invalid state token');
    }
  }
}

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
}
```

#### 4. OAuth Routes

```typescript
// apps/api/src/routes/calendar-oauth.routes.ts
import { Router } from 'express';
import { authenticateRequest } from '../middleware/auth';
import { GoogleCalendarOAuthService } from '../services/calendar/google/google-calendar-oauth.service';

const router = Router();
const googleCalendarOAuth = new GoogleCalendarOAuthService();

/**
 * Step 1: Get OAuth URL
 */
router.post('/google/connect', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const authUrl = googleCalendarOAuth.getAuthUrl(userId);

    res.json({ auth_url: authUrl });
  } catch (error) {
    next(error);
  }
});

/**
 * Step 2: OAuth callback
 */
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/auth/callback?error=${error}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    const { userId } = await googleCalendarOAuth.exchangeCodeForTokens(
      code as string,
      state as string
    );

    res.redirect(`/auth/callback?success=true&user_id=${userId}&type=calendar`);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Deliverables Day 15-16**:

- [ ] Google Calendar OAuth service implemented
- [ ] OAuth routes working
- [ ] Token refresh automatic
- [ ] Encrypted token storage
- [ ] Unit tests passing
- [ ] Manual OAuth flow tested

---

### Day 17-19: Google Calendar Provider Implementation

```typescript
// apps/api/src/services/calendar/google/google-calendar-provider.service.ts
import { calendar_v3, google } from 'googleapis';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import type { ICalendarProvider } from '../calendar-provider.interface';
import { logger } from '../../../utils/logger';
import { db } from '../../../db';

export class GoogleCalendarProviderService implements ICalendarProvider {
  private calendar: calendar_v3.Calendar;
  private oauthService: GoogleCalendarOAuthService;

  constructor(private userId: string) {
    this.oauthService = new GoogleCalendarOAuthService();
  }

  /**
   * Initialize Google Calendar client with user's credentials
   */
  private async initializeClient(): Promise<void> {
    const credentials = await this.oauthService.ensureValidToken(this.userId);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create calendar event
   */
  async createEvent(params: CreateEventParams): Promise<CalendarEvent> {
    await this.initializeClient();

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        sendUpdates: params.sendNotifications ? 'all' : 'none',
        requestBody: {
          summary: params.title,
          description: params.description,
          location: params.location,
          start: {
            dateTime: params.start.toISOString(),
            timeZone: params.timezone,
          },
          end: {
            dateTime: params.end.toISOString(),
            timeZone: params.timezone,
          },
          attendees: params.attendees.map((a) => ({
            email: a.email,
            optional: a.optional,
            responseStatus: 'needsAction',
          })),
          reminders: {
            useDefault: true,
          },
        },
      });

      const event = this.parseGoogleEvent(response.data);

      // Store in database
      await this.storeEventInDB(event);

      logger.info({ userId: this.userId, eventId: event.id }, 'Calendar event created');

      return event;
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to create event');
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Get events in date range
   */
  async getEvents(range: DateRange): Promise<CalendarEvent[]> {
    await this.initializeClient();

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: range.start.toISOString(),
        timeMax: range.end.toISOString(),
        singleEvents: true, // Expand recurring events
        orderBy: 'startTime',
        maxResults: 250,
      });

      const events = (response.data.items || []).map((item) => this.parseGoogleEvent(item));

      // Update database with fetched events
      await this.syncEventsToDatabase(events);

      return events;
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to get events');
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Update existing event
   */
  async updateEvent(eventId: string, updates: Partial<CreateEventParams>): Promise<CalendarEvent> {
    await this.initializeClient();

    try {
      // Get current event
      const current = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      // Merge updates
      const updated = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        sendUpdates: updates.sendNotifications ? 'all' : 'none',
        requestBody: {
          ...current.data,
          summary: updates.title || current.data.summary,
          description: updates.description || current.data.description,
          location: updates.location || current.data.location,
          start: updates.start
            ? {
                dateTime: updates.start.toISOString(),
                timeZone: updates.timezone,
              }
            : current.data.start,
          end: updates.end
            ? {
                dateTime: updates.end.toISOString(),
                timeZone: updates.timezone,
              }
            : current.data.end,
          attendees: updates.attendees
            ? updates.attendees.map((a) => ({
                email: a.email,
                optional: a.optional,
              }))
            : current.data.attendees,
        },
      });

      const event = this.parseGoogleEvent(updated.data);

      // Update database
      await this.updateEventInDB(event);

      logger.info({ userId: this.userId, eventId }, 'Calendar event updated');

      return event;
    } catch (error) {
      logger.error({ userId: this.userId, eventId, error }, 'Failed to update event');
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.initializeClient();

    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });

      // Mark as deleted in database
      await db.calendarEvent.update({
        where: { external_id: eventId, user_id: this.userId },
        data: { status: 'cancelled' },
      });

      logger.info({ userId: this.userId, eventId }, 'Calendar event deleted');
    } catch (error) {
      logger.error({ userId: this.userId, eventId, error }, 'Failed to delete event');
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get free/busy information
   */
  async getFreeBusy(range: DateRange): Promise<FreeBusyData> {
    await this.initializeClient();

    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: range.start.toISOString(),
          timeMax: range.end.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busySlots = response.data.calendars?.primary?.busy || [];

      return {
        userId: this.userId,
        timeRange: range,
        busySlots: busySlots.map((slot) => ({
          start: new Date(slot.start!),
          end: new Date(slot.end!),
        })),
      };
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to get free/busy');
      throw new Error('Failed to fetch free/busy information');
    }
  }

  // ========== HELPER METHODS ==========

  private parseGoogleEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    return {
      id: event.id!,
      externalId: event.id!,
      userId: this.userId,
      title: event.summary || 'Untitled Event',
      description: event.description,
      location: event.location,
      start: new Date(event.start?.dateTime || event.start?.date!),
      end: new Date(event.end?.dateTime || event.end?.date!),
      isAllDay: !event.start?.dateTime, // All-day if no time component
      timezone: event.start?.timeZone || 'UTC',
      attendees: (event.attendees || []).map((a) => ({
        email: a.email!,
        name: a.displayName,
        responseStatus: this.mapResponseStatus(a.responseStatus),
        optional: a.optional || false,
      })),
      organizer: {
        email: event.organizer?.email || '',
        name: event.organizer?.displayName,
      },
      status: this.mapStatus(event.status),
      responseStatus: this.mapResponseStatus(event.attendees?.find((a) => a.self)?.responseStatus),
      meetingUrl: event.hangoutLink,
      recurrence: event.recurrence
        ? {
            // Parse RRULE if needed
            frequency: 'weekly', // Simplified
            interval: 1,
          }
        : undefined,
      createdAt: new Date(event.created!),
      updatedAt: new Date(event.updated!),
    };
  }

  private mapStatus(status?: string): 'confirmed' | 'tentative' | 'cancelled' {
    if (status === 'confirmed') return 'confirmed';
    if (status === 'tentative') return 'tentative';
    if (status === 'cancelled') return 'cancelled';
    return 'confirmed';
  }

  private mapResponseStatus(
    status?: string
  ): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
    if (status === 'accepted') return 'accepted';
    if (status === 'declined') return 'declined';
    if (status === 'tentative') return 'tentative';
    return 'needsAction';
  }

  private async storeEventInDB(event: CalendarEvent): Promise<void> {
    await db.calendarEvent.upsert({
      where: {
        user_id_external_id: {
          user_id: this.userId,
          external_id: event.externalId,
        },
      },
      create: {
        user_id: this.userId,
        external_id: event.externalId,
        title: event.title,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        is_all_day: event.isAllDay,
        timezone: event.timezone,
        attendees: event.attendees,
        status: event.status,
      },
      update: {
        title: event.title,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        status: event.status,
        updated_at: new Date(),
      },
    });
  }

  private async syncEventsToDatabase(events: CalendarEvent[]): Promise<void> {
    // Bulk upsert events
    for (const event of events) {
      await this.storeEventInDB(event);
    }
  }

  private async updateEventInDB(event: CalendarEvent): Promise<void> {
    await db.calendarEvent.update({
      where: {
        user_id_external_id: {
          user_id: this.userId,
          external_id: event.externalId,
        },
      },
      data: {
        title: event.title,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        status: event.status,
        updated_at: new Date(),
      },
    });
  }
}
```

**Deliverables Day 17-19**:

- [ ] Google Calendar provider service complete
- [ ] All CRUD operations working
- [ ] Free/busy query working
- [ ] Events stored in database
- [ ] Recurring events expanded
- [ ] Error handling comprehensive
- [ ] Unit tests passing

---

### Day 20-21: Availability Calculator (Pure Functions)

This is CRITICAL - must be pure functions with NO side effects:

```typescript
// apps/api/src/services/calendar/availability-calculator.service.ts

/**
 * Pure function-based availability calculator
 * NO database calls, NO API calls, NO side effects
 * Easily testable without mocks
 */
export class AvailabilityCalculator {
  /**
   * Calculate free time slots between events
   *
   * @param events - Sorted calendar events
   * @param timeframe - Start/end range to search
   * @param durationMinutes - Required slot duration
   * @returns Array of free time slots
   */
  calculateFreeSlots(
    events: CalendarEvent[],
    timeframe: Timeframe,
    durationMinutes: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const durationMs = durationMinutes * 60 * 1000;

    // Sort events by start time (defensive copy)
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentTime = new Date(timeframe.start);

    for (const event of sortedEvents) {
      // Skip if event is before our current position
      if (event.end.getTime() <= currentTime.getTime()) {
        continue;
      }

      // Skip if event starts after timeframe ends
      if (event.start.getTime() >= timeframe.end.getTime()) {
        break;
      }

      // Check gap before this event
      const gapStart = currentTime;
      const gapEnd = event.start;
      const gapDuration = gapEnd.getTime() - gapStart.getTime();

      if (gapDuration >= durationMs) {
        // Found a free slot
        slots.push({
          start: new Date(gapStart),
          end: new Date(Math.min(gapEnd.getTime(), gapStart.getTime() + durationMs)),
          durationMinutes,
        });
      }

      // Move current time to end of this event
      currentTime = new Date(Math.max(currentTime.getTime(), event.end.getTime()));
    }

    // Check for gap after last event
    if (currentTime.getTime() < timeframe.end.getTime()) {
      const finalGap = timeframe.end.getTime() - currentTime.getTime();
      if (finalGap >= durationMs) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(Math.min(timeframe.end.getTime(), currentTime.getTime() + durationMs)),
          durationMinutes,
        });
      }
    }

    // Filter to business hours only
    return this.filterToBusinessHours(slots);
  }

  /**
   * Filter slots to business hours (8am-7pm weekdays)
   * Pure function
   */
  private filterToBusinessHours(slots: TimeSlot[]): TimeSlot[] {
    return slots.filter((slot) => {
      const hour = slot.start.getHours();
      const day = slot.start.getDay();

      // Weekend
      if (day === 0 || day === 6) return false;

      // Outside business hours (8am-7pm)
      if (hour < 8 || hour >= 19) return false;

      return true;
    });
  }

  /**
   * Score slots based on user preferences and meeting patterns
   * Pure function - all inputs provided, no side effects
   *
   * @param slots - Available time slots
   * @param preferences - User's meeting preferences
   * @param meetingType - Type of meeting (affects scoring)
   * @returns Slots sorted by score (best first)
   */
  scoreSlots(
    slots: TimeSlot[],
    preferences: MeetingPreferences,
    meetingType?: MeetingType
  ): ScoredTimeSlot[] {
    return slots
      .map((slot) => {
        let score = 100; // Base score

        const hour = slot.start.getHours();
        const minutes = slot.start.getMinutes();
        const day = slot.start.getDay();
        const dayName = this.getDayName(day);

        // Score based on time of day preferences
        if (preferences.preferredTimes) {
          if (hour >= 9 && hour < 12 && preferences.preferredTimes.morning) {
            score += 30;
          } else if (hour >= 12 && hour < 14 && preferences.preferredTimes.lunch) {
            score += 30;
          } else if (hour >= 14 && hour < 17 && preferences.preferredTimes.afternoon) {
            score += 30;
          } else if (hour >= 17 && hour < 19 && preferences.preferredTimes.evening) {
            score += 20;
          }
        }

        // Score based on historical day preferences
        if (preferences.dayPreferences) {
          const dayPref = preferences.dayPreferences.find(
            (d) => d.day.toLowerCase() === dayName.toLowerCase()
          );
          if (dayPref) {
            score += dayPref.frequency * 20; // 0-20 points based on frequency
          }
        }

        // Penalize meeting-free days
        if (preferences.meetingFreeDays?.includes(dayName.toLowerCase())) {
          score -= 40;
        }

        // Prefer on-the-hour or half-hour times
        if (minutes === 0) {
          score += 10; // Top of hour
        } else if (minutes === 30) {
          score += 5; // Half hour
        } else {
          score -= 5; // Odd times
        }

        // Meeting type specific scoring
        if (meetingType === 'lunch' && hour >= 12 && hour < 14) {
          score += 40; // Strong preference for lunch slots at lunchtime
        } else if (meetingType === 'coffee' && hour >= 9 && hour < 11) {
          score += 30; // Morning coffee
        } else if (meetingType === '1:1' && hour >= 14 && hour < 16) {
          score += 20; // Afternoon 1:1s
        }

        // Penalize very early or late
        if (hour < 9) score -= 15;
        if (hour >= 17) score -= 10;

        // Penalize Friday afternoons
        if (day === 5 && hour >= 15) score -= 15;

        // Avoid back-to-back if preference is set
        if (
          preferences.backToBackTolerance !== undefined &&
          preferences.backToBackTolerance < 0.3
        ) {
          // User dislikes back-to-back - we can't check here (pure function)
          // This would be done in the service layer
        }

        return {
          ...slot,
          score,
          reason: this.explainScore(slot, score, preferences, meetingType),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Generate human-readable explanation for score
   * Pure function
   */
  private explainScore(
    slot: TimeSlot,
    score: number,
    preferences: MeetingPreferences,
    meetingType?: MeetingType
  ): string {
    const reasons: string[] = [];
    const hour = slot.start.getHours();
    const minutes = slot.start.getMinutes();

    // Why this slot scored well
    if (meetingType === 'lunch' && hour >= 12 && hour < 14) {
      reasons.push('perfect lunch time');
    } else if (meetingType === 'coffee' && hour >= 9 && hour < 11) {
      reasons.push('good coffee meeting time');
    }

    if (minutes === 0 || minutes === 30) {
      reasons.push('on the hour');
    }

    if (hour >= 9 && hour < 12 && preferences.preferredTimes?.morning) {
      reasons.push('your preferred morning slot');
    } else if (hour >= 14 && hour < 17 && preferences.preferredTimes?.afternoon) {
      reasons.push('your preferred afternoon slot');
    }

    if (preferences.dayPreferences) {
      const day = this.getDayName(slot.start.getDay());
      const dayPref = preferences.dayPreferences.find(
        (d) => d.day.toLowerCase() === day.toLowerCase()
      );
      if (dayPref && dayPref.frequency > 0.5) {
        reasons.push(`${day} is a common meeting day for you`);
      }
    }

    return reasons.length > 0 ? reasons.join(', ') : 'available time';
  }

  /**
   * Find overlapping availability for multiple participants
   * Pure function - all calendar data provided as input
   */
  findOverlappingSlots(
    allParticipantsEvents: Map<string, CalendarEvent[]>,
    timeframe: Timeframe,
    durationMinutes: number
  ): TimeSlot[] {
    // Calculate free slots for each participant
    const allFreeSlots: TimeSlot[][] = [];

    for (const [userId, events] of allParticipantsEvents.entries()) {
      const freeSlots = this.calculateFreeSlots(events, timeframe, durationMinutes);
      allFreeSlots.push(freeSlots);
    }

    if (allFreeSlots.length === 0) return [];
    if (allFreeSlots.length === 1) return allFreeSlots[0];

    // Find intersections
    let overlaps = allFreeSlots[0];

    for (let i = 1; i < allFreeSlots.length; i++) {
      overlaps = this.intersectSlots(overlaps, allFreeSlots[i], durationMinutes);
    }

    return overlaps;
  }

  /**
   * Find intersection of two slot arrays
   * Pure function
   */
  private intersectSlots(
    slotsA: TimeSlot[],
    slotsB: TimeSlot[],
    minDurationMinutes: number
  ): TimeSlot[] {
    const intersections: TimeSlot[] = [];
    const minDurationMs = minDurationMinutes * 60 * 1000;

    for (const slotA of slotsA) {
      for (const slotB of slotsB) {
        const overlapStart = new Date(Math.max(slotA.start.getTime(), slotB.start.getTime()));

        const overlapEnd = new Date(Math.min(slotA.end.getTime(), slotB.end.getTime()));

        // Check if there's actual overlap
        const overlapDuration = overlapEnd.getTime() - overlapStart.getTime();

        if (overlapDuration >= minDurationMs) {
          intersections.push({
            start: overlapStart,
            end: overlapEnd,
            durationMinutes: Math.floor(overlapDuration / 1000 / 60),
          });
        }
      }
    }

    return intersections;
  }

  private getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  }
}

// ========== TYPE DEFINITIONS ==========

export interface TimeSlot {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface ScoredTimeSlot extends TimeSlot {
  score: number;
  reason: string;
}

export interface Timeframe {
  start: Date;
  end: Date;
}

export interface MeetingPreferences {
  preferredTimes?: {
    morning?: boolean;
    lunch?: boolean;
    afternoon?: boolean;
    evening?: boolean;
  };
  dayPreferences?: Array<{
    day: string;
    frequency: number; // 0-1
  }>;
  meetingFreeDays?: string[];
  backToBackTolerance?: number; // 0-1
}

export type MeetingType = 'lunch' | 'coffee' | '1:1' | 'discussion' | 'review' | 'sync';
```

**Critical Tests for Pure Functions**:

```typescript
// apps/api/src/services/calendar/__tests__/availability-calculator.test.ts
import { AvailabilityCalculator } from '../availability-calculator.service';

describe('AvailabilityCalculator', () => {
  let calculator: AvailabilityCalculator;

  beforeEach(() => {
    calculator = new AvailabilityCalculator();
  });

  describe('calculateFreeSlots', () => {
    it('should find gaps between meetings', () => {
      const events: CalendarEvent[] = [
        {
          start: new Date('2024-01-15T09:00:00Z'),
          end: new Date('2024-01-15T10:00:00Z'),
        },
        {
          start: new Date('2024-01-15T14:00:00Z'),
          end: new Date('2024-01-15T15:00:00Z'),
        },
      ] as CalendarEvent[];

      const timeframe = {
        start: new Date('2024-01-15T08:00:00Z'),
        end: new Date('2024-01-15T17:00:00Z'),
      };

      const slots = calculator.calculateFreeSlots(events, timeframe, 60);

      // Should find 3 slots: before first meeting, between meetings, after last
      expect(slots.length).toBeGreaterThanOrEqual(2);
      expect(slots[0].start.getTime()).toBeLessThan(events[0].start.getTime());
    });

    it('should not create slots shorter than requested duration', () => {
      const events: CalendarEvent[] = [
        {
          start: new Date('2024-01-15T09:00:00Z'),
          end: new Date('2024-01-15T09:30:00Z'),
        },
        {
          start: new Date('2024-01-15T09:45:00Z'), // Only 15min gap
          end: new Date('2024-01-15T10:00:00Z'),
        },
      ] as CalendarEvent[];

      const timeframe = {
        start: new Date('2024-01-15T08:00:00Z'),
        end: new Date('2024-01-15T11:00:00Z'),
      };

      const slots = calculator.calculateFreeSlots(events, timeframe, 30);

      // Should not include the 15min gap
      const gapSlot = slots.find(
        (s) => s.start.getTime() === new Date('2024-01-15T09:30:00Z').getTime()
      );
      expect(gapSlot).toBeUndefined();
    });

    it('should filter out weekend slots', () => {
      const events: CalendarEvent[] = [];
      const timeframe = {
        start: new Date('2024-01-13T08:00:00Z'), // Saturday
        end: new Date('2024-01-14T17:00:00Z'), // Sunday
      };

      const slots = calculator.calculateFreeSlots(events, timeframe, 60);

      expect(slots).toHaveLength(0);
    });

    it('should filter out slots outside business hours', () => {
      const events: CalendarEvent[] = [];
      const timeframe = {
        start: new Date('2024-01-15T06:00:00Z'), // 6am
        end: new Date('2024-01-15T22:00:00Z'), // 10pm
      };

      const slots = calculator.calculateFreeSlots(events, timeframe, 60);

      // All slots should be between 8am-7pm
      slots.forEach((slot) => {
        const hour = slot.start.getHours();
        expect(hour).toBeGreaterThanOrEqual(8);
        expect(hour).toBeLessThan(19);
      });
    });
  });

  describe('scoreSlots', () => {
    it('should prefer on-the-hour times', () => {
      const slots: TimeSlot[] = [
        {
          start: new Date('2024-01-15T10:00:00Z'), // On the hour
          end: new Date('2024-01-15T11:00:00Z'),
          durationMinutes: 60,
        },
        {
          start: new Date('2024-01-15T10:15:00Z'), // Off hour
          end: new Date('2024-01-15T11:15:00Z'),
          durationMinutes: 60,
        },
      ];

      const preferences: MeetingPreferences = {};

      const scored = calculator.scoreSlots(slots, preferences);

      expect(scored[0].start.getMinutes()).toBe(0);
      expect(scored[0].score).toBeGreaterThan(scored[1].score);
    });

    it('should boost lunch slots for lunch meetings', () => {
      const slots: TimeSlot[] = [
        {
          start: new Date('2024-01-15T10:00:00Z'), // Morning
          end: new Date('2024-01-15T11:00:00Z'),
          durationMinutes: 60,
        },
        {
          start: new Date('2024-01-15T12:00:00Z'), // Lunch
          end: new Date('2024-01-15T13:00:00Z'),
          durationMinutes: 60,
        },
      ];

      const preferences: MeetingPreferences = {};

      const scored = calculator.scoreSlots(slots, preferences, 'lunch');

      expect(scored[0].start.getHours()).toBe(12);
      expect(scored[0].score).toBeGreaterThan(scored[1].score);
    });

    it('should respect user time preferences', () => {
      const slots: TimeSlot[] = [
        {
          start: new Date('2024-01-15T09:00:00Z'),
          end: new Date('2024-01-15T10:00:00Z'),
          durationMinutes: 60,
        },
        {
          start: new Date('2024-01-15T14:00:00Z'),
          end: new Date('2024-01-15T15:00:00Z'),
          durationMinutes: 60,
        },
      ];

      const preferences: MeetingPreferences = {
        preferredTimes: {
          morning: true,
          afternoon: false,
        },
      };

      const scored = calculator.scoreSlots(slots, preferences);

      expect(scored[0].start.getHours()).toBe(9);
    });
  });

  describe('findOverlappingSlots', () => {
    it('should find time slots that work for all participants', () => {
      const user1Events: CalendarEvent[] = [
        {
          start: new Date('2024-01-15T09:00:00Z'),
          end: new Date('2024-01-15T10:00:00Z'),
        },
      ] as CalendarEvent[];

      const user2Events: CalendarEvent[] = [
        {
          start: new Date('2024-01-15T11:00:00Z'),
          end: new Date('2024-01-15T12:00:00Z'),
        },
      ] as CalendarEvent[];

      const allEvents = new Map([
        ['user1', user1Events],
        ['user2', user2Events],
      ]);

      const timeframe = {
        start: new Date('2024-01-15T08:00:00Z'),
        end: new Date('2024-01-15T17:00:00Z'),
      };

      const overlaps = calculator.findOverlappingSlots(allEvents, timeframe, 60);

      // Should find slots where both are free
      // 10am-11am should be free for both
      const tenAmSlot = overlaps.find((s) => s.start.getHours() === 10);
      expect(tenAmSlot).toBeDefined();
    });

    it('should return no overlaps if participants have no common free time', () => {
      const user1Events: CalendarEvent[] = [
        {
          start: new Date('2024-01-15T08:00:00Z'),
          end: new Date('2024-01-15T12:00:00Z'),
        },
      ] as CalendarEvent[];

      const user2Events: CalendarEvent[] = [
        {
          start: new Date('2024-01-15T10:00:00Z'),
          end: new Date('2024-01-15T17:00:00Z'),
        },
      ] as CalendarEvent[];

      const allEvents = new Map([
        ['user1', user1Events],
        ['user2', user2Events],
      ]);

      const timeframe = {
        start: new Date('2024-01-15T08:00:00Z'),
        end: new Date('2024-01-15T17:00:00Z'),
      };

      const overlaps = calculator.findOverlappingSlots(allEvents, timeframe, 60);

      expect(overlaps).toHaveLength(0);
    });
  });
});
```

**Deliverables Day 20-21**:

- [ ] Availability calculator with 100% pure functions
- [ ] No side effects (no DB, no API calls)
- [ ] Comprehensive unit tests (100% coverage on pure logic)
- [ ] Scoring algorithm working
- [ ] Multi-participant overlap working

---

(Continuing in next message due to length...)
