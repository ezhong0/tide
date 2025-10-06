"use strict";
/**
 * Calendar domain validation schemas
 * Runtime validation for calendar operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarPreferencesSchema = exports.WorkingHoursSchema = exports.MeetingConstraintsSchema = exports.AvailabilityParamsSchema = exports.UpdateCalendarEventSchema = exports.CreateCalendarEventSchema = exports.RecurrenceRuleSchema = exports.ConferenceDataSchema = exports.ReminderSchema = exports.ParticipantSchema = exports.EventLocationSchema = exports.DayOfWeekSchema = exports.ResponseStatusSchema = exports.EventStatusSchema = exports.EventTypeSchema = void 0;
const zod_1 = require("zod");
const primitives_schemas_1 = require("./primitives.schemas");
// Event types
exports.EventTypeSchema = zod_1.z.enum([
    'meeting',
    'appointment',
    'task',
    'reminder',
    'focus',
    'out-of-office'
]);
// Event status
exports.EventStatusSchema = zod_1.z.enum(['tentative', 'confirmed', 'cancelled']);
// Response status
exports.ResponseStatusSchema = zod_1.z.enum(['accepted', 'declined', 'tentative', 'pending']);
// Day of week
exports.DayOfWeekSchema = zod_1.z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']);
// Event location
exports.EventLocationSchema = zod_1.z.object({
    type: zod_1.z.enum(['physical', 'virtual', 'hybrid']),
    name: zod_1.z.string().min(1).max(200),
    address: zod_1.z.string().max(500).optional(),
    coordinates: zod_1.z.object({
        latitude: zod_1.z.number().min(-90).max(90),
        longitude: zod_1.z.number().min(-180).max(180)
    }).optional(),
    room: zod_1.z.string().max(100).optional(),
    floor: zod_1.z.string().max(20).optional(),
    meetingUrl: zod_1.z.string().url().optional()
}).refine(data => {
    if (data.type === 'virtual')
        return !!data.meetingUrl;
    if (data.type === 'physical')
        return !!data.address;
    return true;
}, 'Virtual events require meeting URL, physical events require address');
// Participant
exports.ParticipantSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema.optional(),
    email: primitives_schemas_1.EmailSchema,
    name: zod_1.z.string().min(1).max(100),
    role: zod_1.z.enum(['organizer', 'required', 'optional', 'resource']),
    responseStatus: exports.ResponseStatusSchema,
    responseTime: primitives_schemas_1.TimestampSchema.optional(),
    comment: zod_1.z.string().max(500).optional(),
    isResource: zod_1.z.boolean().optional()
});
// Reminder configuration
exports.ReminderSchema = zod_1.z.object({
    type: zod_1.z.enum(['email', 'popup', 'sms', 'push']),
    minutesBefore: zod_1.z.number().int().min(0).max(40320), // Max 4 weeks
    message: zod_1.z.string().max(500).optional()
});
// Conference data
exports.ConferenceDataSchema = zod_1.z.object({
    type: zod_1.z.enum(['zoom', 'teams', 'meet', 'webex', 'other']),
    url: zod_1.z.string().url(),
    meetingId: zod_1.z.string().max(100).optional(),
    passcode: zod_1.z.string().max(50).optional(),
    phoneNumbers: zod_1.z.array(zod_1.z.object({
        number: zod_1.z.string().regex(/^[\d+\s()-]+$/),
        region: zod_1.z.string().max(50),
        pin: zod_1.z.string().max(20).optional()
    })).optional(),
    notes: zod_1.z.string().max(500).optional()
});
// Recurrence rule
exports.RecurrenceRuleSchema = zod_1.z.object({
    frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: zod_1.z.number().int().min(1).max(100),
    count: zod_1.z.number().int().min(1).max(999).optional(),
    until: primitives_schemas_1.TimestampSchema.optional(),
    byDay: zod_1.z.array(exports.DayOfWeekSchema).optional(),
    byMonthDay: zod_1.z.array(zod_1.z.number().int().min(1).max(31)).optional(),
    byMonth: zod_1.z.array(zod_1.z.number().int().min(1).max(12)).optional(),
    exceptions: zod_1.z.array(primitives_schemas_1.TimestampSchema).optional()
}).refine(data => !(data.count && data.until), 'Cannot specify both count and until for recurrence');
// Base calendar event schema (without refinement)
const CreateCalendarEventBase = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    title: zod_1.z.string().min(1, 'Event title required').max(200),
    description: zod_1.z.string().max(2000).optional(),
    location: exports.EventLocationSchema.optional(),
    type: exports.EventTypeSchema,
    status: exports.EventStatusSchema.default('confirmed'),
    startTime: primitives_schemas_1.TimestampSchema,
    endTime: primitives_schemas_1.TimestampSchema,
    timezone: zod_1.z.string().default('UTC'),
    isAllDay: zod_1.z.boolean().default(false),
    attendees: zod_1.z.array(exports.ParticipantSchema).max(100).optional(),
    reminders: zod_1.z.array(exports.ReminderSchema).max(5).optional(),
    conferenceData: exports.ConferenceDataSchema.optional(),
    recurrence: exports.RecurrenceRuleSchema.optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    categories: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    isPrivate: zod_1.z.boolean().default(false)
});
// Create calendar event
exports.CreateCalendarEventSchema = CreateCalendarEventBase.refine(data => data.endTime > data.startTime, 'End time must be after start time').refine(data => data.endTime - data.startTime <= 24 * 60 * 60 * 1000 || data.isAllDay, 'Single event cannot be longer than 24 hours unless all-day');
// Update calendar event
exports.UpdateCalendarEventSchema = CreateCalendarEventBase.partial().extend({
    eventId: primitives_schemas_1.UUIDSchema
});
// Availability check parameters
exports.AvailabilityParamsSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    timeRange: zod_1.z.object({
        start: primitives_schemas_1.TimestampSchema,
        end: primitives_schemas_1.TimestampSchema
    }),
    duration: primitives_schemas_1.DurationMinutesSchema,
    excludeEvents: zod_1.z.array(primitives_schemas_1.UUIDSchema).optional(),
    includeBufferTime: zod_1.z.boolean().default(true),
    workingHoursOnly: zod_1.z.boolean().default(true),
    constraints: zod_1.z.object({
        earliestTime: primitives_schemas_1.TimeStringSchema.optional(),
        latestTime: primitives_schemas_1.TimeStringSchema.optional(),
        avoidDays: zod_1.z.array(exports.DayOfWeekSchema).optional(),
        bufferBefore: zod_1.z.number().int().min(0).max(60).optional(),
        bufferAfter: zod_1.z.number().int().min(0).max(60).optional(),
        maxConsecutiveHours: zod_1.z.number().min(1).max(8).optional(),
        preferredLocation: zod_1.z.enum(['remote', 'office', 'any']).optional()
    }).optional()
});
// Meeting constraints for finding times
exports.MeetingConstraintsSchema = zod_1.z.object({
    duration: primitives_schemas_1.DurationMinutesSchema,
    requiredAttendees: zod_1.z.array(primitives_schemas_1.EmailSchema).min(1).max(50),
    optionalAttendees: zod_1.z.array(primitives_schemas_1.EmailSchema).max(50).optional(),
    roomRequired: zod_1.z.boolean().default(false),
    equipmentRequired: zod_1.z.array(zod_1.z.string()).optional(),
    title: zod_1.z.string().max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    preferredTimes: zod_1.z.array(zod_1.z.object({
        start: primitives_schemas_1.TimeStringSchema,
        end: primitives_schemas_1.TimeStringSchema,
        weight: zod_1.z.number().min(0).max(1)
    })).optional()
});
// Working hours configuration
exports.WorkingHoursSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    timezone: zod_1.z.string(),
    schedule: zod_1.z.array(zod_1.z.object({
        day: exports.DayOfWeekSchema,
        isWorkingDay: zod_1.z.boolean(),
        start: primitives_schemas_1.TimeStringSchema.optional(),
        end: primitives_schemas_1.TimeStringSchema.optional(),
        breaks: zod_1.z.array(zod_1.z.object({
            start: primitives_schemas_1.TimeStringSchema,
            end: primitives_schemas_1.TimeStringSchema
        })).optional()
    })).length(7), // Must have all 7 days
    exceptions: zod_1.z.array(zod_1.z.object({
        date: primitives_schemas_1.TimestampSchema,
        isWorkingDay: zod_1.z.boolean(),
        reason: zod_1.z.string().max(200).optional()
    })).optional()
});
// Calendar preferences
exports.CalendarPreferencesSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    defaultCalendarId: primitives_schemas_1.UUIDSchema,
    defaultMeetingDuration: primitives_schemas_1.DurationMinutesSchema.default(30),
    defaultReminders: zod_1.z.array(exports.ReminderSchema).max(5),
    workingHours: exports.WorkingHoursSchema,
    autoDeclineConflicts: zod_1.z.boolean().default(false),
    showDeclinedEvents: zod_1.z.boolean().default(true),
    weekStartsOn: exports.DayOfWeekSchema.default('MO'),
    timeZone: zod_1.z.string(),
    preferredMeetingTypes: zod_1.z.array(exports.EventTypeSchema)
});
//# sourceMappingURL=calendar.schemas.js.map