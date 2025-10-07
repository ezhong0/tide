import { z } from 'zod';
import { ContactSchema } from './email.schema';
import { DateTimeSchema } from './base.schema';

/**
 * Meeting type schema
 */
export const MeetingTypeSchema = z.enum(['internal', 'external', 'one-on-one', 'board', 'team', 'client']);

/**
 * Event status schema
 */
export const EventStatusSchema = z.enum(['confirmed', 'tentative', 'cancelled']);

/**
 * Meeting prep schema
 */
export const MeetingPrepSchema = z.object({
  summary: z.string(),
  attendeeInsights: z.array(z.string()).optional(),
  talkingPoints: z.array(z.string()).optional(),
  relatedDocs: z.array(z.string()).optional(),
  relatedEmails: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  agenda: z.string().optional(),
});

export type MeetingPrep = z.infer<typeof MeetingPrepSchema>;

/**
 * Calendar event schema
 */
export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  start: DateTimeSchema,
  end: DateTimeSchema,
  allDay: z.boolean().default(false),
  attendees: z.array(ContactSchema).default([]),
  location: z.string().optional(),
  virtualMeetingUrl: z.string().url().optional(),
  meetingType: MeetingTypeSchema.optional(),
  status: EventStatusSchema.default('confirmed'),
  hasPrep: z.boolean().default(false),
  meetingPrep: MeetingPrepSchema.optional(),
  reminders: z.array(z.object({
    method: z.enum(['email', 'popup', 'sms']),
    minutesBefore: z.number().int().positive(),
  })).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive().default(1),
    endDate: DateTimeSchema.optional(),
    count: z.number().int().positive().optional(),
  }).optional(),
  color: z.string().optional(),
  visibility: z.enum(['public', 'private', 'confidential']).default('public'),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['end'],
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

/**
 * Create calendar event schema
 */
export const CreateCalendarEventSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  start: DateTimeSchema,
  end: DateTimeSchema,
  allDay: z.boolean().default(false),
  attendees: z.array(ContactSchema).optional(),
  location: z.string().optional(),
  virtualMeetingUrl: z.string().url().optional(),
  meetingType: MeetingTypeSchema.optional(),
  reminders: z.array(z.object({
    method: z.enum(['email', 'popup', 'sms']),
    minutesBefore: z.number().int().positive(),
  })).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive().default(1),
    endDate: DateTimeSchema.optional(),
    count: z.number().int().positive().optional(),
  }).optional(),
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['end'],
});

export type CreateCalendarEvent = z.infer<typeof CreateCalendarEventSchema>;

/**
 * Available slot schema
 */
export const AvailableSlotSchema = z.object({
  start: DateTimeSchema,
  end: DateTimeSchema,
  allAvailable: z.boolean(),
  unavailableAttendees: z.array(ContactSchema).optional(),
});

export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;

/**
 * Find available slots request schema
 */
export const FindAvailableSlotsSchema = z.object({
  participants: z.array(z.string().email()).min(1),
  duration: z.number().int().positive(), // in minutes
  startDate: DateTimeSchema,
  endDate: DateTimeSchema,
  workingHoursOnly: z.boolean().default(true),
  timezone: z.string().optional(),
});

export type FindAvailableSlots = z.infer<typeof FindAvailableSlotsSchema>;

/**
 * Calendar optimization result schema
 */
export const CalendarOptimizationSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(['move', 'shorten', 'combine', 'add_buffer', 'remove']),
    eventId: z.string(),
    description: z.string(),
    impact: z.number().min(0).max(1), // 0-1 score
    newTime: z.object({
      start: DateTimeSchema,
      end: DateTimeSchema,
    }).optional(),
  })),
  conflicts: z.array(z.object({
    eventId: z.string(),
    conflictingEventId: z.string(),
    description: z.string(),
  })),
  focusTimeBlocks: z.array(z.object({
    start: DateTimeSchema,
    end: DateTimeSchema,
    duration: z.number().int().positive(),
  })),
  statistics: z.object({
    totalMeetingTime: z.number().int().nonnegative(),
    longestMeetingStreak: z.number().int().nonnegative(),
    focusTimePercentage: z.number().min(0).max(100),
    backToBackMeetings: z.number().int().nonnegative(),
  }),
});

export type CalendarOptimization = z.infer<typeof CalendarOptimizationSchema>;
