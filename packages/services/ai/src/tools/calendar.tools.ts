/**
 * Calendar Tools for GPT-5 Function Calling
 */

import type { TideTool } from './types.js';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'CalendarTools' });

/**
 * Get calendar events for a date range
 */
export const getCalendarEventsTool: TideTool = {
  type: 'function',
  name: 'get_calendar_events',
  description: 'Retrieve calendar events for a specific date range. Returns events with title, time, attendees, and location.',
  parameters: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'Start date for the range (ISO 8601 format)',
      },
      endDate: {
        type: 'string',
        description: 'End date for the range (ISO 8601 format)',
      },
      includeDeclined: {
        type: 'boolean',
        description: 'Whether to include events the user declined (default: false)',
      },
    },
    required: ['startDate', 'endDate'],
  },
  handler: async (params, context) => {
    const { startDate, endDate, includeDeclined = false } = params;

    logger.info('Getting calendar events', {
      startDate,
      endDate,
      userId: context.userId,
    });

    const response = await fetch(
      `${process.env.CALENDAR_SERVICE_URL}/api/calendar/events?` +
      new URLSearchParams({
        userId: context.userId,
        startDate,
        endDate,
        includeDeclined: includeDeclined.toString(),
      }),
      {
        headers: {
          'Authorization': `Bearer ${context.userId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get calendar events: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * Create a new calendar event
 */
export const createCalendarEventTool: TideTool = {
  type: 'function',
  name: 'create_calendar_event',
  description: 'Create a new calendar event. Returns the created event with its ID. IMPORTANT: Check for conflicts before creating.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Event title',
      },
      startTime: {
        type: 'string',
        description: 'Event start time (ISO 8601 datetime)',
      },
      endTime: {
        type: 'string',
        description: 'Event end time (ISO 8601 datetime)',
      },
      description: {
        type: 'string',
        description: 'Event description or notes',
      },
      location: {
        type: 'string',
        description: 'Event location (physical address or video call link)',
      },
      attendees: {
        type: 'array',
        description: 'Email addresses of attendees to invite',
        items: {
          type: 'string',
          description: 'Attendee email address',
        },
      },
      sendNotifications: {
        type: 'boolean',
        description: 'Whether to send email notifications to attendees (default: true)',
      },
    },
    required: ['title', 'startTime', 'endTime'],
  },
  handler: async (params, context) => {
    const {
      title,
      startTime,
      endTime,
      description,
      location,
      attendees,
      sendNotifications = true,
    } = params;

    logger.info('Creating calendar event', {
      title,
      startTime,
      userId: context.userId,
    });

    const response = await fetch(`${process.env.CALENDAR_SERVICE_URL}/api/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.userId}`,
      },
      body: JSON.stringify({
        userId: context.userId,
        title,
        startTime,
        endTime,
        description,
        location,
        attendees,
        sendNotifications,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * Find optimal meeting times
 */
export const findMeetingTimesTool: TideTool = {
  type: 'function',
  name: 'find_meeting_times',
  description: 'Find optimal meeting times considering attendee calendars and constraints. Returns suggested time slots ranked by suitability.',
  parameters: {
    type: 'object',
    properties: {
      attendees: {
        type: 'array',
        description: 'Email addresses of required attendees',
        items: {
          type: 'string',
          description: 'Attendee email address',
        },
      },
      duration: {
        type: 'number',
        description: 'Meeting duration in minutes',
        minimum: 15,
        maximum: 480,
      },
      dateRange: {
        type: 'object',
        description: 'Date range to search within',
        properties: {
          start: {
            type: 'string',
            description: 'Start date (ISO 8601)',
          },
          end: {
            type: 'string',
            description: 'End date (ISO 8601)',
          },
        },
        required: ['start', 'end'],
      },
      constraints: {
        type: 'object',
        description: 'Meeting time constraints and preferences',
        properties: {
          preferredTimes: {
            type: 'array',
            description: 'Preferred time windows (e.g., "9:00-12:00")',
            items: {
              type: 'string',
              description: 'Time range',
            },
          },
          avoidBackToBack: {
            type: 'boolean',
            description: 'Avoid scheduling back-to-back with other meetings',
          },
          minBreakMinutes: {
            type: 'number',
            description: 'Minimum break time before/after meeting in minutes',
          },
          workingHoursOnly: {
            type: 'boolean',
            description: 'Only suggest times during working hours (9am-5pm)',
          },
        },
      },
    },
    required: ['attendees', 'duration'],
  },
  handler: async (params, context) => {
    const { attendees, duration, dateRange, constraints } = params;

    logger.info('Finding meeting times', {
      attendees,
      duration,
      userId: context.userId,
    });

    const response = await fetch(`${process.env.CALENDAR_SERVICE_URL}/api/calendar/find-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.userId}`,
      },
      body: JSON.stringify({
        userId: context.userId,
        attendees,
        duration,
        dateRange,
        constraints,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to find meeting times: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * Analyze calendar load and schedule health
 */
export const analyzeCalendarLoadTool: TideTool = {
  type: 'function',
  name: 'analyze_calendar_load',
  description: 'Analyze calendar to find busy periods, free time, back-to-back meetings, and optimization opportunities. Returns detailed analysis with recommendations.',
  parameters: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'Analysis start date (ISO 8601)',
      },
      endDate: {
        type: 'string',
        description: 'Analysis end date (ISO 8601)',
      },
      includeWeekends: {
        type: 'boolean',
        description: 'Include weekends in analysis (default: false)',
      },
    },
    required: ['startDate', 'endDate'],
  },
  handler: async (params, context) => {
    const { startDate, endDate, includeWeekends = false } = params;

    logger.info('Analyzing calendar load', {
      startDate,
      endDate,
      userId: context.userId,
    });

    const response = await fetch(`${process.env.CALENDAR_SERVICE_URL}/api/calendar/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.userId}`,
      },
      body: JSON.stringify({
        userId: context.userId,
        startDate,
        endDate,
        includeWeekends,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze calendar: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * All calendar tools
 */
export const calendarTools: TideTool[] = [
  getCalendarEventsTool,
  createCalendarEventTool,
  findMeetingTimesTool,
  analyzeCalendarLoadTool,
];
