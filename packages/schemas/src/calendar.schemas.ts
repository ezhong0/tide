/**
 * Calendar domain validation schemas
 * Runtime validation for calendar operations
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  TimestampSchema,
  TimeStringSchema,
  DurationMinutesSchema,
  CalendarProviderSchema
} from './primitives.schemas';

// Event types
export const EventTypeSchema = z.enum([
  'meeting',
  'appointment',
  'task',
  'reminder',
  'focus',
  'out-of-office'
]);

// Event status
export const EventStatusSchema = z.enum(['tentative', 'confirmed', 'cancelled']);

// Response status
export const ResponseStatusSchema = z.enum(['accepted', 'declined', 'tentative', 'pending']);

// Day of week
export const DayOfWeekSchema = z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']);

// Event location
export const EventLocationSchema = z.object({
  type: z.enum(['physical', 'virtual', 'hybrid']),
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  room: z.string().max(100).optional(),
  floor: z.string().max(20).optional(),
  meetingUrl: z.string().url().optional()
}).refine(
  data => {
    if (data.type === 'virtual') return !!data.meetingUrl;
    if (data.type === 'physical') return !!data.address;
    return true;
  },
  'Virtual events require meeting URL, physical events require address'
);

// Participant
export const ParticipantSchema = z.object({
  userId: UUIDSchema.optional(),
  email: EmailSchema,
  name: z.string().min(1).max(100),
  role: z.enum(['organizer', 'required', 'optional', 'resource']),
  responseStatus: ResponseStatusSchema,
  responseTime: TimestampSchema.optional(),
  comment: z.string().max(500).optional(),
  isResource: z.boolean().optional()
});

// Reminder configuration
export const ReminderSchema = z.object({
  type: z.enum(['email', 'popup', 'sms', 'push']),
  minutesBefore: z.number().int().min(0).max(40320), // Max 4 weeks
  message: z.string().max(500).optional()
});

// Conference data
export const ConferenceDataSchema = z.object({
  type: z.enum(['zoom', 'teams', 'meet', 'webex', 'other']),
  url: z.string().url(),
  meetingId: z.string().max(100).optional(),
  passcode: z.string().max(50).optional(),
  phoneNumbers: z.array(z.object({
    number: z.string().regex(/^[\d+\s()-]+$/),
    region: z.string().max(50),
    pin: z.string().max(20).optional()
  })).optional(),
  notes: z.string().max(500).optional()
});

// Recurrence rule
export const RecurrenceRuleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().min(1).max(100),
  count: z.number().int().min(1).max(999).optional(),
  until: TimestampSchema.optional(),
  byDay: z.array(DayOfWeekSchema).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  exceptions: z.array(TimestampSchema).optional()
}).refine(
  data => !(data.count && data.until),
  'Cannot specify both count and until for recurrence'
);

// Create calendar event
export const CreateCalendarEventSchema = z.object({
  userId: UUIDSchema,
  title: z.string().min(1, 'Event title required').max(200),
  description: z.string().max(2000).optional(),
  location: EventLocationSchema.optional(),
  type: EventTypeSchema,
  status: EventStatusSchema.default('confirmed'),
  startTime: TimestampSchema,
  endTime: TimestampSchema,
  timezone: z.string().default('UTC'),
  isAllDay: z.boolean().default(false),
  attendees: z.array(ParticipantSchema).max(100).optional(),
  reminders: z.array(ReminderSchema).max(5).optional(),
  conferenceData: ConferenceDataSchema.optional(),
  recurrence: RecurrenceRuleSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  categories: z.array(z.string().max(50)).max(10).optional(),
  isPrivate: z.boolean().default(false)
}).refine(
  data => data.endTime > data.startTime,
  'End time must be after start time'
).refine(
  data => data.endTime - data.startTime <= 24 * 60 * 60 * 1000 || data.isAllDay,
  'Single event cannot be longer than 24 hours unless all-day'
);

// Update calendar event
export const UpdateCalendarEventSchema = CreateCalendarEventSchema.partial().extend({
  eventId: UUIDSchema
});

// Availability check parameters
export const AvailabilityParamsSchema = z.object({
  userId: UUIDSchema,
  timeRange: z.object({
    start: TimestampSchema,
    end: TimestampSchema
  }),
  duration: DurationMinutesSchema,
  excludeEvents: z.array(UUIDSchema).optional(),
  includeBufferTime: z.boolean().default(true),
  workingHoursOnly: z.boolean().default(true),
  constraints: z.object({
    earliestTime: TimeStringSchema.optional(),
    latestTime: TimeStringSchema.optional(),
    avoidDays: z.array(DayOfWeekSchema).optional(),
    bufferBefore: z.number().int().min(0).max(60).optional(),
    bufferAfter: z.number().int().min(0).max(60).optional(),
    maxConsecutiveHours: z.number().min(1).max(8).optional(),
    preferredLocation: z.enum(['remote', 'office', 'any']).optional()
  }).optional()
});

// Meeting constraints for finding times
export const MeetingConstraintsSchema = z.object({
  duration: DurationMinutesSchema,
  requiredAttendees: z.array(EmailSchema).min(1).max(50),
  optionalAttendees: z.array(EmailSchema).max(50).optional(),
  roomRequired: z.boolean().default(false),
  equipmentRequired: z.array(z.string()).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  preferredTimes: z.array(z.object({
    start: TimeStringSchema,
    end: TimeStringSchema,
    weight: z.number().min(0).max(1)
  })).optional()
});

// Working hours configuration
export const WorkingHoursSchema = z.object({
  userId: UUIDSchema,
  timezone: z.string(),
  schedule: z.array(z.object({
    day: DayOfWeekSchema,
    isWorkingDay: z.boolean(),
    start: TimeStringSchema.optional(),
    end: TimeStringSchema.optional(),
    breaks: z.array(z.object({
      start: TimeStringSchema,
      end: TimeStringSchema
    })).optional()
  })).length(7), // Must have all 7 days
  exceptions: z.array(z.object({
    date: TimestampSchema,
    isWorkingDay: z.boolean(),
    reason: z.string().max(200).optional()
  })).optional()
});

// Calendar preferences
export const CalendarPreferencesSchema = z.object({
  userId: UUIDSchema,
  defaultCalendarId: UUIDSchema,
  defaultMeetingDuration: DurationMinutesSchema.default(30),
  defaultReminders: z.array(ReminderSchema).max(5),
  workingHours: WorkingHoursSchema,
  autoDeclineConflicts: z.boolean().default(false),
  showDeclinedEvents: z.boolean().default(true),
  weekStartsOn: DayOfWeekSchema.default('MO'),
  timeZone: z.string(),
  preferredMeetingTypes: z.array(EventTypeSchema)
});