/**
 * Calendar-specific validation schemas
 */
import { z } from 'zod';
export declare const attendeeSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    optional: z.ZodDefault<z.ZodBoolean>;
    responseStatus: z.ZodOptional<z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    optional: boolean;
    name?: string | undefined;
    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
}, {
    email: string;
    name?: string | undefined;
    optional?: boolean | undefined;
    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
}>;
export declare const attendeesArraySchema: z.ZodArray<z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    optional: z.ZodDefault<z.ZodBoolean>;
    responseStatus: z.ZodOptional<z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    optional: boolean;
    name?: string | undefined;
    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
}, {
    email: string;
    name?: string | undefined;
    optional?: boolean | undefined;
    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
}>, "many">;
export declare const conferenceTypeSchema: z.ZodEnum<["zoom", "meet", "teams", "other"]>;
export declare const conferenceDataSchema: z.ZodObject<{
    type: z.ZodEnum<["zoom", "meet", "teams", "other"]>;
    url: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    pin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "zoom" | "meet" | "teams" | "other";
    url: string;
    id?: string | undefined;
    pin?: string | undefined;
}, {
    type: "zoom" | "meet" | "teams" | "other";
    url: string;
    id?: string | undefined;
    pin?: string | undefined;
}>;
export declare const recurrenceSchema: z.ZodObject<{
    rule: z.ZodString;
    exceptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    rule: string;
    exceptions?: string[] | undefined;
}, {
    rule: string;
    exceptions?: string[] | undefined;
}>;
export declare const eventTitleSchema: z.ZodString;
export declare const eventDescriptionSchema: z.ZodOptional<z.ZodString>;
export declare const eventLocationSchema: z.ZodOptional<z.ZodString>;
export declare const eventStatusSchema: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
export declare const eventResponseSchema: z.ZodEnum<["accepted", "declined", "tentative"]>;
export declare const createEventSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start: z.ZodString;
    end: z.ZodString;
    isAllDay: z.ZodDefault<z.ZodBoolean>;
    location: z.ZodOptional<z.ZodString>;
    attendees: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        optional: z.ZodDefault<z.ZodBoolean>;
        responseStatus: z.ZodOptional<z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        optional: boolean;
        name?: string | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }, {
        email: string;
        name?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }>, "many">;
    conferenceData: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["zoom", "meet", "teams", "other"]>;
        url: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        pin: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    }, {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    }>>;
    sendNotifications: z.ZodDefault<z.ZodBoolean>;
    recurrence: z.ZodOptional<z.ZodObject<{
        rule: z.ZodString;
        exceptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        rule: string;
        exceptions?: string[] | undefined;
    }, {
        rule: string;
        exceptions?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    title: string;
    isAllDay: boolean;
    attendees: {
        email: string;
        optional: boolean;
        name?: string | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[];
    sendNotifications: boolean;
    description?: string | undefined;
    location?: string | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
    recurrence?: {
        rule: string;
        exceptions?: string[] | undefined;
    } | undefined;
}, {
    start: string;
    end: string;
    title: string;
    attendees: {
        email: string;
        name?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[];
    description?: string | undefined;
    isAllDay?: boolean | undefined;
    location?: string | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
    sendNotifications?: boolean | undefined;
    recurrence?: {
        rule: string;
        exceptions?: string[] | undefined;
    } | undefined;
}>, {
    start: string;
    end: string;
    title: string;
    isAllDay: boolean;
    attendees: {
        email: string;
        optional: boolean;
        name?: string | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[];
    sendNotifications: boolean;
    description?: string | undefined;
    location?: string | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
    recurrence?: {
        rule: string;
        exceptions?: string[] | undefined;
    } | undefined;
}, {
    start: string;
    end: string;
    title: string;
    attendees: {
        email: string;
        name?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[];
    description?: string | undefined;
    isAllDay?: boolean | undefined;
    location?: string | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
    sendNotifications?: boolean | undefined;
    recurrence?: {
        rule: string;
        exceptions?: string[] | undefined;
    } | undefined;
}>;
export declare const updateEventSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    start: z.ZodOptional<z.ZodString>;
    end: z.ZodOptional<z.ZodString>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
    location: z.ZodOptional<z.ZodString>;
    attendees: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        optional: z.ZodDefault<z.ZodBoolean>;
        responseStatus: z.ZodOptional<z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        optional: boolean;
        name?: string | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }, {
        email: string;
        name?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }>, "many">>;
    conferenceData: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["zoom", "meet", "teams", "other"]>;
        url: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        pin: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    }, {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    }>>;
    status: z.ZodOptional<z.ZodEnum<["confirmed", "tentative", "cancelled"]>>;
    sendNotifications: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    sendNotifications: boolean;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    start?: string | undefined;
    end?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    isAllDay?: boolean | undefined;
    location?: string | undefined;
    attendees?: {
        email: string;
        optional: boolean;
        name?: string | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
}, {
    id: string;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    start?: string | undefined;
    end?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    isAllDay?: boolean | undefined;
    location?: string | undefined;
    attendees?: {
        email: string;
        name?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
    sendNotifications?: boolean | undefined;
}>, {
    id: string;
    sendNotifications: boolean;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    start?: string | undefined;
    end?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    isAllDay?: boolean | undefined;
    location?: string | undefined;
    attendees?: {
        email: string;
        optional: boolean;
        name?: string | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
}, {
    id: string;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    start?: string | undefined;
    end?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    isAllDay?: boolean | undefined;
    location?: string | undefined;
    attendees?: {
        email: string;
        name?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "meet" | "teams" | "other";
        url: string;
        id?: string | undefined;
        pin?: string | undefined;
    } | undefined;
    sendNotifications?: boolean | undefined;
}>;
export declare const deleteEventSchema: z.ZodObject<{
    id: z.ZodString;
    sendNotifications: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    sendNotifications: boolean;
}, {
    id: string;
    sendNotifications?: boolean | undefined;
}>;
export declare const getEventsSchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodOptional<z.ZodString>;
    end: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    start?: string | undefined;
    end?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    start?: string | undefined;
    end?: string | undefined;
}>, {
    page: number;
    limit: number;
    start?: string | undefined;
    end?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    start?: string | undefined;
    end?: string | undefined;
}>;
export declare const respondToEventSchema: z.ZodObject<{
    id: z.ZodString;
    response: z.ZodEnum<["accepted", "declined", "tentative"]>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    response: "accepted" | "declined" | "tentative";
    comment?: string | undefined;
}, {
    id: string;
    response: "accepted" | "declined" | "tentative";
    comment?: string | undefined;
}>;
export declare const checkAvailabilitySchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    durationMinutes: z.ZodNumber;
    timeOfDay: z.ZodOptional<z.ZodEnum<["morning", "lunch", "afternoon", "evening"]>>;
    preferredDays: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    participants: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    durationMinutes: number;
    timeOfDay?: "morning" | "lunch" | "afternoon" | "evening" | undefined;
    preferredDays?: number[] | undefined;
    participants?: string[] | undefined;
}, {
    start: string;
    end: string;
    durationMinutes: number;
    timeOfDay?: "morning" | "lunch" | "afternoon" | "evening" | undefined;
    preferredDays?: number[] | undefined;
    participants?: string[] | undefined;
}>, {
    start: string;
    end: string;
    durationMinutes: number;
    timeOfDay?: "morning" | "lunch" | "afternoon" | "evening" | undefined;
    preferredDays?: number[] | undefined;
    participants?: string[] | undefined;
}, {
    start: string;
    end: string;
    durationMinutes: number;
    timeOfDay?: "morning" | "lunch" | "afternoon" | "evening" | undefined;
    preferredDays?: number[] | undefined;
    participants?: string[] | undefined;
}>;
//# sourceMappingURL=calendar.validators.d.ts.map