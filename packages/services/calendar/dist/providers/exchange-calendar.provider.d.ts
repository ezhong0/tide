import type { UserId } from '@tide/types';
import type { CalendarEvent, ICalendarProvider, OAuthTokens, Availability } from '../types';
/**
 * Exchange/Outlook Calendar provider implementation using Microsoft Graph API
 */
export declare class ExchangeCalendarProvider implements ICalendarProvider {
    private client;
    private userId;
    /**
     * Initialize Exchange Calendar client with OAuth credentials
     */
    initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
    /**
     * Fetch calendar events
     */
    fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
    /**
     * Transform Microsoft Graph event to CalendarEvent
     */
    private transformToCalendarEvent;
    /**
     * Map Microsoft Graph response status to our format
     */
    private mapResponseStatus;
    /**
     * Map event status
     */
    private mapEventStatus;
    /**
     * Format recurrence rule from Microsoft Graph format
     */
    private formatRecurrenceRule;
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
//# sourceMappingURL=exchange-calendar.provider.d.ts.map