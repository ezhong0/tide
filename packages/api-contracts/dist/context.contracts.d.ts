/**
 * Context API Contracts
 *
 * Zod schemas for context and preferences endpoints
 */
import { z } from 'zod';
export declare const GetUserContextRequestSchema: z.ZodObject<{
    includePreferences: z.ZodDefault<z.ZodBoolean>;
    includeVipContacts: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    includePreferences: boolean;
    includeVipContacts: boolean;
}, {
    includePreferences?: boolean | undefined;
    includeVipContacts?: boolean | undefined;
}>;
export declare const UpdateUserPreferencesRequestSchema: z.ZodObject<{
    defaultTone: z.ZodOptional<z.ZodEnum<["professional", "casual", "friendly", "formal"]>>;
    emailSignature: z.ZodOptional<z.ZodString>;
    signOffPhrase: z.ZodOptional<z.ZodString>;
    autoAcceptMeetings: z.ZodOptional<z.ZodBoolean>;
    autoAcceptMeetingsFrom: z.ZodOptional<z.ZodEnum<["none", "vip", "all"]>>;
    autoRespondSimple: z.ZodOptional<z.ZodBoolean>;
    autoRespondConfidence: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
    notificationPreferences: z.ZodOptional<z.ZodObject<{
        interruptions: z.ZodOptional<z.ZodObject<{
            vip_emails: z.ZodBoolean;
            meeting_reminders: z.ZodBoolean;
            urgent_deadlines: z.ZodBoolean;
            tracked_responses: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            vip_emails: boolean;
            meeting_reminders: boolean;
            urgent_deadlines: boolean;
            tracked_responses: boolean;
        }, {
            vip_emails: boolean;
            meeting_reminders: boolean;
            urgent_deadlines: boolean;
            tracked_responses: boolean;
        }>>;
        batch_interval: z.ZodOptional<z.ZodNumber>;
        quiet_hours: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
            enabled: boolean;
        }, {
            start: string;
            end: string;
            enabled: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        interruptions?: {
            vip_emails: boolean;
            meeting_reminders: boolean;
            urgent_deadlines: boolean;
            tracked_responses: boolean;
        } | undefined;
        batch_interval?: number | undefined;
        quiet_hours?: {
            start: string;
            end: string;
            enabled: boolean;
        } | undefined;
    }, {
        interruptions?: {
            vip_emails: boolean;
            meeting_reminders: boolean;
            urgent_deadlines: boolean;
            tracked_responses: boolean;
        } | undefined;
        batch_interval?: number | undefined;
        quiet_hours?: {
            start: string;
            end: string;
            enabled: boolean;
        } | undefined;
    }>>;
    vipContacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodString;
        relationship: z.ZodEnum<["boss", "client", "colleague"]>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        relationship: "boss" | "client" | "colleague";
    }, {
        email: string;
        name: string;
        relationship: "boss" | "client" | "colleague";
    }>, "many">>;
    followUpDefaults: z.ZodOptional<z.ZodObject<{
        default_delay_hours: z.ZodOptional<z.ZodNumber>;
        auto_follow_up_enabled: z.ZodOptional<z.ZodBoolean>;
        follow_up_conditions: z.ZodOptional<z.ZodObject<{
            no_response_to_important: z.ZodBoolean;
            meeting_not_accepted: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            no_response_to_important: boolean;
            meeting_not_accepted: boolean;
        }, {
            no_response_to_important: boolean;
            meeting_not_accepted: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default_delay_hours?: number | undefined;
        auto_follow_up_enabled?: boolean | undefined;
        follow_up_conditions?: {
            no_response_to_important: boolean;
            meeting_not_accepted: boolean;
        } | undefined;
    }, {
        default_delay_hours?: number | undefined;
        auto_follow_up_enabled?: boolean | undefined;
        follow_up_conditions?: {
            no_response_to_important: boolean;
            meeting_not_accepted: boolean;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    defaultTone?: "professional" | "casual" | "friendly" | "formal" | undefined;
    emailSignature?: string | undefined;
    signOffPhrase?: string | undefined;
    autoAcceptMeetings?: boolean | undefined;
    autoAcceptMeetingsFrom?: "none" | "vip" | "all" | undefined;
    autoRespondSimple?: boolean | undefined;
    autoRespondConfidence?: "high" | "medium" | "low" | undefined;
    notificationPreferences?: {
        interruptions?: {
            vip_emails: boolean;
            meeting_reminders: boolean;
            urgent_deadlines: boolean;
            tracked_responses: boolean;
        } | undefined;
        batch_interval?: number | undefined;
        quiet_hours?: {
            start: string;
            end: string;
            enabled: boolean;
        } | undefined;
    } | undefined;
    vipContacts?: {
        email: string;
        name: string;
        relationship: "boss" | "client" | "colleague";
    }[] | undefined;
    followUpDefaults?: {
        default_delay_hours?: number | undefined;
        auto_follow_up_enabled?: boolean | undefined;
        follow_up_conditions?: {
            no_response_to_important: boolean;
            meeting_not_accepted: boolean;
        } | undefined;
    } | undefined;
}, {
    defaultTone?: "professional" | "casual" | "friendly" | "formal" | undefined;
    emailSignature?: string | undefined;
    signOffPhrase?: string | undefined;
    autoAcceptMeetings?: boolean | undefined;
    autoAcceptMeetingsFrom?: "none" | "vip" | "all" | undefined;
    autoRespondSimple?: boolean | undefined;
    autoRespondConfidence?: "high" | "medium" | "low" | undefined;
    notificationPreferences?: {
        interruptions?: {
            vip_emails: boolean;
            meeting_reminders: boolean;
            urgent_deadlines: boolean;
            tracked_responses: boolean;
        } | undefined;
        batch_interval?: number | undefined;
        quiet_hours?: {
            start: string;
            end: string;
            enabled: boolean;
        } | undefined;
    } | undefined;
    vipContacts?: {
        email: string;
        name: string;
        relationship: "boss" | "client" | "colleague";
    }[] | undefined;
    followUpDefaults?: {
        default_delay_hours?: number | undefined;
        auto_follow_up_enabled?: boolean | undefined;
        follow_up_conditions?: {
            no_response_to_important: boolean;
            meeting_not_accepted: boolean;
        } | undefined;
    } | undefined;
}>;
export declare const GetContactPreferencesRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const UpdateContactPreferencesRequestSchema: z.ZodObject<{
    email: z.ZodString;
    contactName: z.ZodOptional<z.ZodString>;
    preferredTone: z.ZodEnum<["professional", "casual", "friendly", "formal"]>;
    relationshipType: z.ZodOptional<z.ZodEnum<["colleague", "client", "friend", "boss", "vendor"]>>;
    customInstructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    preferredTone: "professional" | "casual" | "friendly" | "formal";
    contactName?: string | undefined;
    relationshipType?: "boss" | "client" | "colleague" | "friend" | "vendor" | undefined;
    customInstructions?: string | undefined;
}, {
    email: string;
    preferredTone: "professional" | "casual" | "friendly" | "formal";
    contactName?: string | undefined;
    relationshipType?: "boss" | "client" | "colleague" | "friend" | "vendor" | undefined;
    customInstructions?: string | undefined;
}>;
export declare const GetMeetingPatternsRequestSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const SemanticSearchRequestSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    dateAfter: z.ZodOptional<z.ZodString>;
    dateBefore: z.ZodOptional<z.ZodString>;
    fromContact: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    fromContact?: string | undefined;
}, {
    query: string;
    limit?: number | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    fromContact?: string | undefined;
}>;
export declare const UserContextSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        emailProvider: z.ZodEnum<["gmail", "outlook"]>;
        calendarProvider: z.ZodEnum<["google", "outlook"]>;
        timezone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    }, {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    }>;
    preferences: z.ZodOptional<z.ZodObject<{
        defaultTone: z.ZodString;
        emailSignature: z.ZodString;
        signOffPhrase: z.ZodString;
        autoAcceptMeetings: z.ZodBoolean;
        autoRespondSimple: z.ZodBoolean;
        notificationPreferences: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        vipContacts: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            name: z.ZodString;
            relationship: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            relationship: string;
        }, {
            email: string;
            name: string;
            relationship: string;
        }>, "many">;
        followUpDefaults: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    }, {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    }>>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    };
    preferences?: {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    } | undefined;
}, {
    user: {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    };
    preferences?: {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    } | undefined;
}>;
export declare const GetUserContextResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        emailProvider: z.ZodEnum<["gmail", "outlook"]>;
        calendarProvider: z.ZodEnum<["google", "outlook"]>;
        timezone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    }, {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    }>;
    preferences: z.ZodOptional<z.ZodObject<{
        defaultTone: z.ZodString;
        emailSignature: z.ZodString;
        signOffPhrase: z.ZodString;
        autoAcceptMeetings: z.ZodBoolean;
        autoRespondSimple: z.ZodBoolean;
        notificationPreferences: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        vipContacts: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            name: z.ZodString;
            relationship: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            relationship: string;
        }, {
            email: string;
            name: string;
            relationship: string;
        }>, "many">;
        followUpDefaults: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    }, {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    }>>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    };
    preferences?: {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    } | undefined;
}, {
    user: {
        id: string;
        email: string;
        name: string;
        emailProvider: "gmail" | "outlook";
        calendarProvider: "outlook" | "google";
        timezone: string;
    };
    preferences?: {
        defaultTone: string;
        emailSignature: string;
        signOffPhrase: string;
        autoAcceptMeetings: boolean;
        autoRespondSimple: boolean;
        notificationPreferences: Record<string, unknown>;
        vipContacts: {
            email: string;
            name: string;
            relationship: string;
        }[];
        followUpDefaults: Record<string, unknown>;
    } | undefined;
}>;
export declare const UpdateUserPreferencesResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    preferences: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    updatedAt: string;
    preferences: Record<string, unknown>;
}, {
    success: boolean;
    updatedAt: string;
    preferences: Record<string, unknown>;
}>;
export declare const ContactPreferencesSchema: z.ZodObject<{
    id: z.ZodString;
    contactEmail: z.ZodString;
    contactName: z.ZodOptional<z.ZodString>;
    preferredTone: z.ZodString;
    relationshipType: z.ZodOptional<z.ZodString>;
    customInstructions: z.ZodOptional<z.ZodString>;
    interactionCount: z.ZodNumber;
    lastInteraction: z.ZodString;
    patterns: z.ZodOptional<z.ZodObject<{
        averageResponseTimeHours: z.ZodOptional<z.ZodNumber>;
        preferredMeetingTimes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        commonTopics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        typicalEmailLength: z.ZodOptional<z.ZodEnum<["short", "medium", "long"]>>;
    }, "strip", z.ZodTypeAny, {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    }, {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    preferredTone: string;
    contactEmail: string;
    interactionCount: number;
    lastInteraction: string;
    contactName?: string | undefined;
    relationshipType?: string | undefined;
    customInstructions?: string | undefined;
    patterns?: {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    preferredTone: string;
    contactEmail: string;
    interactionCount: number;
    lastInteraction: string;
    contactName?: string | undefined;
    relationshipType?: string | undefined;
    customInstructions?: string | undefined;
    patterns?: {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    } | undefined;
}>;
export declare const GetContactPreferencesResponseSchema: z.ZodObject<{
    id: z.ZodString;
    contactEmail: z.ZodString;
    contactName: z.ZodOptional<z.ZodString>;
    preferredTone: z.ZodString;
    relationshipType: z.ZodOptional<z.ZodString>;
    customInstructions: z.ZodOptional<z.ZodString>;
    interactionCount: z.ZodNumber;
    lastInteraction: z.ZodString;
    patterns: z.ZodOptional<z.ZodObject<{
        averageResponseTimeHours: z.ZodOptional<z.ZodNumber>;
        preferredMeetingTimes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        commonTopics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        typicalEmailLength: z.ZodOptional<z.ZodEnum<["short", "medium", "long"]>>;
    }, "strip", z.ZodTypeAny, {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    }, {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    preferredTone: string;
    contactEmail: string;
    interactionCount: number;
    lastInteraction: string;
    contactName?: string | undefined;
    relationshipType?: string | undefined;
    customInstructions?: string | undefined;
    patterns?: {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    preferredTone: string;
    contactEmail: string;
    interactionCount: number;
    lastInteraction: string;
    contactName?: string | undefined;
    relationshipType?: string | undefined;
    customInstructions?: string | undefined;
    patterns?: {
        averageResponseTimeHours?: number | undefined;
        preferredMeetingTimes?: string[] | undefined;
        commonTopics?: string[] | undefined;
        typicalEmailLength?: "medium" | "short" | "long" | undefined;
    } | undefined;
}>;
export declare const UpdateContactPreferencesResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    preferences: z.ZodObject<{
        id: z.ZodString;
        contactEmail: z.ZodString;
        contactName: z.ZodOptional<z.ZodString>;
        preferredTone: z.ZodString;
        relationshipType: z.ZodOptional<z.ZodString>;
        customInstructions: z.ZodOptional<z.ZodString>;
        interactionCount: z.ZodNumber;
        lastInteraction: z.ZodString;
        patterns: z.ZodOptional<z.ZodObject<{
            averageResponseTimeHours: z.ZodOptional<z.ZodNumber>;
            preferredMeetingTimes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            commonTopics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            typicalEmailLength: z.ZodOptional<z.ZodEnum<["short", "medium", "long"]>>;
        }, "strip", z.ZodTypeAny, {
            averageResponseTimeHours?: number | undefined;
            preferredMeetingTimes?: string[] | undefined;
            commonTopics?: string[] | undefined;
            typicalEmailLength?: "medium" | "short" | "long" | undefined;
        }, {
            averageResponseTimeHours?: number | undefined;
            preferredMeetingTimes?: string[] | undefined;
            commonTopics?: string[] | undefined;
            typicalEmailLength?: "medium" | "short" | "long" | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        preferredTone: string;
        contactEmail: string;
        interactionCount: number;
        lastInteraction: string;
        contactName?: string | undefined;
        relationshipType?: string | undefined;
        customInstructions?: string | undefined;
        patterns?: {
            averageResponseTimeHours?: number | undefined;
            preferredMeetingTimes?: string[] | undefined;
            commonTopics?: string[] | undefined;
            typicalEmailLength?: "medium" | "short" | "long" | undefined;
        } | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        preferredTone: string;
        contactEmail: string;
        interactionCount: number;
        lastInteraction: string;
        contactName?: string | undefined;
        relationshipType?: string | undefined;
        customInstructions?: string | undefined;
        patterns?: {
            averageResponseTimeHours?: number | undefined;
            preferredMeetingTimes?: string[] | undefined;
            commonTopics?: string[] | undefined;
            typicalEmailLength?: "medium" | "short" | "long" | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    preferences: {
        id: string;
        createdAt: string;
        updatedAt: string;
        preferredTone: string;
        contactEmail: string;
        interactionCount: number;
        lastInteraction: string;
        contactName?: string | undefined;
        relationshipType?: string | undefined;
        customInstructions?: string | undefined;
        patterns?: {
            averageResponseTimeHours?: number | undefined;
            preferredMeetingTimes?: string[] | undefined;
            commonTopics?: string[] | undefined;
            typicalEmailLength?: "medium" | "short" | "long" | undefined;
        } | undefined;
    };
}, {
    success: boolean;
    preferences: {
        id: string;
        createdAt: string;
        updatedAt: string;
        preferredTone: string;
        contactEmail: string;
        interactionCount: number;
        lastInteraction: string;
        contactName?: string | undefined;
        relationshipType?: string | undefined;
        customInstructions?: string | undefined;
        patterns?: {
            averageResponseTimeHours?: number | undefined;
            preferredMeetingTimes?: string[] | undefined;
            commonTopics?: string[] | undefined;
            typicalEmailLength?: "medium" | "short" | "long" | undefined;
        } | undefined;
    };
}>;
export declare const MeetingPatternsSchema: z.ZodObject<{
    totalMeetings: z.ZodNumber;
    averageDurationMinutes: z.ZodNumber;
    mostCommonAttendees: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        email: string;
        count: number;
        name?: string | undefined;
    }, {
        email: string;
        count: number;
        name?: string | undefined;
    }>, "many">;
    preferredTimeSlots: z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        startHour: z.ZodNumber;
        endHour: z.ZodNumber;
        frequency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }, {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }>, "many">;
    meetingsByType: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    totalMeetings: number;
    averageDurationMinutes: number;
    mostCommonAttendees: {
        email: string;
        count: number;
        name?: string | undefined;
    }[];
    preferredTimeSlots: {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }[];
    meetingsByType: Record<string, number>;
}, {
    totalMeetings: number;
    averageDurationMinutes: number;
    mostCommonAttendees: {
        email: string;
        count: number;
        name?: string | undefined;
    }[];
    preferredTimeSlots: {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }[];
    meetingsByType: Record<string, number>;
}>;
export declare const GetMeetingPatternsResponseSchema: z.ZodObject<{
    totalMeetings: z.ZodNumber;
    averageDurationMinutes: z.ZodNumber;
    mostCommonAttendees: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        email: string;
        count: number;
        name?: string | undefined;
    }, {
        email: string;
        count: number;
        name?: string | undefined;
    }>, "many">;
    preferredTimeSlots: z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        startHour: z.ZodNumber;
        endHour: z.ZodNumber;
        frequency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }, {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }>, "many">;
    meetingsByType: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    totalMeetings: number;
    averageDurationMinutes: number;
    mostCommonAttendees: {
        email: string;
        count: number;
        name?: string | undefined;
    }[];
    preferredTimeSlots: {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }[];
    meetingsByType: Record<string, number>;
}, {
    totalMeetings: number;
    averageDurationMinutes: number;
    mostCommonAttendees: {
        email: string;
        count: number;
        name?: string | undefined;
    }[];
    preferredTimeSlots: {
        dayOfWeek: number;
        startHour: number;
        endHour: number;
        frequency: number;
    }[];
    meetingsByType: Record<string, number>;
}>;
export declare const SemanticSearchResultSchema: z.ZodObject<{
    emailId: z.ZodString;
    score: z.ZodNumber;
    snippet: z.ZodString;
    metadata: z.ZodObject<{
        from: z.ZodString;
        subject: z.ZodString;
        date: z.ZodString;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        subject: string;
        from: string;
        labels?: string[] | undefined;
    }, {
        date: string;
        subject: string;
        from: string;
        labels?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    score: number;
    emailId: string;
    snippet: string;
    metadata: {
        date: string;
        subject: string;
        from: string;
        labels?: string[] | undefined;
    };
}, {
    score: number;
    emailId: string;
    snippet: string;
    metadata: {
        date: string;
        subject: string;
        from: string;
        labels?: string[] | undefined;
    };
}>;
export declare const SemanticSearchResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        emailId: z.ZodString;
        score: z.ZodNumber;
        snippet: z.ZodString;
        metadata: z.ZodObject<{
            from: z.ZodString;
            subject: z.ZodString;
            date: z.ZodString;
            labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            date: string;
            subject: string;
            from: string;
            labels?: string[] | undefined;
        }, {
            date: string;
            subject: string;
            from: string;
            labels?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        score: number;
        emailId: string;
        snippet: string;
        metadata: {
            date: string;
            subject: string;
            from: string;
            labels?: string[] | undefined;
        };
    }, {
        score: number;
        emailId: string;
        snippet: string;
        metadata: {
            date: string;
            subject: string;
            from: string;
            labels?: string[] | undefined;
        };
    }>, "many">;
    total: z.ZodNumber;
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    total: number;
    query: string;
    results: {
        score: number;
        emailId: string;
        snippet: string;
        metadata: {
            date: string;
            subject: string;
            from: string;
            labels?: string[] | undefined;
        };
    }[];
}, {
    total: number;
    query: string;
    results: {
        score: number;
        emailId: string;
        snippet: string;
        metadata: {
            date: string;
            subject: string;
            from: string;
            labels?: string[] | undefined;
        };
    }[];
}>;
export type GetUserContextRequest = z.infer<typeof GetUserContextRequestSchema>;
export type GetUserContextResponse = z.infer<typeof GetUserContextResponseSchema>;
export type UpdateUserPreferencesRequest = z.infer<typeof UpdateUserPreferencesRequestSchema>;
export type UpdateUserPreferencesResponse = z.infer<typeof UpdateUserPreferencesResponseSchema>;
export type GetContactPreferencesRequest = z.infer<typeof GetContactPreferencesRequestSchema>;
export type GetContactPreferencesResponse = z.infer<typeof GetContactPreferencesResponseSchema>;
export type UpdateContactPreferencesRequest = z.infer<typeof UpdateContactPreferencesRequestSchema>;
export type UpdateContactPreferencesResponse = z.infer<typeof UpdateContactPreferencesResponseSchema>;
export type GetMeetingPatternsRequest = z.infer<typeof GetMeetingPatternsRequestSchema>;
export type GetMeetingPatternsResponse = z.infer<typeof GetMeetingPatternsResponseSchema>;
export type SemanticSearchRequest = z.infer<typeof SemanticSearchRequestSchema>;
export type SemanticSearchResponse = z.infer<typeof SemanticSearchResponseSchema>;
export declare const ContextContracts: {
    readonly getUserContext: {
        readonly method: "GET";
        readonly path: "/api/context/user";
        readonly request: z.ZodObject<{
            includePreferences: z.ZodDefault<z.ZodBoolean>;
            includeVipContacts: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            includePreferences: boolean;
            includeVipContacts: boolean;
        }, {
            includePreferences?: boolean | undefined;
            includeVipContacts?: boolean | undefined;
        }>;
        readonly response: z.ZodObject<{
            user: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodString;
                emailProvider: z.ZodEnum<["gmail", "outlook"]>;
                calendarProvider: z.ZodEnum<["google", "outlook"]>;
                timezone: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                email: string;
                name: string;
                emailProvider: "gmail" | "outlook";
                calendarProvider: "outlook" | "google";
                timezone: string;
            }, {
                id: string;
                email: string;
                name: string;
                emailProvider: "gmail" | "outlook";
                calendarProvider: "outlook" | "google";
                timezone: string;
            }>;
            preferences: z.ZodOptional<z.ZodObject<{
                defaultTone: z.ZodString;
                emailSignature: z.ZodString;
                signOffPhrase: z.ZodString;
                autoAcceptMeetings: z.ZodBoolean;
                autoRespondSimple: z.ZodBoolean;
                notificationPreferences: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                vipContacts: z.ZodArray<z.ZodObject<{
                    email: z.ZodString;
                    name: z.ZodString;
                    relationship: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    name: string;
                    relationship: string;
                }, {
                    email: string;
                    name: string;
                    relationship: string;
                }>, "many">;
                followUpDefaults: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, "strip", z.ZodTypeAny, {
                defaultTone: string;
                emailSignature: string;
                signOffPhrase: string;
                autoAcceptMeetings: boolean;
                autoRespondSimple: boolean;
                notificationPreferences: Record<string, unknown>;
                vipContacts: {
                    email: string;
                    name: string;
                    relationship: string;
                }[];
                followUpDefaults: Record<string, unknown>;
            }, {
                defaultTone: string;
                emailSignature: string;
                signOffPhrase: string;
                autoAcceptMeetings: boolean;
                autoRespondSimple: boolean;
                notificationPreferences: Record<string, unknown>;
                vipContacts: {
                    email: string;
                    name: string;
                    relationship: string;
                }[];
                followUpDefaults: Record<string, unknown>;
            }>>;
        }, "strip", z.ZodTypeAny, {
            user: {
                id: string;
                email: string;
                name: string;
                emailProvider: "gmail" | "outlook";
                calendarProvider: "outlook" | "google";
                timezone: string;
            };
            preferences?: {
                defaultTone: string;
                emailSignature: string;
                signOffPhrase: string;
                autoAcceptMeetings: boolean;
                autoRespondSimple: boolean;
                notificationPreferences: Record<string, unknown>;
                vipContacts: {
                    email: string;
                    name: string;
                    relationship: string;
                }[];
                followUpDefaults: Record<string, unknown>;
            } | undefined;
        }, {
            user: {
                id: string;
                email: string;
                name: string;
                emailProvider: "gmail" | "outlook";
                calendarProvider: "outlook" | "google";
                timezone: string;
            };
            preferences?: {
                defaultTone: string;
                emailSignature: string;
                signOffPhrase: string;
                autoAcceptMeetings: boolean;
                autoRespondSimple: boolean;
                notificationPreferences: Record<string, unknown>;
                vipContacts: {
                    email: string;
                    name: string;
                    relationship: string;
                }[];
                followUpDefaults: Record<string, unknown>;
            } | undefined;
        }>;
    };
    readonly updateUserPreferences: {
        readonly method: "PUT";
        readonly path: "/api/context/preferences";
        readonly request: z.ZodObject<{
            defaultTone: z.ZodOptional<z.ZodEnum<["professional", "casual", "friendly", "formal"]>>;
            emailSignature: z.ZodOptional<z.ZodString>;
            signOffPhrase: z.ZodOptional<z.ZodString>;
            autoAcceptMeetings: z.ZodOptional<z.ZodBoolean>;
            autoAcceptMeetingsFrom: z.ZodOptional<z.ZodEnum<["none", "vip", "all"]>>;
            autoRespondSimple: z.ZodOptional<z.ZodBoolean>;
            autoRespondConfidence: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
            notificationPreferences: z.ZodOptional<z.ZodObject<{
                interruptions: z.ZodOptional<z.ZodObject<{
                    vip_emails: z.ZodBoolean;
                    meeting_reminders: z.ZodBoolean;
                    urgent_deadlines: z.ZodBoolean;
                    tracked_responses: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    vip_emails: boolean;
                    meeting_reminders: boolean;
                    urgent_deadlines: boolean;
                    tracked_responses: boolean;
                }, {
                    vip_emails: boolean;
                    meeting_reminders: boolean;
                    urgent_deadlines: boolean;
                    tracked_responses: boolean;
                }>>;
                batch_interval: z.ZodOptional<z.ZodNumber>;
                quiet_hours: z.ZodOptional<z.ZodObject<{
                    enabled: z.ZodBoolean;
                    start: z.ZodString;
                    end: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    start: string;
                    end: string;
                    enabled: boolean;
                }, {
                    start: string;
                    end: string;
                    enabled: boolean;
                }>>;
            }, "strip", z.ZodTypeAny, {
                interruptions?: {
                    vip_emails: boolean;
                    meeting_reminders: boolean;
                    urgent_deadlines: boolean;
                    tracked_responses: boolean;
                } | undefined;
                batch_interval?: number | undefined;
                quiet_hours?: {
                    start: string;
                    end: string;
                    enabled: boolean;
                } | undefined;
            }, {
                interruptions?: {
                    vip_emails: boolean;
                    meeting_reminders: boolean;
                    urgent_deadlines: boolean;
                    tracked_responses: boolean;
                } | undefined;
                batch_interval?: number | undefined;
                quiet_hours?: {
                    start: string;
                    end: string;
                    enabled: boolean;
                } | undefined;
            }>>;
            vipContacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                email: z.ZodString;
                name: z.ZodString;
                relationship: z.ZodEnum<["boss", "client", "colleague"]>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                name: string;
                relationship: "boss" | "client" | "colleague";
            }, {
                email: string;
                name: string;
                relationship: "boss" | "client" | "colleague";
            }>, "many">>;
            followUpDefaults: z.ZodOptional<z.ZodObject<{
                default_delay_hours: z.ZodOptional<z.ZodNumber>;
                auto_follow_up_enabled: z.ZodOptional<z.ZodBoolean>;
                follow_up_conditions: z.ZodOptional<z.ZodObject<{
                    no_response_to_important: z.ZodBoolean;
                    meeting_not_accepted: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    no_response_to_important: boolean;
                    meeting_not_accepted: boolean;
                }, {
                    no_response_to_important: boolean;
                    meeting_not_accepted: boolean;
                }>>;
            }, "strip", z.ZodTypeAny, {
                default_delay_hours?: number | undefined;
                auto_follow_up_enabled?: boolean | undefined;
                follow_up_conditions?: {
                    no_response_to_important: boolean;
                    meeting_not_accepted: boolean;
                } | undefined;
            }, {
                default_delay_hours?: number | undefined;
                auto_follow_up_enabled?: boolean | undefined;
                follow_up_conditions?: {
                    no_response_to_important: boolean;
                    meeting_not_accepted: boolean;
                } | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            defaultTone?: "professional" | "casual" | "friendly" | "formal" | undefined;
            emailSignature?: string | undefined;
            signOffPhrase?: string | undefined;
            autoAcceptMeetings?: boolean | undefined;
            autoAcceptMeetingsFrom?: "none" | "vip" | "all" | undefined;
            autoRespondSimple?: boolean | undefined;
            autoRespondConfidence?: "high" | "medium" | "low" | undefined;
            notificationPreferences?: {
                interruptions?: {
                    vip_emails: boolean;
                    meeting_reminders: boolean;
                    urgent_deadlines: boolean;
                    tracked_responses: boolean;
                } | undefined;
                batch_interval?: number | undefined;
                quiet_hours?: {
                    start: string;
                    end: string;
                    enabled: boolean;
                } | undefined;
            } | undefined;
            vipContacts?: {
                email: string;
                name: string;
                relationship: "boss" | "client" | "colleague";
            }[] | undefined;
            followUpDefaults?: {
                default_delay_hours?: number | undefined;
                auto_follow_up_enabled?: boolean | undefined;
                follow_up_conditions?: {
                    no_response_to_important: boolean;
                    meeting_not_accepted: boolean;
                } | undefined;
            } | undefined;
        }, {
            defaultTone?: "professional" | "casual" | "friendly" | "formal" | undefined;
            emailSignature?: string | undefined;
            signOffPhrase?: string | undefined;
            autoAcceptMeetings?: boolean | undefined;
            autoAcceptMeetingsFrom?: "none" | "vip" | "all" | undefined;
            autoRespondSimple?: boolean | undefined;
            autoRespondConfidence?: "high" | "medium" | "low" | undefined;
            notificationPreferences?: {
                interruptions?: {
                    vip_emails: boolean;
                    meeting_reminders: boolean;
                    urgent_deadlines: boolean;
                    tracked_responses: boolean;
                } | undefined;
                batch_interval?: number | undefined;
                quiet_hours?: {
                    start: string;
                    end: string;
                    enabled: boolean;
                } | undefined;
            } | undefined;
            vipContacts?: {
                email: string;
                name: string;
                relationship: "boss" | "client" | "colleague";
            }[] | undefined;
            followUpDefaults?: {
                default_delay_hours?: number | undefined;
                auto_follow_up_enabled?: boolean | undefined;
                follow_up_conditions?: {
                    no_response_to_important: boolean;
                    meeting_not_accepted: boolean;
                } | undefined;
            } | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            preferences: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            updatedAt: string;
            preferences: Record<string, unknown>;
        }, {
            success: boolean;
            updatedAt: string;
            preferences: Record<string, unknown>;
        }>;
    };
    readonly getContactPreferences: {
        readonly method: "GET";
        readonly path: "/api/context/contact/:email";
        readonly request: z.ZodObject<{
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
        }, {
            email: string;
        }>;
        readonly response: z.ZodObject<{
            id: z.ZodString;
            contactEmail: z.ZodString;
            contactName: z.ZodOptional<z.ZodString>;
            preferredTone: z.ZodString;
            relationshipType: z.ZodOptional<z.ZodString>;
            customInstructions: z.ZodOptional<z.ZodString>;
            interactionCount: z.ZodNumber;
            lastInteraction: z.ZodString;
            patterns: z.ZodOptional<z.ZodObject<{
                averageResponseTimeHours: z.ZodOptional<z.ZodNumber>;
                preferredMeetingTimes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                commonTopics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                typicalEmailLength: z.ZodOptional<z.ZodEnum<["short", "medium", "long"]>>;
            }, "strip", z.ZodTypeAny, {
                averageResponseTimeHours?: number | undefined;
                preferredMeetingTimes?: string[] | undefined;
                commonTopics?: string[] | undefined;
                typicalEmailLength?: "medium" | "short" | "long" | undefined;
            }, {
                averageResponseTimeHours?: number | undefined;
                preferredMeetingTimes?: string[] | undefined;
                commonTopics?: string[] | undefined;
                typicalEmailLength?: "medium" | "short" | "long" | undefined;
            }>>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: string;
            updatedAt: string;
            preferredTone: string;
            contactEmail: string;
            interactionCount: number;
            lastInteraction: string;
            contactName?: string | undefined;
            relationshipType?: string | undefined;
            customInstructions?: string | undefined;
            patterns?: {
                averageResponseTimeHours?: number | undefined;
                preferredMeetingTimes?: string[] | undefined;
                commonTopics?: string[] | undefined;
                typicalEmailLength?: "medium" | "short" | "long" | undefined;
            } | undefined;
        }, {
            id: string;
            createdAt: string;
            updatedAt: string;
            preferredTone: string;
            contactEmail: string;
            interactionCount: number;
            lastInteraction: string;
            contactName?: string | undefined;
            relationshipType?: string | undefined;
            customInstructions?: string | undefined;
            patterns?: {
                averageResponseTimeHours?: number | undefined;
                preferredMeetingTimes?: string[] | undefined;
                commonTopics?: string[] | undefined;
                typicalEmailLength?: "medium" | "short" | "long" | undefined;
            } | undefined;
        }>;
    };
    readonly updateContactPreferences: {
        readonly method: "PUT";
        readonly path: "/api/context/contact/:email";
        readonly request: z.ZodObject<{
            email: z.ZodString;
            contactName: z.ZodOptional<z.ZodString>;
            preferredTone: z.ZodEnum<["professional", "casual", "friendly", "formal"]>;
            relationshipType: z.ZodOptional<z.ZodEnum<["colleague", "client", "friend", "boss", "vendor"]>>;
            customInstructions: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            preferredTone: "professional" | "casual" | "friendly" | "formal";
            contactName?: string | undefined;
            relationshipType?: "boss" | "client" | "colleague" | "friend" | "vendor" | undefined;
            customInstructions?: string | undefined;
        }, {
            email: string;
            preferredTone: "professional" | "casual" | "friendly" | "formal";
            contactName?: string | undefined;
            relationshipType?: "boss" | "client" | "colleague" | "friend" | "vendor" | undefined;
            customInstructions?: string | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            preferences: z.ZodObject<{
                id: z.ZodString;
                contactEmail: z.ZodString;
                contactName: z.ZodOptional<z.ZodString>;
                preferredTone: z.ZodString;
                relationshipType: z.ZodOptional<z.ZodString>;
                customInstructions: z.ZodOptional<z.ZodString>;
                interactionCount: z.ZodNumber;
                lastInteraction: z.ZodString;
                patterns: z.ZodOptional<z.ZodObject<{
                    averageResponseTimeHours: z.ZodOptional<z.ZodNumber>;
                    preferredMeetingTimes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    commonTopics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    typicalEmailLength: z.ZodOptional<z.ZodEnum<["short", "medium", "long"]>>;
                }, "strip", z.ZodTypeAny, {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                }, {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                }>>;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                createdAt: string;
                updatedAt: string;
                preferredTone: string;
                contactEmail: string;
                interactionCount: number;
                lastInteraction: string;
                contactName?: string | undefined;
                relationshipType?: string | undefined;
                customInstructions?: string | undefined;
                patterns?: {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                } | undefined;
            }, {
                id: string;
                createdAt: string;
                updatedAt: string;
                preferredTone: string;
                contactEmail: string;
                interactionCount: number;
                lastInteraction: string;
                contactName?: string | undefined;
                relationshipType?: string | undefined;
                customInstructions?: string | undefined;
                patterns?: {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                } | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            preferences: {
                id: string;
                createdAt: string;
                updatedAt: string;
                preferredTone: string;
                contactEmail: string;
                interactionCount: number;
                lastInteraction: string;
                contactName?: string | undefined;
                relationshipType?: string | undefined;
                customInstructions?: string | undefined;
                patterns?: {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                } | undefined;
            };
        }, {
            success: boolean;
            preferences: {
                id: string;
                createdAt: string;
                updatedAt: string;
                preferredTone: string;
                contactEmail: string;
                interactionCount: number;
                lastInteraction: string;
                contactName?: string | undefined;
                relationshipType?: string | undefined;
                customInstructions?: string | undefined;
                patterns?: {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                } | undefined;
            };
        }>;
    };
    readonly getMeetingPatterns: {
        readonly method: "GET";
        readonly path: "/api/context/patterns/meetings";
        readonly request: z.ZodObject<{
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startDate?: string | undefined;
            endDate?: string | undefined;
        }, {
            startDate?: string | undefined;
            endDate?: string | undefined;
        }>;
        readonly response: z.ZodObject<{
            totalMeetings: z.ZodNumber;
            averageDurationMinutes: z.ZodNumber;
            mostCommonAttendees: z.ZodArray<z.ZodObject<{
                email: z.ZodString;
                name: z.ZodOptional<z.ZodString>;
                count: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                email: string;
                count: number;
                name?: string | undefined;
            }, {
                email: string;
                count: number;
                name?: string | undefined;
            }>, "many">;
            preferredTimeSlots: z.ZodArray<z.ZodObject<{
                dayOfWeek: z.ZodNumber;
                startHour: z.ZodNumber;
                endHour: z.ZodNumber;
                frequency: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                dayOfWeek: number;
                startHour: number;
                endHour: number;
                frequency: number;
            }, {
                dayOfWeek: number;
                startHour: number;
                endHour: number;
                frequency: number;
            }>, "many">;
            meetingsByType: z.ZodRecord<z.ZodString, z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            totalMeetings: number;
            averageDurationMinutes: number;
            mostCommonAttendees: {
                email: string;
                count: number;
                name?: string | undefined;
            }[];
            preferredTimeSlots: {
                dayOfWeek: number;
                startHour: number;
                endHour: number;
                frequency: number;
            }[];
            meetingsByType: Record<string, number>;
        }, {
            totalMeetings: number;
            averageDurationMinutes: number;
            mostCommonAttendees: {
                email: string;
                count: number;
                name?: string | undefined;
            }[];
            preferredTimeSlots: {
                dayOfWeek: number;
                startHour: number;
                endHour: number;
                frequency: number;
            }[];
            meetingsByType: Record<string, number>;
        }>;
    };
    readonly semanticSearch: {
        readonly method: "POST";
        readonly path: "/api/search/semantic";
        readonly request: z.ZodObject<{
            query: z.ZodString;
            limit: z.ZodDefault<z.ZodNumber>;
            dateAfter: z.ZodOptional<z.ZodString>;
            dateBefore: z.ZodOptional<z.ZodString>;
            fromContact: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            query: string;
            dateAfter?: string | undefined;
            dateBefore?: string | undefined;
            fromContact?: string | undefined;
        }, {
            query: string;
            limit?: number | undefined;
            dateAfter?: string | undefined;
            dateBefore?: string | undefined;
            fromContact?: string | undefined;
        }>;
        readonly response: z.ZodObject<{
            results: z.ZodArray<z.ZodObject<{
                emailId: z.ZodString;
                score: z.ZodNumber;
                snippet: z.ZodString;
                metadata: z.ZodObject<{
                    from: z.ZodString;
                    subject: z.ZodString;
                    date: z.ZodString;
                    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    date: string;
                    subject: string;
                    from: string;
                    labels?: string[] | undefined;
                }, {
                    date: string;
                    subject: string;
                    from: string;
                    labels?: string[] | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                score: number;
                emailId: string;
                snippet: string;
                metadata: {
                    date: string;
                    subject: string;
                    from: string;
                    labels?: string[] | undefined;
                };
            }, {
                score: number;
                emailId: string;
                snippet: string;
                metadata: {
                    date: string;
                    subject: string;
                    from: string;
                    labels?: string[] | undefined;
                };
            }>, "many">;
            total: z.ZodNumber;
            query: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            total: number;
            query: string;
            results: {
                score: number;
                emailId: string;
                snippet: string;
                metadata: {
                    date: string;
                    subject: string;
                    from: string;
                    labels?: string[] | undefined;
                };
            }[];
        }, {
            total: number;
            query: string;
            results: {
                score: number;
                emailId: string;
                snippet: string;
                metadata: {
                    date: string;
                    subject: string;
                    from: string;
                    labels?: string[] | undefined;
                };
            }[];
        }>;
    };
};
//# sourceMappingURL=context.contracts.d.ts.map