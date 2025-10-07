import { google, calendar_v3 } from 'googleapis';
import type { UserId } from '@tide/types';
import { logger } from '@tide/logger';
import type {
  CalendarEvent,
  ICalendarProvider,
  OAuthTokens,
  Availability,
  TimeSlot,
  Attendee,
} from '../types/index.js';

/**
 * Google Calendar provider implementation
 */
export class GoogleCalendarProvider implements ICalendarProvider {
  private auth: any;
  private calendar: calendar_v3.Calendar | null = null;
  private userId: UserId | null = null;

  /**
   * Initialize Google Calendar client with OAuth credentials
   */
  async initialize(userId: UserId, tokens: OAuthTokens): Promise<void> {
    try {
      this.userId = userId;

      // Create OAuth2 client
      this.auth = new google.auth.OAuth2();
      this.auth.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expiry_date: tokens.expiresAt.getTime(),
      });

      // Initialize Calendar API client
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });

      logger.info({ userId }, 'Google Calendar provider initialized');
    } catch (error) {
      logger.error({ userId, error }, 'Failed to initialize Google Calendar provider');
      throw error;
    }
  }

  /**
   * Fetch calendar events
   */
  async fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    if (!this.calendar || !this.userId) {
      throw new Error('Google Calendar provider not initialized');
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      return response.data.items
        .map((event) => this.transformToCalendarEvent(event))
        .filter((event): event is CalendarEvent => event !== null);
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to fetch calendar events');
      throw error;
    }
  }

  /**
   * Transform Google Calendar event to CalendarEvent
   */
  private transformToCalendarEvent(
    event: calendar_v3.Schema$Event
  ): CalendarEvent | null {
    if (!event.id || !event.start || !event.end || !this.userId) {
      return null;
    }

    const start = event.start.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start.date!);
    const end = event.end.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end.date!);

    const attendees: Attendee[] = (event.attendees || []).map((a) => ({
      email: a.email!,
      name: a.displayName || undefined,
      responseStatus: a.responseStatus as any,
      isOrganizer: a.organizer || false,
      isOptional: a.optional || false,
    }));

    return {
      id: event.id,
      userId: this.userId,
      provider: 'google',
      title: event.summary || 'Untitled Event',
      description: event.description || undefined,
      start,
      end,
      location: event.location || undefined,
      attendees,
      organizer: event.organizer
        ? {
            email: event.organizer.email!,
            name: event.organizer.displayName || undefined,
          }
        : undefined,
      status: this.mapStatus(event.status || undefined),
      isRecurring: !!event.recurrence,
      recurrenceRule: event.recurrence?.[0] || undefined,
      reminders: event.reminders?.overrides?.map((r) => r.minutes!),
      conferenceLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || undefined,
      isAllDay: !!event.start.date,
    };
  }

  /**
   * Map Google Calendar status to our status
   */
  private mapStatus(status?: string): 'confirmed' | 'tentative' | 'cancelled' {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'tentative':
        return 'tentative';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'confirmed';
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!this.calendar || !this.userId) {
      throw new Error('Google Calendar provider not initialized');
    }

    try {
      const googleEvent: calendar_v3.Schema$Event = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start?.toISOString(),
          timeZone: 'America/Los_Angeles', // Should be configurable
        },
        end: {
          dateTime: event.end?.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        attendees: event.attendees?.map((a) => ({
          email: a.email,
          displayName: a.name,
          optional: a.isOptional,
        })),
        conferenceData:
          event.conferenceLink || true
            ? {
                createRequest: {
                  requestId: `tide-${Date.now()}`,
                  conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                  },
                },
              }
            : undefined,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent,
        conferenceDataVersion: 1,
      });

      const created = this.transformToCalendarEvent(response.data);
      if (!created) {
        throw new Error('Failed to create event');
      }

      logger.info(
        { userId: this.userId, eventId: created.id, title: created.title },
        'Calendar event created'
      );

      return created;
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to create calendar event');
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    if (!this.calendar || !this.userId) {
      throw new Error('Google Calendar provider not initialized');
    }

    try {
      const googleUpdates: calendar_v3.Schema$Event = {
        summary: updates.title,
        description: updates.description,
        location: updates.location,
        start: updates.start
          ? {
              dateTime: updates.start.toISOString(),
              timeZone: 'America/Los_Angeles',
            }
          : undefined,
        end: updates.end
          ? {
              dateTime: updates.end.toISOString(),
              timeZone: 'America/Los_Angeles',
            }
          : undefined,
        attendees: updates.attendees?.map((a) => ({
          email: a.email,
          displayName: a.name,
          optional: a.isOptional,
        })),
      };

      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: googleUpdates,
      });

      const updated = this.transformToCalendarEvent(response.data);
      if (!updated) {
        throw new Error('Failed to update event');
      }

      logger.info({ userId: this.userId, eventId }, 'Calendar event updated');

      return updated;
    } catch (error) {
      logger.error({ userId: this.userId, eventId, error }, 'Failed to update event');
      throw error;
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.calendar || !this.userId) {
      throw new Error('Google Calendar provider not initialized');
    }

    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      logger.info({ userId: this.userId, eventId }, 'Calendar event deleted');
    } catch (error) {
      logger.error({ userId: this.userId, eventId, error }, 'Failed to delete event');
      throw error;
    }
  }

  /**
   * Get availability (free/busy)
   */
  async getAvailability(start: Date, end: Date): Promise<Availability> {
    if (!this.calendar || !this.userId) {
      throw new Error('Google Calendar provider not initialized');
    }

    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busySlots: TimeSlot[] = [];
      const calendars = response.data.calendars;

      if (calendars && calendars.primary) {
        for (const busy of calendars.primary.busy || []) {
          if (busy.start && busy.end) {
            busySlots.push({
              start: new Date(busy.start),
              end: new Date(busy.end),
            });
          }
        }
      }

      // Calculate free slots
      const slots = this.calculateFreeSlots(start, end, busySlots);

      return {
        userId: this.userId,
        dateRange: { start, end },
        slots,
        busySlots,
      };
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to get availability');
      throw error;
    }
  }

  /**
   * Calculate free time slots from busy periods
   */
  private calculateFreeSlots(
    start: Date,
    end: Date,
    busySlots: TimeSlot[]
  ): TimeSlot[] {
    const freeSlots: TimeSlot[] = [];

    // Sort busy slots by start time
    const sorted = [...busySlots].sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentTime = start;

    for (const busy of sorted) {
      // If there's a gap before this busy slot
      if (currentTime < busy.start) {
        freeSlots.push({
          start: new Date(currentTime),
          end: new Date(busy.start),
        });
      }

      // Move current time to end of busy slot
      if (busy.end > currentTime) {
        currentTime = busy.end;
      }
    }

    // Add final free slot if there's time left
    if (currentTime < end) {
      freeSlots.push({
        start: new Date(currentTime),
        end: new Date(end),
      });
    }

    return freeSlots;
  }
}
