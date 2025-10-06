/**
 * Calendar API Contracts
 *
 * Zod schemas for all calendar-related API endpoints
 */
import { z } from 'zod';
export declare const AttendeeSchema: z.ZodObject<{
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
export declare const ConferenceDataSchema: z.ZodObject<{
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
export declare const CreateEventRequestSchema: z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        rule: string;
    }, {
        rule: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start: string;
    end: string;
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
    } | undefined;
}, {
    title: string;
    start: string;
    end: string;
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
    } | undefined;
}>;
export declare const UpdateEventRequestSchema: z.ZodObject<{
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
    title?: string | undefined;
    description?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
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
    title?: string | undefined;
    description?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
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
export declare const DeleteEventRequestSchema: z.ZodObject<{
    id: z.ZodString;
    sendNotifications: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    sendNotifications: boolean;
}, {
    id: string;
    sendNotifications?: boolean | undefined;
}>;
export declare const GetEventRequestSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const GetEventsRequestSchema: z.ZodObject<{
    start: z.ZodOptional<z.ZodString>;
    end: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    start?: string | undefined;
    end?: string | undefined;
}, {
    start?: string | undefined;
    end?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const CheckAvailabilityRequestSchema: z.ZodObject<{
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
}>;
export declare const RespondToEventRequestSchema: z.ZodObject<{
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
export declare const CalendarEventSchema: z.ZodObject<{
    id: z.ZodString;
    externalId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    start: z.ZodString;
    end: z.ZodString;
    isAllDay: z.ZodBoolean;
    timezone: z.ZodString;
    attendees: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        optional: z.ZodDefault<z.ZodBoolean>;
    } & {
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        optional: boolean;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
    }, {
        email: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
        optional?: boolean | undefined;
    }>, "many">;
    organizer: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        self: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        self: boolean;
        name?: string | undefined;
    }, {
        email: string;
        self: boolean;
        name?: string | undefined;
    }>;
    status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
    meetingUrl: z.ZodOptional<z.ZodString>;
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
    aiSuggestions: z.ZodOptional<z.ZodObject<{
        suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        meetingSummary: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    }, {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "tentative" | "confirmed" | "cancelled";
    id: string;
    timezone: string;
    createdAt: string;
    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
    title: string;
    start: string;
    end: string;
    isAllDay: boolean;
    attendees: {
        email: string;
        optional: boolean;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
    }[];
    externalId: string;
    organizer: {
        email: string;
        self: boolean;
        name?: string | undefined;
    };
    updatedAt: string;
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
    meetingUrl?: string | undefined;
    aiSuggestions?: {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    } | undefined;
}, {
    status: "tentative" | "confirmed" | "cancelled";
    id: string;
    timezone: string;
    createdAt: string;
    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
    title: string;
    start: string;
    end: string;
    isAllDay: boolean;
    attendees: {
        email: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
        optional?: boolean | undefined;
    }[];
    externalId: string;
    organizer: {
        email: string;
        self: boolean;
        name?: string | undefined;
    };
    updatedAt: string;
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
    meetingUrl?: string | undefined;
    aiSuggestions?: {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    } | undefined;
}>;
export declare const CreateEventResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    eventId: z.ZodString;
    externalId: z.ZodString;
    event: z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        start: z.ZodString;
        end: z.ZodString;
        isAllDay: z.ZodBoolean;
        timezone: z.ZodString;
        attendees: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            optional: z.ZodDefault<z.ZodBoolean>;
        } & {
            responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }, {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }>, "many">;
        organizer: z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            self: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }>;
        status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        meetingUrl: z.ZodOptional<z.ZodString>;
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
        aiSuggestions: z.ZodOptional<z.ZodObject<{
            suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            meetingSummary: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    externalId: string;
    eventId: string;
    event: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    };
}, {
    success: boolean;
    externalId: string;
    eventId: string;
    event: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    };
}>;
export declare const UpdateEventResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    event: z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        start: z.ZodString;
        end: z.ZodString;
        isAllDay: z.ZodBoolean;
        timezone: z.ZodString;
        attendees: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            optional: z.ZodDefault<z.ZodBoolean>;
        } & {
            responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }, {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }>, "many">;
        organizer: z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            self: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }>;
        status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        meetingUrl: z.ZodOptional<z.ZodString>;
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
        aiSuggestions: z.ZodOptional<z.ZodObject<{
            suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            meetingSummary: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    event: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    };
}, {
    success: boolean;
    event: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    };
}>;
export declare const DeleteEventResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    deletedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    deletedAt: string;
}, {
    success: boolean;
    deletedAt: string;
}>;
export declare const GetEventResponseSchema: z.ZodObject<{
    id: z.ZodString;
    externalId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    start: z.ZodString;
    end: z.ZodString;
    isAllDay: z.ZodBoolean;
    timezone: z.ZodString;
    attendees: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        optional: z.ZodDefault<z.ZodBoolean>;
    } & {
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        optional: boolean;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
    }, {
        email: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
        optional?: boolean | undefined;
    }>, "many">;
    organizer: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        self: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        self: boolean;
        name?: string | undefined;
    }, {
        email: string;
        self: boolean;
        name?: string | undefined;
    }>;
    status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
    meetingUrl: z.ZodOptional<z.ZodString>;
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
    aiSuggestions: z.ZodOptional<z.ZodObject<{
        suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        meetingSummary: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    }, {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "tentative" | "confirmed" | "cancelled";
    id: string;
    timezone: string;
    createdAt: string;
    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
    title: string;
    start: string;
    end: string;
    isAllDay: boolean;
    attendees: {
        email: string;
        optional: boolean;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
    }[];
    externalId: string;
    organizer: {
        email: string;
        self: boolean;
        name?: string | undefined;
    };
    updatedAt: string;
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
    meetingUrl?: string | undefined;
    aiSuggestions?: {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    } | undefined;
}, {
    status: "tentative" | "confirmed" | "cancelled";
    id: string;
    timezone: string;
    createdAt: string;
    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
    title: string;
    start: string;
    end: string;
    isAllDay: boolean;
    attendees: {
        email: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        name?: string | undefined;
        optional?: boolean | undefined;
    }[];
    externalId: string;
    organizer: {
        email: string;
        self: boolean;
        name?: string | undefined;
    };
    updatedAt: string;
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
    meetingUrl?: string | undefined;
    aiSuggestions?: {
        suggestedPrep?: string[] | undefined;
        relatedEmails?: string[] | undefined;
        suggestedActionItems?: string[] | undefined;
        meetingSummary?: string | undefined;
    } | undefined;
}>;
export declare const GetEventsResponseSchema: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        start: z.ZodString;
        end: z.ZodString;
        isAllDay: z.ZodBoolean;
        timezone: z.ZodString;
        attendees: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            optional: z.ZodDefault<z.ZodBoolean>;
        } & {
            responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }, {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }>, "many">;
        organizer: z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            self: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }>;
        status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        meetingUrl: z.ZodOptional<z.ZodString>;
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
        aiSuggestions: z.ZodOptional<z.ZodObject<{
            suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            meetingSummary: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    events: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }[];
    total: number;
    hasMore: boolean;
}, {
    limit: number;
    page: number;
    events: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }[];
    total: number;
    hasMore: boolean;
}>;
export declare const TimeSlotSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    score: z.ZodNumber;
    reason: z.ZodString;
    conflicts: z.ZodArray<z.ZodObject<{
        eventId: z.ZodString;
        title: z.ZodString;
        start: z.ZodString;
        end: z.ZodString;
        type: z.ZodEnum<["hard", "soft"]>;
    }, "strip", z.ZodTypeAny, {
        type: "hard" | "soft";
        title: string;
        start: string;
        end: string;
        eventId: string;
    }, {
        type: "hard" | "soft";
        title: string;
        start: string;
        end: string;
        eventId: string;
    }>, "many">;
    isPreferred: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    score: number;
    reason: string;
    conflicts: {
        type: "hard" | "soft";
        title: string;
        start: string;
        end: string;
        eventId: string;
    }[];
    isPreferred: boolean;
}, {
    start: string;
    end: string;
    score: number;
    reason: string;
    conflicts: {
        type: "hard" | "soft";
        title: string;
        start: string;
        end: string;
        eventId: string;
    }[];
    isPreferred: boolean;
}>;
export declare const CheckAvailabilityResponseSchema: z.ZodObject<{
    availableSlots: z.ZodArray<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
        score: z.ZodNumber;
        reason: z.ZodString;
        conflicts: z.ZodArray<z.ZodObject<{
            eventId: z.ZodString;
            title: z.ZodString;
            start: z.ZodString;
            end: z.ZodString;
            type: z.ZodEnum<["hard", "soft"]>;
        }, "strip", z.ZodTypeAny, {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }, {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }>, "many">;
        isPreferred: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }, {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }>, "many">;
    totalSlots: z.ZodNumber;
    preferredSlots: z.ZodArray<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
        score: z.ZodNumber;
        reason: z.ZodString;
        conflicts: z.ZodArray<z.ZodObject<{
            eventId: z.ZodString;
            title: z.ZodString;
            start: z.ZodString;
            end: z.ZodString;
            type: z.ZodEnum<["hard", "soft"]>;
        }, "strip", z.ZodTypeAny, {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }, {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }>, "many">;
        isPreferred: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }, {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    availableSlots: {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }[];
    totalSlots: number;
    preferredSlots: {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }[];
}, {
    availableSlots: {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }[];
    totalSlots: number;
    preferredSlots: {
        start: string;
        end: string;
        score: number;
        reason: string;
        conflicts: {
            type: "hard" | "soft";
            title: string;
            start: string;
            end: string;
            eventId: string;
        }[];
        isPreferred: boolean;
    }[];
}>;
export declare const RespondToEventResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    event: z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        start: z.ZodString;
        end: z.ZodString;
        isAllDay: z.ZodBoolean;
        timezone: z.ZodString;
        attendees: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            optional: z.ZodDefault<z.ZodBoolean>;
        } & {
            responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }, {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }>, "many">;
        organizer: z.ZodObject<{
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            self: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }, {
            email: string;
            self: boolean;
            name?: string | undefined;
        }>;
        status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
        meetingUrl: z.ZodOptional<z.ZodString>;
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
        aiSuggestions: z.ZodOptional<z.ZodObject<{
            suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            meetingSummary: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }, {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }, {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    event: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            optional: boolean;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    };
}, {
    success: boolean;
    event: {
        status: "tentative" | "confirmed" | "cancelled";
        id: string;
        timezone: string;
        createdAt: string;
        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
        title: string;
        start: string;
        end: string;
        isAllDay: boolean;
        attendees: {
            email: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            name?: string | undefined;
            optional?: boolean | undefined;
        }[];
        externalId: string;
        organizer: {
            email: string;
            self: boolean;
            name?: string | undefined;
        };
        updatedAt: string;
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
        meetingUrl?: string | undefined;
        aiSuggestions?: {
            suggestedPrep?: string[] | undefined;
            relatedEmails?: string[] | undefined;
            suggestedActionItems?: string[] | undefined;
            meetingSummary?: string | undefined;
        } | undefined;
    };
}>;
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
export declare const CalendarContracts: {
    readonly createEvent: {
        readonly method: "POST";
        readonly path: "/api/calendar/events";
        readonly request: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                rule: string;
            }, {
                rule: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            start: string;
            end: string;
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
            } | undefined;
        }, {
            title: string;
            start: string;
            end: string;
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
            } | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            eventId: z.ZodString;
            externalId: z.ZodString;
            event: z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                location: z.ZodOptional<z.ZodString>;
                start: z.ZodString;
                end: z.ZodString;
                isAllDay: z.ZodBoolean;
                timezone: z.ZodString;
                attendees: z.ZodArray<z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    optional: z.ZodDefault<z.ZodBoolean>;
                } & {
                    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }, {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }>, "many">;
                organizer: z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    self: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }>;
                status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
                responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                meetingUrl: z.ZodOptional<z.ZodString>;
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
                aiSuggestions: z.ZodOptional<z.ZodObject<{
                    suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    meetingSummary: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }>>;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            externalId: string;
            eventId: string;
            event: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            };
        }, {
            success: boolean;
            externalId: string;
            eventId: string;
            event: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            };
        }>;
    };
    readonly updateEvent: {
        readonly method: "PUT";
        readonly path: "/api/calendar/events/:id";
        readonly request: z.ZodObject<{
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
            title?: string | undefined;
            description?: string | undefined;
            start?: string | undefined;
            end?: string | undefined;
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
            title?: string | undefined;
            description?: string | undefined;
            start?: string | undefined;
            end?: string | undefined;
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
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            event: z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                location: z.ZodOptional<z.ZodString>;
                start: z.ZodString;
                end: z.ZodString;
                isAllDay: z.ZodBoolean;
                timezone: z.ZodString;
                attendees: z.ZodArray<z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    optional: z.ZodDefault<z.ZodBoolean>;
                } & {
                    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }, {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }>, "many">;
                organizer: z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    self: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }>;
                status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
                responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                meetingUrl: z.ZodOptional<z.ZodString>;
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
                aiSuggestions: z.ZodOptional<z.ZodObject<{
                    suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    meetingSummary: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }>>;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            event: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            };
        }, {
            success: boolean;
            event: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            };
        }>;
    };
    readonly deleteEvent: {
        readonly method: "DELETE";
        readonly path: "/api/calendar/events/:id";
        readonly request: z.ZodObject<{
            id: z.ZodString;
            sendNotifications: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            sendNotifications: boolean;
        }, {
            id: string;
            sendNotifications?: boolean | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            deletedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            deletedAt: string;
        }, {
            success: boolean;
            deletedAt: string;
        }>;
    };
    readonly getEvent: {
        readonly method: "GET";
        readonly path: "/api/calendar/events/:id";
        readonly request: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        readonly response: z.ZodObject<{
            id: z.ZodString;
            externalId: z.ZodString;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
            start: z.ZodString;
            end: z.ZodString;
            isAllDay: z.ZodBoolean;
            timezone: z.ZodString;
            attendees: z.ZodArray<z.ZodObject<{
                email: z.ZodString;
                name: z.ZodOptional<z.ZodString>;
                optional: z.ZodDefault<z.ZodBoolean>;
            } & {
                responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                optional: boolean;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                name?: string | undefined;
            }, {
                email: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                name?: string | undefined;
                optional?: boolean | undefined;
            }>, "many">;
            organizer: z.ZodObject<{
                email: z.ZodString;
                name: z.ZodOptional<z.ZodString>;
                self: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                email: string;
                self: boolean;
                name?: string | undefined;
            }, {
                email: string;
                self: boolean;
                name?: string | undefined;
            }>;
            status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
            responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
            meetingUrl: z.ZodOptional<z.ZodString>;
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
            aiSuggestions: z.ZodOptional<z.ZodObject<{
                suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                meetingSummary: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                suggestedPrep?: string[] | undefined;
                relatedEmails?: string[] | undefined;
                suggestedActionItems?: string[] | undefined;
                meetingSummary?: string | undefined;
            }, {
                suggestedPrep?: string[] | undefined;
                relatedEmails?: string[] | undefined;
                suggestedActionItems?: string[] | undefined;
                meetingSummary?: string | undefined;
            }>>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            status: "tentative" | "confirmed" | "cancelled";
            id: string;
            timezone: string;
            createdAt: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            title: string;
            start: string;
            end: string;
            isAllDay: boolean;
            attendees: {
                email: string;
                optional: boolean;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                name?: string | undefined;
            }[];
            externalId: string;
            organizer: {
                email: string;
                self: boolean;
                name?: string | undefined;
            };
            updatedAt: string;
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
            meetingUrl?: string | undefined;
            aiSuggestions?: {
                suggestedPrep?: string[] | undefined;
                relatedEmails?: string[] | undefined;
                suggestedActionItems?: string[] | undefined;
                meetingSummary?: string | undefined;
            } | undefined;
        }, {
            status: "tentative" | "confirmed" | "cancelled";
            id: string;
            timezone: string;
            createdAt: string;
            responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
            title: string;
            start: string;
            end: string;
            isAllDay: boolean;
            attendees: {
                email: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                name?: string | undefined;
                optional?: boolean | undefined;
            }[];
            externalId: string;
            organizer: {
                email: string;
                self: boolean;
                name?: string | undefined;
            };
            updatedAt: string;
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
            meetingUrl?: string | undefined;
            aiSuggestions?: {
                suggestedPrep?: string[] | undefined;
                relatedEmails?: string[] | undefined;
                suggestedActionItems?: string[] | undefined;
                meetingSummary?: string | undefined;
            } | undefined;
        }>;
    };
    readonly getEvents: {
        readonly method: "GET";
        readonly path: "/api/calendar/events";
        readonly request: z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodNumber>;
            page: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            page: number;
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
            limit?: number | undefined;
            page?: number | undefined;
        }>;
        readonly response: z.ZodObject<{
            events: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                location: z.ZodOptional<z.ZodString>;
                start: z.ZodString;
                end: z.ZodString;
                isAllDay: z.ZodBoolean;
                timezone: z.ZodString;
                attendees: z.ZodArray<z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    optional: z.ZodDefault<z.ZodBoolean>;
                } & {
                    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }, {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }>, "many">;
                organizer: z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    self: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }>;
                status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
                responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                meetingUrl: z.ZodOptional<z.ZodString>;
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
                aiSuggestions: z.ZodOptional<z.ZodObject<{
                    suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    meetingSummary: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }>>;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }>, "many">;
            total: z.ZodNumber;
            page: z.ZodNumber;
            limit: z.ZodNumber;
            hasMore: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            page: number;
            events: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }[];
            total: number;
            hasMore: boolean;
        }, {
            limit: number;
            page: number;
            events: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }[];
            total: number;
            hasMore: boolean;
        }>;
    };
    readonly checkAvailability: {
        readonly method: "POST";
        readonly path: "/api/calendar/availability";
        readonly request: z.ZodObject<{
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
        }>;
        readonly response: z.ZodObject<{
            availableSlots: z.ZodArray<z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
                score: z.ZodNumber;
                reason: z.ZodString;
                conflicts: z.ZodArray<z.ZodObject<{
                    eventId: z.ZodString;
                    title: z.ZodString;
                    start: z.ZodString;
                    end: z.ZodString;
                    type: z.ZodEnum<["hard", "soft"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }, {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }>, "many">;
                isPreferred: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }, {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }>, "many">;
            totalSlots: z.ZodNumber;
            preferredSlots: z.ZodArray<z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
                score: z.ZodNumber;
                reason: z.ZodString;
                conflicts: z.ZodArray<z.ZodObject<{
                    eventId: z.ZodString;
                    title: z.ZodString;
                    start: z.ZodString;
                    end: z.ZodString;
                    type: z.ZodEnum<["hard", "soft"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }, {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }>, "many">;
                isPreferred: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }, {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            availableSlots: {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }[];
            totalSlots: number;
            preferredSlots: {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }[];
        }, {
            availableSlots: {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }[];
            totalSlots: number;
            preferredSlots: {
                start: string;
                end: string;
                score: number;
                reason: string;
                conflicts: {
                    type: "hard" | "soft";
                    title: string;
                    start: string;
                    end: string;
                    eventId: string;
                }[];
                isPreferred: boolean;
            }[];
        }>;
    };
    readonly respondToEvent: {
        readonly method: "POST";
        readonly path: "/api/calendar/events/:id/respond";
        readonly request: z.ZodObject<{
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
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            event: z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                location: z.ZodOptional<z.ZodString>;
                start: z.ZodString;
                end: z.ZodString;
                isAllDay: z.ZodBoolean;
                timezone: z.ZodString;
                attendees: z.ZodArray<z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    optional: z.ZodDefault<z.ZodBoolean>;
                } & {
                    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }, {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }>, "many">;
                organizer: z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodOptional<z.ZodString>;
                    self: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }>;
                status: z.ZodEnum<["confirmed", "tentative", "cancelled"]>;
                responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                meetingUrl: z.ZodOptional<z.ZodString>;
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
                aiSuggestions: z.ZodOptional<z.ZodObject<{
                    suggestedPrep: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    relatedEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    suggestedActionItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    meetingSummary: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }>>;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            event: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            };
        }, {
            success: boolean;
            event: {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
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
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            };
        }>;
    };
};
//# sourceMappingURL=calendar.contracts.d.ts.map