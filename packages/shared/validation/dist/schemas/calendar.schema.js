"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarOptimizationSchema = exports.FindAvailableSlotsSchema = exports.AvailableSlotSchema = exports.CreateCalendarEventSchema = exports.CalendarEventSchema = exports.MeetingPrepSchema = exports.EventStatusSchema = exports.MeetingTypeSchema = void 0;
const zod_1 = require("zod");
const email_schema_1 = require("./email.schema");
const base_schema_1 = require("./base.schema");
/**
 * Meeting type schema
 */
exports.MeetingTypeSchema = zod_1.z.enum(['internal', 'external', 'one-on-one', 'board', 'team', 'client']);
/**
 * Event status schema
 */
exports.EventStatusSchema = zod_1.z.enum(['confirmed', 'tentative', 'cancelled']);
/**
 * Meeting prep schema
 */
exports.MeetingPrepSchema = zod_1.z.object({
    summary: zod_1.z.string(),
    attendeeInsights: zod_1.z.array(zod_1.z.string()).optional(),
    talkingPoints: zod_1.z.array(zod_1.z.string()).optional(),
    relatedDocs: zod_1.z.array(zod_1.z.string()).optional(),
    relatedEmails: zod_1.z.array(zod_1.z.string()).optional(),
    objectives: zod_1.z.array(zod_1.z.string()).optional(),
    agenda: zod_1.z.string().optional(),
});
/**
 * Calendar event schema
 */
exports.CalendarEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().optional(),
    start: base_schema_1.DateTimeSchema,
    end: base_schema_1.DateTimeSchema,
    allDay: zod_1.z.boolean().default(false),
    attendees: zod_1.z.array(email_schema_1.ContactSchema).default([]),
    location: zod_1.z.string().optional(),
    virtualMeetingUrl: zod_1.z.string().url().optional(),
    meetingType: exports.MeetingTypeSchema.optional(),
    status: exports.EventStatusSchema.default('confirmed'),
    hasPrep: zod_1.z.boolean().default(false),
    meetingPrep: exports.MeetingPrepSchema.optional(),
    reminders: zod_1.z.array(zod_1.z.object({
        method: zod_1.z.enum(['email', 'popup', 'sms']),
        minutesBefore: zod_1.z.number().int().positive(),
    })).optional(),
    recurrence: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'yearly']),
        interval: zod_1.z.number().int().positive().default(1),
        endDate: base_schema_1.DateTimeSchema.optional(),
        count: zod_1.z.number().int().positive().optional(),
    }).optional(),
    color: zod_1.z.string().optional(),
    visibility: zod_1.z.enum(['public', 'private', 'confidential']).default('public'),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
}).refine((data) => {
    const start = new Date(data.start);
    const end = new Date(data.end);
    return end > start;
}, {
    message: 'End time must be after start time',
    path: ['end'],
});
/**
 * Create calendar event schema
 */
exports.CreateCalendarEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().optional(),
    start: base_schema_1.DateTimeSchema,
    end: base_schema_1.DateTimeSchema,
    allDay: zod_1.z.boolean().default(false),
    attendees: zod_1.z.array(email_schema_1.ContactSchema).optional(),
    location: zod_1.z.string().optional(),
    virtualMeetingUrl: zod_1.z.string().url().optional(),
    meetingType: exports.MeetingTypeSchema.optional(),
    reminders: zod_1.z.array(zod_1.z.object({
        method: zod_1.z.enum(['email', 'popup', 'sms']),
        minutesBefore: zod_1.z.number().int().positive(),
    })).optional(),
    recurrence: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'yearly']),
        interval: zod_1.z.number().int().positive().default(1),
        endDate: base_schema_1.DateTimeSchema.optional(),
        count: zod_1.z.number().int().positive().optional(),
    }).optional(),
}).refine((data) => {
    const start = new Date(data.start);
    const end = new Date(data.end);
    return end > start;
}, {
    message: 'End time must be after start time',
    path: ['end'],
});
/**
 * Available slot schema
 */
exports.AvailableSlotSchema = zod_1.z.object({
    start: base_schema_1.DateTimeSchema,
    end: base_schema_1.DateTimeSchema,
    allAvailable: zod_1.z.boolean(),
    unavailableAttendees: zod_1.z.array(email_schema_1.ContactSchema).optional(),
});
/**
 * Find available slots request schema
 */
exports.FindAvailableSlotsSchema = zod_1.z.object({
    participants: zod_1.z.array(zod_1.z.string().email()).min(1),
    duration: zod_1.z.number().int().positive(), // in minutes
    startDate: base_schema_1.DateTimeSchema,
    endDate: base_schema_1.DateTimeSchema,
    workingHoursOnly: zod_1.z.boolean().default(true),
    timezone: zod_1.z.string().optional(),
});
/**
 * Calendar optimization result schema
 */
exports.CalendarOptimizationSchema = zod_1.z.object({
    suggestions: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['move', 'shorten', 'combine', 'add_buffer', 'remove']),
        eventId: zod_1.z.string(),
        description: zod_1.z.string(),
        impact: zod_1.z.number().min(0).max(1), // 0-1 score
        newTime: zod_1.z.object({
            start: base_schema_1.DateTimeSchema,
            end: base_schema_1.DateTimeSchema,
        }).optional(),
    })),
    conflicts: zod_1.z.array(zod_1.z.object({
        eventId: zod_1.z.string(),
        conflictingEventId: zod_1.z.string(),
        description: zod_1.z.string(),
    })),
    focusTimeBlocks: zod_1.z.array(zod_1.z.object({
        start: base_schema_1.DateTimeSchema,
        end: base_schema_1.DateTimeSchema,
        duration: zod_1.z.number().int().positive(),
    })),
    statistics: zod_1.z.object({
        totalMeetingTime: zod_1.z.number().int().nonnegative(),
        longestMeetingStreak: zod_1.z.number().int().nonnegative(),
        focusTimePercentage: zod_1.z.number().min(0).max(100),
        backToBackMeetings: zod_1.z.number().int().nonnegative(),
    }),
});
