"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeCalendarProvider = void 0;
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const logger_1 = require("@tide/logger");
/**
 * Exchange/Outlook Calendar provider implementation using Microsoft Graph API
 */
class ExchangeCalendarProvider {
    constructor() {
        this.client = null;
        this.userId = null;
    }
    /**
     * Initialize Exchange Calendar client with OAuth credentials
     */
    async initialize(userId, tokens) {
        try {
            this.userId = userId;
            // Create Microsoft Graph client with auth
            this.client = microsoft_graph_client_1.Client.init({
                authProvider: (done) => {
                    done(null, tokens.accessToken);
                },
            });
            logger_1.logger.info({ userId }, 'Exchange Calendar provider initialized');
        }
        catch (error) {
            logger_1.logger.error({ userId, error }, 'Failed to initialize Exchange Calendar provider');
            throw error;
        }
    }
    /**
     * Fetch calendar events
     */
    async fetchEvents(start, end) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange Calendar provider not initialized');
        }
        try {
            const response = await this.client
                .api('/me/calendar/calendarView')
                .query({
                startDateTime: start.toISOString(),
                endDateTime: end.toISOString(),
            })
                .select([
                'id',
                'subject',
                'body',
                'start',
                'end',
                'location',
                'attendees',
                'organizer',
                'isAllDay',
                'isCancelled',
                'responseStatus',
                'recurrence',
                'onlineMeeting',
            ])
                .orderby('start/dateTime')
                .top(250)
                .get();
            if (!response.value || response.value.length === 0) {
                return [];
            }
            return response.value
                .map((event) => this.transformToCalendarEvent(event))
                .filter((event) => event !== null);
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, error }, 'Failed to fetch calendar events');
            throw error;
        }
    }
    /**
     * Transform Microsoft Graph event to CalendarEvent
     */
    transformToCalendarEvent(event) {
        if (!event.id || !event.start || !event.end || !this.userId) {
            return null;
        }
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        const attendees = (event.attendees || []).map((a) => ({
            email: a.emailAddress?.address || '',
            name: a.emailAddress?.name,
            responseStatus: this.mapResponseStatus(a.status?.response),
            isOrganizer: a.type === 'organizer',
            isOptional: a.type === 'optional',
        }));
        return {
            id: event.id,
            userId: this.userId,
            provider: 'exchange',
            title: event.subject || 'Untitled Event',
            description: event.body?.content,
            start,
            end,
            location: event.location?.displayName,
            attendees,
            organizer: event.organizer
                ? {
                    email: event.organizer.emailAddress?.address || '',
                    name: event.organizer.emailAddress?.name,
                }
                : undefined,
            status: this.mapEventStatus(event.isCancelled, event.responseStatus?.response),
            isRecurring: !!event.recurrence,
            recurrenceRule: event.recurrence
                ? this.formatRecurrenceRule(event.recurrence)
                : undefined,
            conferenceLink: event.onlineMeeting?.joinUrl,
            isAllDay: event.isAllDay ?? false,
        };
    }
    /**
     * Map Microsoft Graph response status to our format
     */
    mapResponseStatus(status) {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return 'accepted';
            case 'declined':
                return 'declined';
            case 'tentativelyaccepted':
            case 'tentative':
                return 'tentative';
            default:
                return 'needsAction';
        }
    }
    /**
     * Map event status
     */
    mapEventStatus(isCancelled, responseStatus) {
        if (isCancelled) {
            return 'cancelled';
        }
        if (responseStatus === 'tentativelyAccepted') {
            return 'tentative';
        }
        return 'confirmed';
    }
    /**
     * Format recurrence rule from Microsoft Graph format
     */
    formatRecurrenceRule(recurrence) {
        // Simplified - would need full RRULE formatting
        const pattern = recurrence.pattern?.type || 'unknown';
        return `FREQ=${pattern.toUpperCase()}`;
    }
    /**
     * Create calendar event
     */
    async createEvent(event) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange Calendar provider not initialized');
        }
        try {
            const graphEvent = {
                subject: event.title,
                body: {
                    contentType: 'HTML',
                    content: event.description || '',
                },
                start: {
                    dateTime: event.start?.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: event.end?.toISOString(),
                    timeZone: 'UTC',
                },
                location: event.location
                    ? {
                        displayName: event.location,
                    }
                    : undefined,
                attendees: event.attendees?.map((a) => ({
                    emailAddress: {
                        address: a.email,
                        name: a.name,
                    },
                    type: a.isOptional ? 'optional' : 'required',
                })),
                isOnlineMeeting: !!event.conferenceLink || true,
                onlineMeetingProvider: 'teamsForBusiness',
            };
            const response = await this.client.api('/me/calendar/events').post(graphEvent);
            const created = this.transformToCalendarEvent(response);
            if (!created) {
                throw new Error('Failed to create event');
            }
            logger_1.logger.info({ userId: this.userId, eventId: created.id, title: created.title }, 'Calendar event created');
            return created;
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, error }, 'Failed to create calendar event');
            throw error;
        }
    }
    /**
     * Update calendar event
     */
    async updateEvent(eventId, updates) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange Calendar provider not initialized');
        }
        try {
            const graphUpdates = {};
            if (updates.title !== undefined) {
                graphUpdates.subject = updates.title;
            }
            if (updates.description !== undefined) {
                graphUpdates.body = {
                    contentType: 'HTML',
                    content: updates.description,
                };
            }
            if (updates.start !== undefined) {
                graphUpdates.start = {
                    dateTime: updates.start.toISOString(),
                    timeZone: 'UTC',
                };
            }
            if (updates.end !== undefined) {
                graphUpdates.end = {
                    dateTime: updates.end.toISOString(),
                    timeZone: 'UTC',
                };
            }
            if (updates.location !== undefined) {
                graphUpdates.location = {
                    displayName: updates.location,
                };
            }
            if (updates.attendees !== undefined) {
                graphUpdates.attendees = updates.attendees.map((a) => ({
                    emailAddress: {
                        address: a.email,
                        name: a.name,
                    },
                    type: a.isOptional ? 'optional' : 'required',
                }));
            }
            const response = await this.client
                .api(`/me/calendar/events/${eventId}`)
                .patch(graphUpdates);
            const updated = this.transformToCalendarEvent(response);
            if (!updated) {
                throw new Error('Failed to update event');
            }
            logger_1.logger.info({ userId: this.userId, eventId }, 'Calendar event updated');
            return updated;
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, eventId, error }, 'Failed to update event');
            throw error;
        }
    }
    /**
     * Delete calendar event
     */
    async deleteEvent(eventId) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange Calendar provider not initialized');
        }
        try {
            await this.client.api(`/me/calendar/events/${eventId}`).delete();
            logger_1.logger.info({ userId: this.userId, eventId }, 'Calendar event deleted');
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, eventId, error }, 'Failed to delete event');
            throw error;
        }
    }
    /**
     * Get availability (free/busy)
     */
    async getAvailability(start, end) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange Calendar provider not initialized');
        }
        try {
            const response = await this.client.api('/me/calendar/getSchedule').post({
                schedules: ['me@example.com'], // Would use actual email
                startTime: {
                    dateTime: start.toISOString(),
                    timeZone: 'UTC',
                },
                endTime: {
                    dateTime: end.toISOString(),
                    timeZone: 'UTC',
                },
                availabilityViewInterval: 60, // 60-minute slots
            });
            const busySlots = [];
            if (response.value && response.value[0]?.scheduleItems) {
                for (const item of response.value[0].scheduleItems) {
                    if (item.status === 'busy' || item.status === 'tentative') {
                        busySlots.push({
                            start: new Date(item.start.dateTime),
                            end: new Date(item.end.dateTime),
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
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, error }, 'Failed to get availability');
            throw error;
        }
    }
    /**
     * Calculate free time slots from busy periods
     */
    calculateFreeSlots(start, end, busySlots) {
        const freeSlots = [];
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
exports.ExchangeCalendarProvider = ExchangeCalendarProvider;
//# sourceMappingURL=exchange-calendar.provider.js.map