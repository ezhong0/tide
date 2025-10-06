import { z } from 'zod';
import { UserIdSchema } from './base.types.js';

// ============================================================================
// Calendar Event Types
// ============================================================================

export const EventIdSchema = z.string().brand('EventId');
export type EventId = z.infer<typeof EventIdSchema>;

export const CalendarIdSchema = z.string().brand('CalendarId');
export type CalendarId = z.infer<typeof CalendarIdSchema>;

export const AttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  status: z.enum(['accepted', 'declined', 'tentative', 'needs_action']),
  isOrganizer: z.boolean().optional(),
  isOptional: z.boolean().optional(),
});

export type Attendee = z.infer<typeof AttendeeSchema>;

export const EventTypeSchema = z.enum([
  'meeting',
  'call',
  'deadline',
  'reminder',
  'block',
  'travel',
  'personal',
]);

export type EventType = z.infer<typeof EventTypeSchema>;

export const RecurrenceRuleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().min(1),
  until: z.number().optional(),
  count: z.number().int().optional(),
  byDay: z.array(z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
});

export type RecurrenceRule = z.infer<typeof RecurrenceRuleSchema>;

export const CalendarEventSchema = z.object({
  id: EventIdSchema,
  userId: UserIdSchema,
  calendarId: CalendarIdSchema,
  title: z.string(),
  description: z.string().optional(),
  location: z.object({
    name: z.string(),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    isVirtual: z.boolean(),
    meetingUrl: z.string().url().optional(),
  }).optional(),
  type: EventTypeSchema,
  startTime: z.number(),
  endTime: z.number(),
  isAllDay: z.boolean(),
  timezone: z.string(),
  attendees: z.array(AttendeeSchema).optional(),
  organizer: AttendeeSchema.optional(),
  recurrence: RecurrenceRuleSchema.optional(),
  reminders: z.array(z.object({
    method: z.enum(['email', 'notification', 'sms']),
    minutesBefore: z.number().int(),
  })).optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  visibility: z.enum(['public', 'private', 'confidential']),
  aiAnalysis: z.object({
    importance: z.number().min(0).max(1).optional(),
    prepTime: z.number().optional(),
    suggestedPrep: z.array(z.string()).optional(),
    relatedEmails: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    participants: z.array(z.object({
      email: z.string(),
      relationship: z.string(),
      context: z.string(),
    })).optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// ============================================================================
// Calendar Types
// ============================================================================

export const CalendarSchema = z.object({
  id: CalendarIdSchema,
  userId: UserIdSchema,
  name: z.string(),
  description: z.string().optional(),
  color: z.string(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  timezone: z.string(),
  settings: z.object({
    defaultReminders: z.array(z.object({
      method: z.enum(['email', 'notification', 'sms']),
      minutesBefore: z.number(),
    })),
    defaultEventDuration: z.number(),
    workingHours: z.array(z.object({
      day: z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']),
      start: z.string(),
      end: z.string(),
    })).optional(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Calendar = z.infer<typeof CalendarSchema>;

// ============================================================================
// Scheduling Types
// ============================================================================

export const TimeSlotSchema = z.object({
  start: z.number(),
  end: z.number(),
  available: z.boolean(),
  score: z.number().min(0).max(1).optional(),
  reason: z.string().optional(),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;

export const SchedulingRequestSchema = z.object({
  userId: UserIdSchema,
  title: z.string(),
  duration: z.number(),
  attendees: z.array(z.string().email()),
  preferences: z.object({
    preferredTimes: z.array(z.object({
      day: z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']),
      startTime: z.string(),
      endTime: z.string(),
    })).optional(),
    avoidTimes: z.array(z.object({
      start: z.number(),
      end: z.number(),
    })).optional(),
    bufferBefore: z.number().optional(),
    bufferAfter: z.number().optional(),
    preferBackToBack: z.boolean().optional(),
  }).optional(),
  constraints: z.object({
    minDate: z.number().optional(),
    maxDate: z.number().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export type SchedulingRequest = z.infer<typeof SchedulingRequestSchema>;

export const SchedulingSuggestionSchema = z.object({
  timeSlot: TimeSlotSchema,
  score: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  conflicts: z.array(z.object({
    eventId: EventIdSchema,
    title: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  })).optional(),
  travelTime: z.object({
    before: z.number(),
    after: z.number(),
  }).optional(),
});

export type SchedulingSuggestion = z.infer<typeof SchedulingSuggestionSchema>;

// ============================================================================
// Calendar Provider Types
// ============================================================================

export const CalendarProviderSchema = z.enum(['google', 'outlook', 'exchange', 'caldav']);
export type CalendarProvider = z.infer<typeof CalendarProviderSchema>;

export const CalendarAccountSchema = z.object({
  id: z.string().uuid(),
  userId: UserIdSchema,
  provider: CalendarProviderSchema,
  email: z.string().email(),
  name: z.string(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  credentials: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: z.number(),
  }),
  settings: z.object({
    syncEnabled: z.boolean(),
    smartSchedulingEnabled: z.boolean(),
    prepRemindersEnabled: z.boolean(),
    syncFrequency: z.number(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastSyncAt: z.number().optional(),
});

export type CalendarAccount = z.infer<typeof CalendarAccountSchema>;

// ============================================================================
// Meeting Preparation Types
// ============================================================================

export const MeetingPrepSchema = z.object({
  eventId: EventIdSchema,
  brief: z.object({
    summary: z.string(),
    objectives: z.array(z.string()),
    agenda: z.array(z.string()).optional(),
    background: z.string().optional(),
  }),
  participants: z.array(z.object({
    email: z.string(),
    name: z.string().optional(),
    role: z.string().optional(),
    relationship: z.string().optional(),
    recentInteractions: z.array(z.object({
      type: z.enum(['email', 'meeting', 'message']),
      date: z.number(),
      summary: z.string(),
    })).optional(),
    notes: z.string().optional(),
  })),
  relatedDocuments: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    url: z.string().optional(),
    relevance: z.number(),
  })).optional(),
  suggestedTopics: z.array(z.string()),
  potentialQuestions: z.array(z.string()).optional(),
  generatedAt: z.number(),
});

export type MeetingPrep = z.infer<typeof MeetingPrepSchema>;
