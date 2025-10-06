import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  CalendarEventSchema,
  CalendarSchema,
  SchedulingRequestSchema,
  SchedulingSuggestionSchema,
  MeetingPrepSchema,
  CalendarAccountSchema,
  ErrorResponseSchema,
  AttendeeSchema,
} from '@tide/types';

const c = initContract();

export const calendarContract = c.router({
  // Get events
  getEvents: {
    method: 'GET',
    path: '/calendar/events',
    query: z.object({
      calendarId: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      type: z.string().optional(),
    }),
    responses: {
      200: z.object({
        data: z.array(CalendarEventSchema),
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get calendar events',
  },

  // Get a specific event
  getEvent: {
    method: 'GET',
    path: '/calendar/events/:eventId',
    pathParams: z.object({
      eventId: z.string(),
    }),
    responses: {
      200: CalendarEventSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get a specific event',
  },

  // Create event
  createEvent: {
    method: 'POST',
    path: '/calendar/events',
    body: z.object({
      calendarId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      startTime: z.number(),
      endTime: z.number(),
      timezone: z.string(),
      attendees: z.array(AttendeeSchema).optional(),
      location: z.object({
        name: z.string(),
        address: z.string().optional(),
        isVirtual: z.boolean(),
        meetingUrl: z.string().url().optional(),
      }).optional(),
      type: z.enum(['meeting', 'call', 'deadline', 'reminder', 'block', 'travel', 'personal']).optional(),
    }),
    responses: {
      201: CalendarEventSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Create a calendar event',
  },

  // Update event
  updateEvent: {
    method: 'PATCH',
    path: '/calendar/events/:eventId',
    pathParams: z.object({
      eventId: z.string(),
    }),
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      startTime: z.number().optional(),
      endTime: z.number().optional(),
      timezone: z.string().optional(),
      attendees: z.array(AttendeeSchema).optional(),
      location: z.object({
        name: z.string(),
        address: z.string().optional(),
        isVirtual: z.boolean(),
        meetingUrl: z.string().url().optional(),
      }).optional(),
      status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
    }),
    responses: {
      200: CalendarEventSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Update a calendar event',
  },

  // Delete event
  deleteEvent: {
    method: 'DELETE',
    path: '/calendar/events/:eventId',
    pathParams: z.object({
      eventId: z.string(),
    }),
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Delete a calendar event',
  },

  // Get scheduling suggestions
  getSchedulingSuggestions: {
    method: 'POST',
    path: '/calendar/scheduling/suggestions',
    body: SchedulingRequestSchema,
    responses: {
      200: z.object({
        suggestions: z.array(SchedulingSuggestionSchema),
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get smart scheduling suggestions',
  },

  // Get meeting preparation
  getMeetingPrep: {
    method: 'GET',
    path: '/calendar/events/:eventId/prep',
    pathParams: z.object({
      eventId: z.string(),
    }),
    responses: {
      200: MeetingPrepSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get AI-generated meeting preparation',
  },

  // Get calendars
  getCalendars: {
    method: 'GET',
    path: '/calendar/calendars',
    responses: {
      200: z.object({
        data: z.array(CalendarSchema),
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get all calendars',
  },

  // Create calendar
  createCalendar: {
    method: 'POST',
    path: '/calendar/calendars',
    body: z.object({
      name: z.string(),
      description: z.string().optional(),
      color: z.string(),
      timezone: z.string(),
    }),
    responses: {
      201: CalendarSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Create a calendar',
  },

  // Update calendar
  updateCalendar: {
    method: 'PATCH',
    path: '/calendar/calendars/:calendarId',
    pathParams: z.object({
      calendarId: z.string(),
    }),
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
    responses: {
      200: CalendarSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Update a calendar',
  },

  // Delete calendar
  deleteCalendar: {
    method: 'DELETE',
    path: '/calendar/calendars/:calendarId',
    pathParams: z.object({
      calendarId: z.string(),
    }),
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Delete a calendar',
  },

  // Sync calendar
  syncCalendar: {
    method: 'POST',
    path: '/calendar/sync',
    body: z.object({
      accountId: z.string().uuid().optional(),
    }),
    responses: {
      202: z.object({
        message: z.string(),
        jobId: z.string(),
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Trigger calendar sync',
  },

  // Get calendar accounts
  getAccounts: {
    method: 'GET',
    path: '/calendar/accounts',
    responses: {
      200: z.object({
        data: z.array(CalendarAccountSchema),
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get calendar accounts',
  },

  // Connect calendar account
  connectAccount: {
    method: 'POST',
    path: '/calendar/accounts',
    body: z.object({
      provider: z.enum(['google', 'outlook', 'exchange']),
      authCode: z.string(),
    }),
    responses: {
      201: CalendarAccountSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Connect a calendar account',
  },

  // Disconnect calendar account
  disconnectAccount: {
    method: 'DELETE',
    path: '/calendar/accounts/:accountId',
    pathParams: z.object({
      accountId: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Disconnect a calendar account',
  },
});
