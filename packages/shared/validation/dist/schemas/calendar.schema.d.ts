import { z } from 'zod';
/**
 * Meeting type schema
 */
export declare const MeetingTypeSchema: z.ZodEnum<["internal", "external", "one-on-one", "board", "team", "client"]>;
/**
 * Event status schema
 */
export declare const EventStatusSchema: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
/**
 * Meeting prep schema
 */
export declare const MeetingPrepSchema: z.ZodObject<{
    summary: z.ZodString;
    attendeeInsights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    talkingPoints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relatedDocs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    objectives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    agenda: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    attendeeInsights?: string[] | undefined;
    talkingPoints?: string[] | undefined;
    relatedDocs?: string[] | undefined;
    relatedEmails?: string[] | undefined;
    objectives?: string[] | undefined;
    agenda?: string | undefined;
}, {
    summary: string;
    attendeeInsights?: string[] | undefined;
    talkingPoints?: string[] | undefined;
    relatedDocs?: string[] | undefined;
    relatedEmails?: string[] | undefined;
    objectives?: string[] | undefined;
    agenda?: string | undefined;
}>;
export type MeetingPrep = z.infer<typeof MeetingPrepSchema>;
/**
 * Calendar event schema
 */
export declare const CalendarEventSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    allDay: z.ZodDefault<z.ZodBoolean>;
    attendees: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
    location: z.ZodOptional<z.ZodString>;
    virtualMeetingUrl: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodOptional<z.ZodEnum<["internal", "external", "one-on-one", "board", "team", "client"]>>;
    status: z.ZodDefault<z.ZodEnum<["confirmed", "tentative", "cancelled"]>>;
    hasPrep: z.ZodDefault<z.ZodBoolean>;
    meetingPrep: z.ZodOptional<z.ZodObject<{
        summary: z.ZodString;
        attendeeInsights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        talkingPoints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedDocs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        objectives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        agenda: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        attendeeInsights?: string[] | undefined;
        talkingPoints?: string[] | undefined;
        relatedDocs?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        objectives?: string[] | undefined;
        agenda?: string | undefined;
    }, {
        summary: string;
        attendeeInsights?: string[] | undefined;
        talkingPoints?: string[] | undefined;
        relatedDocs?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        objectives?: string[] | undefined;
        agenda?: string | undefined;
    }>>;
    reminders: z.ZodOptional<z.ZodArray<z.ZodObject<{
        method: z.ZodEnum<["email", "popup", "sms"]>;
        minutesBefore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }, {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }>, "many">>;
    recurrence: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly", "yearly"]>;
        interval: z.ZodDefault<z.ZodNumber>;
        endDate: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
        count: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        endDate?: string | Date | undefined;
        count?: number | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate?: string | Date | undefined;
        interval?: number | undefined;
        count?: number | undefined;
    }>>;
    color: z.ZodOptional<z.ZodString>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "private", "confidential"]>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "confirmed" | "tentative";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    start: string | Date;
    end: string | Date;
    allDay: boolean;
    attendees: {
        email: string;
        name: string;
    }[];
    hasPrep: boolean;
    visibility: "public" | "private" | "confidential";
    description?: string | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    meetingPrep?: {
        summary: string;
        attendeeInsights?: string[] | undefined;
        talkingPoints?: string[] | undefined;
        relatedDocs?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        objectives?: string[] | undefined;
        agenda?: string | undefined;
    } | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        endDate?: string | Date | undefined;
        count?: number | undefined;
    } | undefined;
    color?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    start: string | Date;
    end: string | Date;
    status?: "cancelled" | "confirmed" | "tentative" | undefined;
    description?: string | undefined;
    allDay?: boolean | undefined;
    attendees?: {
        email: string;
        name: string;
    }[] | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    hasPrep?: boolean | undefined;
    meetingPrep?: {
        summary: string;
        attendeeInsights?: string[] | undefined;
        talkingPoints?: string[] | undefined;
        relatedDocs?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        objectives?: string[] | undefined;
        agenda?: string | undefined;
    } | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate?: string | Date | undefined;
        interval?: number | undefined;
        count?: number | undefined;
    } | undefined;
    color?: string | undefined;
    visibility?: "public" | "private" | "confidential" | undefined;
}>, {
    status: "cancelled" | "confirmed" | "tentative";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    start: string | Date;
    end: string | Date;
    allDay: boolean;
    attendees: {
        email: string;
        name: string;
    }[];
    hasPrep: boolean;
    visibility: "public" | "private" | "confidential";
    description?: string | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    meetingPrep?: {
        summary: string;
        attendeeInsights?: string[] | undefined;
        talkingPoints?: string[] | undefined;
        relatedDocs?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        objectives?: string[] | undefined;
        agenda?: string | undefined;
    } | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        endDate?: string | Date | undefined;
        count?: number | undefined;
    } | undefined;
    color?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    start: string | Date;
    end: string | Date;
    status?: "cancelled" | "confirmed" | "tentative" | undefined;
    description?: string | undefined;
    allDay?: boolean | undefined;
    attendees?: {
        email: string;
        name: string;
    }[] | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    hasPrep?: boolean | undefined;
    meetingPrep?: {
        summary: string;
        attendeeInsights?: string[] | undefined;
        talkingPoints?: string[] | undefined;
        relatedDocs?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        objectives?: string[] | undefined;
        agenda?: string | undefined;
    } | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate?: string | Date | undefined;
        interval?: number | undefined;
        count?: number | undefined;
    } | undefined;
    color?: string | undefined;
    visibility?: "public" | "private" | "confidential" | undefined;
}>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
/**
 * Create calendar event schema
 */
export declare const CreateCalendarEventSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    allDay: z.ZodDefault<z.ZodBoolean>;
    attendees: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
    location: z.ZodOptional<z.ZodString>;
    virtualMeetingUrl: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodOptional<z.ZodEnum<["internal", "external", "one-on-one", "board", "team", "client"]>>;
    reminders: z.ZodOptional<z.ZodArray<z.ZodObject<{
        method: z.ZodEnum<["email", "popup", "sms"]>;
        minutesBefore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }, {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }>, "many">>;
    recurrence: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly", "yearly"]>;
        interval: z.ZodDefault<z.ZodNumber>;
        endDate: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
        count: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        endDate?: string | Date | undefined;
        count?: number | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate?: string | Date | undefined;
        interval?: number | undefined;
        count?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start: string | Date;
    end: string | Date;
    allDay: boolean;
    description?: string | undefined;
    attendees?: {
        email: string;
        name: string;
    }[] | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        endDate?: string | Date | undefined;
        count?: number | undefined;
    } | undefined;
}, {
    title: string;
    start: string | Date;
    end: string | Date;
    description?: string | undefined;
    allDay?: boolean | undefined;
    attendees?: {
        email: string;
        name: string;
    }[] | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate?: string | Date | undefined;
        interval?: number | undefined;
        count?: number | undefined;
    } | undefined;
}>, {
    title: string;
    start: string | Date;
    end: string | Date;
    allDay: boolean;
    description?: string | undefined;
    attendees?: {
        email: string;
        name: string;
    }[] | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        endDate?: string | Date | undefined;
        count?: number | undefined;
    } | undefined;
}, {
    title: string;
    start: string | Date;
    end: string | Date;
    description?: string | undefined;
    allDay?: boolean | undefined;
    attendees?: {
        email: string;
        name: string;
    }[] | undefined;
    location?: string | undefined;
    virtualMeetingUrl?: string | undefined;
    meetingType?: "team" | "internal" | "external" | "one-on-one" | "board" | "client" | undefined;
    reminders?: {
        method: "email" | "sms" | "popup";
        minutesBefore: number;
    }[] | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate?: string | Date | undefined;
        interval?: number | undefined;
        count?: number | undefined;
    } | undefined;
}>;
export type CreateCalendarEvent = z.infer<typeof CreateCalendarEventSchema>;
/**
 * Available slot schema
 */
export declare const AvailableSlotSchema: z.ZodObject<{
    start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    allAvailable: z.ZodBoolean;
    unavailableAttendees: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    start: string | Date;
    end: string | Date;
    allAvailable: boolean;
    unavailableAttendees?: {
        email: string;
        name: string;
    }[] | undefined;
}, {
    start: string | Date;
    end: string | Date;
    allAvailable: boolean;
    unavailableAttendees?: {
        email: string;
        name: string;
    }[] | undefined;
}>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
/**
 * Find available slots request schema
 */
export declare const FindAvailableSlotsSchema: z.ZodObject<{
    participants: z.ZodArray<z.ZodString, "many">;
    duration: z.ZodNumber;
    startDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    workingHoursOnly: z.ZodDefault<z.ZodBoolean>;
    timezone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    startDate: string | Date;
    endDate: string | Date;
    participants: string[];
    workingHoursOnly: boolean;
    timezone?: string | undefined;
}, {
    duration: number;
    startDate: string | Date;
    endDate: string | Date;
    participants: string[];
    timezone?: string | undefined;
    workingHoursOnly?: boolean | undefined;
}>;
export type FindAvailableSlots = z.infer<typeof FindAvailableSlotsSchema>;
/**
 * Calendar optimization result schema
 */
export declare const CalendarOptimizationSchema: z.ZodObject<{
    suggestions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["move", "shorten", "combine", "add_buffer", "remove"]>;
        eventId: z.ZodString;
        description: z.ZodString;
        impact: z.ZodNumber;
        newTime: z.ZodOptional<z.ZodObject<{
            start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
            end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        }, "strip", z.ZodTypeAny, {
            start: string | Date;
            end: string | Date;
        }, {
            start: string | Date;
            end: string | Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "move" | "shorten" | "combine" | "add_buffer" | "remove";
        description: string;
        eventId: string;
        impact: number;
        newTime?: {
            start: string | Date;
            end: string | Date;
        } | undefined;
    }, {
        type: "move" | "shorten" | "combine" | "add_buffer" | "remove";
        description: string;
        eventId: string;
        impact: number;
        newTime?: {
            start: string | Date;
            end: string | Date;
        } | undefined;
    }>, "many">;
    conflicts: z.ZodArray<z.ZodObject<{
        eventId: z.ZodString;
        conflictingEventId: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        eventId: string;
        conflictingEventId: string;
    }, {
        description: string;
        eventId: string;
        conflictingEventId: string;
    }>, "many">;
    focusTimeBlocks: z.ZodArray<z.ZodObject<{
        start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        start: string | Date;
        end: string | Date;
    }, {
        duration: number;
        start: string | Date;
        end: string | Date;
    }>, "many">;
    statistics: z.ZodObject<{
        totalMeetingTime: z.ZodNumber;
        longestMeetingStreak: z.ZodNumber;
        focusTimePercentage: z.ZodNumber;
        backToBackMeetings: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalMeetingTime: number;
        longestMeetingStreak: number;
        focusTimePercentage: number;
        backToBackMeetings: number;
    }, {
        totalMeetingTime: number;
        longestMeetingStreak: number;
        focusTimePercentage: number;
        backToBackMeetings: number;
    }>;
}, "strip", z.ZodTypeAny, {
    suggestions: {
        type: "move" | "shorten" | "combine" | "add_buffer" | "remove";
        description: string;
        eventId: string;
        impact: number;
        newTime?: {
            start: string | Date;
            end: string | Date;
        } | undefined;
    }[];
    conflicts: {
        description: string;
        eventId: string;
        conflictingEventId: string;
    }[];
    focusTimeBlocks: {
        duration: number;
        start: string | Date;
        end: string | Date;
    }[];
    statistics: {
        totalMeetingTime: number;
        longestMeetingStreak: number;
        focusTimePercentage: number;
        backToBackMeetings: number;
    };
}, {
    suggestions: {
        type: "move" | "shorten" | "combine" | "add_buffer" | "remove";
        description: string;
        eventId: string;
        impact: number;
        newTime?: {
            start: string | Date;
            end: string | Date;
        } | undefined;
    }[];
    conflicts: {
        description: string;
        eventId: string;
        conflictingEventId: string;
    }[];
    focusTimeBlocks: {
        duration: number;
        start: string | Date;
        end: string | Date;
    }[];
    statistics: {
        totalMeetingTime: number;
        longestMeetingStreak: number;
        focusTimePercentage: number;
        backToBackMeetings: number;
    };
}>;
export type CalendarOptimization = z.infer<typeof CalendarOptimizationSchema>;
