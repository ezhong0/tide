import type { UserId } from '@tide/types';
import type { CalendarEvent, ICalendarProvider, OAuthTokens, Availability } from '../types/index.js';
/**
 * Google Calendar provider implementation
 */
export declare class GoogleCalendarProvider implements ICalendarProvider {
    private auth;
    private calendar;
    private userId;
    /**
     * Initialize Google Calendar client with OAuth credentials
     */
    initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
    /**
     * Fetch calendar events
     */
    fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
    /**
     * Transform Google Calendar event to CalendarEvent
     */
    private transformToCalendarEvent;
    /**
     * Map Google Calendar status to our status
     */
    private mapStatus;
    /**
     * Create calendar event
     */
    createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent>;
    /**
     * Update calendar event
     */
    updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
    /**
     * Delete calendar event
     */
    deleteEvent(eventId: string): Promise<void>;
    /**
     * Get availability (free/busy)
     */
    getAvailability(start: Date, end: Date): Promise<Availability>;
    /**
     * Calculate free time slots from busy periods
     */
    private calculateFreeSlots;
}
//# sourceMappingURL=google-calendar.provider.d.ts.map