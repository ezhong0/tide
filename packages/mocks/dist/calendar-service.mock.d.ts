import { CalendarEvent } from '@tide/contracts';
export declare class MockCalendarService {
    private mockEvents;
    fetchEvents(userId: string, start: Date, end: Date): Promise<CalendarEvent[]>;
    scheduleEvent(event: CalendarEvent): Promise<{
        success: boolean;
        eventId: string;
    }>;
}
