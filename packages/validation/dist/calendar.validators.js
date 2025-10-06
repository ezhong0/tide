/**
 * Calendar-specific validation schemas
 */
import { z } from 'zod';
import { emailAddressArraySchema, datetimeSchema, uuidSchema, timeOfDaySchema, paginationSchema, urlSchema, } from './common.validators.js';
// ============================================================================
// Attendee Validators
// ============================================================================
export const attendeeSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    optional: z.boolean().default(false),
    responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional(),
});
export const attendeesArraySchema = z.array(attendeeSchema).max(100);
// ============================================================================
// Conference Data Validators
// ============================================================================
export const conferenceTypeSchema = z.enum(['zoom', 'meet', 'teams', 'other']);
export const conferenceDataSchema = z.object({
    type: conferenceTypeSchema,
    url: urlSchema,
    id: z.string().optional(),
    pin: z.string().optional(),
});
// ============================================================================
// Recurrence Validators
// ============================================================================
export const recurrenceSchema = z.object({
    rule: z.string().regex(/^RRULE:/, 'Must be a valid RRULE string'),
    exceptions: z.array(datetimeSchema).optional(),
});
// ============================================================================
// Event Validators
// ============================================================================
export const eventTitleSchema = z.string().min(1).max(300);
export const eventDescriptionSchema = z.string().max(5000).optional();
export const eventLocationSchema = z.string().max(500).optional();
export const eventStatusSchema = z.enum(['confirmed', 'tentative', 'cancelled']);
export const eventResponseSchema = z.enum(['accepted', 'declined', 'tentative']);
// ============================================================================
// Calendar Request Validators
// ============================================================================
export const createEventSchema = z
    .object({
    title: eventTitleSchema,
    description: eventDescriptionSchema,
    start: datetimeSchema,
    end: datetimeSchema,
    isAllDay: z.boolean().default(false),
    location: eventLocationSchema,
    attendees: attendeesArraySchema,
    conferenceData: conferenceDataSchema.optional(),
    sendNotifications: z.boolean().default(true),
    recurrence: recurrenceSchema.optional(),
})
    .refine((data) => new Date(data.start) < new Date(data.end), {
    message: 'Event start must be before end',
});
export const updateEventSchema = z
    .object({
    id: uuidSchema,
    title: eventTitleSchema.optional(),
    description: eventDescriptionSchema,
    start: datetimeSchema.optional(),
    end: datetimeSchema.optional(),
    isAllDay: z.boolean().optional(),
    location: eventLocationSchema,
    attendees: attendeesArraySchema.optional(),
    conferenceData: conferenceDataSchema.optional(),
    status: eventStatusSchema.optional(),
    sendNotifications: z.boolean().default(true),
})
    .refine((data) => {
    if (data.start && data.end) {
        return new Date(data.start) < new Date(data.end);
    }
    return true;
}, {
    message: 'Event start must be before end',
});
export const deleteEventSchema = z.object({
    id: uuidSchema,
    sendNotifications: z.boolean().default(true),
});
export const getEventsSchema = z
    .object({
    start: datetimeSchema.optional(),
    end: datetimeSchema.optional(),
})
    .merge(paginationSchema)
    .refine((data) => {
    if (data.start && data.end) {
        return new Date(data.start) < new Date(data.end);
    }
    return true;
}, {
    message: 'Start date must be before end date',
});
export const respondToEventSchema = z.object({
    id: uuidSchema,
    response: eventResponseSchema,
    comment: z.string().max(500).optional(),
});
// ============================================================================
// Availability Validators
// ============================================================================
export const checkAvailabilitySchema = z
    .object({
    start: datetimeSchema,
    end: datetimeSchema,
    durationMinutes: z.number().int().min(15).max(480),
    timeOfDay: timeOfDaySchema.optional(),
    preferredDays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
    participants: emailAddressArraySchema.optional(),
})
    .refine((data) => new Date(data.start) < new Date(data.end), {
    message: 'Start date must be before end date',
});
//# sourceMappingURL=calendar.validators.js.map