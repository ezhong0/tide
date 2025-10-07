import { CalendarEvent } from '@tide/contracts';

export class MockCalendarService {
  private mockEvents: CalendarEvent[] = [];

  async fetchEvents(userId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const now = new Date();
    return [
      {
        id: 'event_1',
        title: 'Product Review Meeting',
        start: new Date(now.getTime() + 3600000),
        end: new Date(now.getTime() + 5400000),
        attendees: [
          { name: 'You', email: 'you@company.com' },
          { name: 'Team Lead', email: 'lead@company.com' }
        ],
        location: 'Conference Room A',
        meetingType: 'internal',
        hasPrep: true
      }
    ];
  }

  async scheduleEvent(event: CalendarEvent): Promise<{ success: boolean; eventId: string }> {
    const id = Date.now();
    const newEvent = { ...event, id: `event_${id}` };
    this.mockEvents.push(newEvent);
    return { success: true, eventId: newEvent.id };
  }
}
