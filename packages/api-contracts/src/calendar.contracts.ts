/**
 * Calendar API Contracts
 *
 * Zod schemas for all calendar-related API endpoints
 */

import { z } from 'zod';

// ============================================================================
// Shared Schemas
// ============================================================================

export const AttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  optional: z.boolean().default(false),
  responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional(),
});

export const ConferenceDataSchema = z.object({
  type: z.enum(['zoom', 'meet', 'teams', 'other']),
  url: z.string().url(),
  id: z.string().optional(),
  pin: z.string().optional(),
});

// ============================================================================
// Request Schemas
// ============================================================================

export const CreateEventRequestSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  isAllDay: z.boolean().default(false),
  location: z.string().max(500).optional(),
  attendees: z.array(AttendeeSchema).max(100),
  conferenceData: ConferenceDataSchema.optional(),
  sendNotifications: z.boolean().default(true),
  recurrence: z
    .object({
      rule: z.string(), // RRULE format
    })
    .optional(),
});

export const UpdateEventRequestSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  isAllDay: z.boolean().optional(),
  location: z.string().max(500).optional(),
  attendees: z.array(AttendeeSchema).max(100).optional(),
  conferenceData: ConferenceDataSchema.optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
  sendNotifications: z.boolean().default(true),
});

export const DeleteEventRequestSchema = z.object({
  id: z.string().uuid(),
  sendNotifications: z.boolean().default(true),
});

export const GetEventRequestSchema = z.object({
  id: z.string().uuid(),
});

export const GetEventsRequestSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  page: z.number().int().min(1).default(1),
});

export const CheckAvailabilityRequestSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(480),
  timeOfDay: z.enum(['morning', 'lunch', 'afternoon', 'evening']).optional(),
  preferredDays: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
  participants: z.array(z.string().email()).max(50).optional(),
});

export const RespondToEventRequestSchema = z.object({
  id: z.string().uuid(),
  response: z.enum(['accepted', 'declined', 'tentative']),
  comment: z.string().max(500).optional(),
});

// ============================================================================
// Response Schemas
// ============================================================================

export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  isAllDay: z.boolean(),
  timezone: z.string(),
  attendees: z.array(
    AttendeeSchema.extend({
      responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']),
    })
  ),
  organizer: z.object({
    email: z.string(),
    name: z.string().optional(),
    self: z.boolean(),
  }),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']),
  meetingUrl: z.string().url().optional(),
  conferenceData: ConferenceDataSchema.optional(),
  recurrence: z
    .object({
      rule: z.string(),
      exceptions: z.array(z.string().datetime()).optional(),
    })
    .optional(),
  aiSuggestions: z
    .object({
      suggestedPrep: z.array(z.string()).optional(),
      relatedEmails: z.array(z.string()).optional(),
      suggestedActionItems: z.array(z.string()).optional(),
      meetingSummary: z.string().optional(),
    })
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateEventResponseSchema = z.object({
  success: z.boolean(),
  eventId: z.string().uuid(),
  externalId: z.string(),
  event: CalendarEventSchema,
});

export const UpdateEventResponseSchema = z.object({
  success: z.boolean(),
  event: CalendarEventSchema,
});

export const DeleteEventResponseSchema = z.object({
  success: z.boolean(),
  deletedAt: z.string().datetime(),
});

export const GetEventResponseSchema = CalendarEventSchema;

export const GetEventsResponseSchema = z.object({
  events: z.array(CalendarEventSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});

export const TimeSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  score: z.number().min(0).max(100),
  reason: z.string(),
  conflicts: z.array(
    z.object({
      eventId: z.string(),
      title: z.string(),
      start: z.string().datetime(),
      end: z.string().datetime(),
      type: z.enum(['hard', 'soft']),
    })
  ),
  isPreferred: z.boolean(),
});

export const CheckAvailabilityResponseSchema = z.object({
  availableSlots: z.array(TimeSlotSchema),
  totalSlots: z.number().int().nonnegative(),
  preferredSlots: z.array(TimeSlotSchema),
});

export const RespondToEventResponseSchema = z.object({
  success: z.boolean(),
  event: CalendarEventSchema,
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
export type CreateEventResponse = z.infer<typeof CreateEventResponseSchema>;

export type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;
export type UpdateEventResponse = z.infer<typeof UpdateEventResponseSchema>;

export type DeleteEventRequest = z.infer<typeof DeleteEventRequestSchema>;
export type DeleteEventResponse = z.infer<typeof DeleteEventResponseSchema>;

export type GetEventRequest = z.infer<typeof GetEventRequestSchema>;
export type GetEventResponse = z.infer<typeof GetEventResponseSchema>;

export type GetEventsRequest = z.infer<typeof GetEventsRequestSchema>;
export type GetEventsResponse = z.infer<typeof GetEventsResponseSchema>;

export type CheckAvailabilityRequest = z.infer<typeof CheckAvailabilityRequestSchema>;
export type CheckAvailabilityResponse = z.infer<typeof CheckAvailabilityResponseSchema>;

export type RespondToEventRequest = z.infer<typeof RespondToEventRequestSchema>;
export type RespondToEventResponse = z.infer<typeof RespondToEventResponseSchema>;

// ============================================================================
// Contract Definitions
// ============================================================================

export const CalendarContracts = {
  createEvent: {
    method: 'POST' as const,
    path: '/api/calendar/events',
    request: CreateEventRequestSchema,
    response: CreateEventResponseSchema,
  },
  updateEvent: {
    method: 'PUT' as const,
    path: '/api/calendar/events/:id',
    request: UpdateEventRequestSchema,
    response: UpdateEventResponseSchema,
  },
  deleteEvent: {
    method: 'DELETE' as const,
    path: '/api/calendar/events/:id',
    request: DeleteEventRequestSchema,
    response: DeleteEventResponseSchema,
  },
  getEvent: {
    method: 'GET' as const,
    path: '/api/calendar/events/:id',
    request: GetEventRequestSchema,
    response: GetEventResponseSchema,
  },
  getEvents: {
    method: 'GET' as const,
    path: '/api/calendar/events',
    request: GetEventsRequestSchema,
    response: GetEventsResponseSchema,
  },
  checkAvailability: {
    method: 'POST' as const,
    path: '/api/calendar/availability',
    request: CheckAvailabilityRequestSchema,
    response: CheckAvailabilityResponseSchema,
  },
  respondToEvent: {
    method: 'POST' as const,
    path: '/api/calendar/events/:id/respond',
    request: RespondToEventRequestSchema,
    response: RespondToEventResponseSchema,
  },
} as const;
