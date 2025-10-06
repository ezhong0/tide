/**
 * Calendar domain validation schemas
 * Runtime validation for calendar operations
 */
import { z } from 'zod';
export declare const EventTypeSchema: z.ZodEnum<["meeting", "appointment", "task", "reminder", "focus", "out-of-office"]>;
export declare const EventStatusSchema: z.ZodEnum<["tentative", "confirmed", "cancelled"]>;
export declare const ResponseStatusSchema: z.ZodEnum<["accepted", "declined", "tentative", "pending"]>;
export declare const DayOfWeekSchema: z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>;
export declare const EventLocationSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>>;
    room: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodString>;
    meetingUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "physical" | "virtual" | "hybrid";
    name: string;
    address?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
    room?: string | undefined;
    floor?: string | undefined;
    meetingUrl?: string | undefined;
}, {
    type: "physical" | "virtual" | "hybrid";
    name: string;
    address?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
    room?: string | undefined;
    floor?: string | undefined;
    meetingUrl?: string | undefined;
}>, {
    type: "physical" | "virtual" | "hybrid";
    name: string;
    address?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
    room?: string | undefined;
    floor?: string | undefined;
    meetingUrl?: string | undefined;
}, {
    type: "physical" | "virtual" | "hybrid";
    name: string;
    address?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
    room?: string | undefined;
    floor?: string | undefined;
    meetingUrl?: string | undefined;
}>;
export declare const ParticipantSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["organizer", "required", "optional", "resource"]>;
    responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "pending"]>;
    responseTime: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    comment: z.ZodOptional<z.ZodString>;
    isResource: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "organizer" | "required" | "optional" | "resource";
    responseStatus: "tentative" | "accepted" | "declined" | "pending";
    userId?: string | undefined;
    responseTime?: number | undefined;
    comment?: string | undefined;
    isResource?: boolean | undefined;
}, {
    name: string;
    email: string;
    role: "organizer" | "required" | "optional" | "resource";
    responseStatus: "tentative" | "accepted" | "declined" | "pending";
    userId?: string | undefined;
    responseTime?: number | undefined;
    comment?: string | undefined;
    isResource?: boolean | undefined;
}>;
export declare const ReminderSchema: z.ZodObject<{
    type: z.ZodEnum<["email", "popup", "sms", "push"]>;
    minutesBefore: z.ZodNumber;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "push" | "email" | "popup" | "sms";
    minutesBefore: number;
    message?: string | undefined;
}, {
    type: "push" | "email" | "popup" | "sms";
    minutesBefore: number;
    message?: string | undefined;
}>;
export declare const ConferenceDataSchema: z.ZodObject<{
    type: z.ZodEnum<["zoom", "teams", "meet", "webex", "other"]>;
    url: z.ZodString;
    meetingId: z.ZodOptional<z.ZodString>;
    passcode: z.ZodOptional<z.ZodString>;
    phoneNumbers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        number: z.ZodString;
        region: z.ZodString;
        pin: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        number: string;
        region: string;
        pin?: string | undefined;
    }, {
        number: string;
        region: string;
        pin?: string | undefined;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "zoom" | "teams" | "meet" | "webex" | "other";
    url: string;
    meetingId?: string | undefined;
    passcode?: string | undefined;
    phoneNumbers?: {
        number: string;
        region: string;
        pin?: string | undefined;
    }[] | undefined;
    notes?: string | undefined;
}, {
    type: "zoom" | "teams" | "meet" | "webex" | "other";
    url: string;
    meetingId?: string | undefined;
    passcode?: string | undefined;
    phoneNumbers?: {
        number: string;
        region: string;
        pin?: string | undefined;
    }[] | undefined;
    notes?: string | undefined;
}>;
export declare const RecurrenceRuleSchema: z.ZodEffects<z.ZodObject<{
    frequency: z.ZodEnum<["daily", "weekly", "monthly", "yearly"]>;
    interval: z.ZodNumber;
    count: z.ZodOptional<z.ZodNumber>;
    until: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    byDay: z.ZodOptional<z.ZodArray<z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>, "many">>;
    byMonthDay: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    byMonth: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    exceptions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodNumber, number, number>, "many">>;
}, "strip", z.ZodTypeAny, {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    count?: number | undefined;
    until?: number | undefined;
    byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
    byMonthDay?: number[] | undefined;
    byMonth?: number[] | undefined;
    exceptions?: number[] | undefined;
}, {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    count?: number | undefined;
    until?: number | undefined;
    byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
    byMonthDay?: number[] | undefined;
    byMonth?: number[] | undefined;
    exceptions?: number[] | undefined;
}>, {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    count?: number | undefined;
    until?: number | undefined;
    byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
    byMonthDay?: number[] | undefined;
    byMonth?: number[] | undefined;
    exceptions?: number[] | undefined;
}, {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    count?: number | undefined;
    until?: number | undefined;
    byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
    byMonthDay?: number[] | undefined;
    byMonth?: number[] | undefined;
    exceptions?: number[] | undefined;
}>;
export declare const CreateCalendarEventSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
        room: z.ZodOptional<z.ZodString>;
        floor: z.ZodOptional<z.ZodString>;
        meetingUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }>, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }>>;
    type: z.ZodEnum<["meeting", "appointment", "task", "reminder", "focus", "out-of-office"]>;
    status: z.ZodDefault<z.ZodEnum<["tentative", "confirmed", "cancelled"]>>;
    startTime: z.ZodEffects<z.ZodNumber, number, number>;
    endTime: z.ZodEffects<z.ZodNumber, number, number>;
    timezone: z.ZodDefault<z.ZodString>;
    isAllDay: z.ZodDefault<z.ZodBoolean>;
    attendees: z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<["organizer", "required", "optional", "resource"]>;
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "pending"]>;
        responseTime: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
        comment: z.ZodOptional<z.ZodString>;
        isResource: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }, {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }>, "many">>;
    reminders: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["email", "popup", "sms", "push"]>;
        minutesBefore: z.ZodNumber;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }, {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }>, "many">>;
    conferenceData: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["zoom", "teams", "meet", "webex", "other"]>;
        url: z.ZodString;
        meetingId: z.ZodOptional<z.ZodString>;
        passcode: z.ZodOptional<z.ZodString>;
        phoneNumbers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            number: z.ZodString;
            region: z.ZodString;
            pin: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            number: string;
            region: string;
            pin?: string | undefined;
        }, {
            number: string;
            region: string;
            pin?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    }, {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    }>>;
    recurrence: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly", "yearly"]>;
        interval: z.ZodNumber;
        count: z.ZodOptional<z.ZodNumber>;
        until: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
        byDay: z.ZodOptional<z.ZodArray<z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>, "many">>;
        byMonthDay: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        byMonth: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        exceptions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodNumber, number, number>, "many">>;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }>, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }>>;
    color: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office";
    status: "tentative" | "confirmed" | "cancelled";
    userId: string;
    title: string;
    startTime: number;
    endTime: number;
    timezone: string;
    isAllDay: boolean;
    isPrivate: boolean;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
}, {
    type: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office";
    userId: string;
    title: string;
    startTime: number;
    endTime: number;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    timezone?: string | undefined;
    isAllDay?: boolean | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
    isPrivate?: boolean | undefined;
}>, {
    type: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office";
    status: "tentative" | "confirmed" | "cancelled";
    userId: string;
    title: string;
    startTime: number;
    endTime: number;
    timezone: string;
    isAllDay: boolean;
    isPrivate: boolean;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
}, {
    type: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office";
    userId: string;
    title: string;
    startTime: number;
    endTime: number;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    timezone?: string | undefined;
    isAllDay?: boolean | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
    isPrivate?: boolean | undefined;
}>, {
    type: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office";
    status: "tentative" | "confirmed" | "cancelled";
    userId: string;
    title: string;
    startTime: number;
    endTime: number;
    timezone: string;
    isAllDay: boolean;
    isPrivate: boolean;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
}, {
    type: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office";
    userId: string;
    title: string;
    startTime: number;
    endTime: number;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    timezone?: string | undefined;
    isAllDay?: boolean | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
    isPrivate?: boolean | undefined;
}>;
export declare const UpdateCalendarEventSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
        room: z.ZodOptional<z.ZodString>;
        floor: z.ZodOptional<z.ZodString>;
        meetingUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }>, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }, {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    }>>>;
    type: z.ZodOptional<z.ZodEnum<["meeting", "appointment", "task", "reminder", "focus", "out-of-office"]>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["tentative", "confirmed", "cancelled"]>>>;
    startTime: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    endTime: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    isAllDay: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    attendees: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<["organizer", "required", "optional", "resource"]>;
        responseStatus: z.ZodEnum<["accepted", "declined", "tentative", "pending"]>;
        responseTime: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
        comment: z.ZodOptional<z.ZodString>;
        isResource: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }, {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }>, "many">>>;
    reminders: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["email", "popup", "sms", "push"]>;
        minutesBefore: z.ZodNumber;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }, {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }>, "many">>>;
    conferenceData: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["zoom", "teams", "meet", "webex", "other"]>;
        url: z.ZodString;
        meetingId: z.ZodOptional<z.ZodString>;
        passcode: z.ZodOptional<z.ZodString>;
        phoneNumbers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            number: z.ZodString;
            region: z.ZodString;
            pin: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            number: string;
            region: string;
            pin?: string | undefined;
        }, {
            number: string;
            region: string;
            pin?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    }, {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    }>>>;
    recurrence: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly", "yearly"]>;
        interval: z.ZodNumber;
        count: z.ZodOptional<z.ZodNumber>;
        until: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
        byDay: z.ZodOptional<z.ZodArray<z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>, "many">>;
        byMonthDay: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        byMonth: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        exceptions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodNumber, number, number>, "many">>;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }>, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    }>>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    categories: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    isPrivate: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
} & {
    eventId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    type?: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office" | undefined;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    userId?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    timezone?: string | undefined;
    isAllDay?: boolean | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
    isPrivate?: boolean | undefined;
}, {
    eventId: string;
    type?: "meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office" | undefined;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    userId?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    location?: {
        type: "physical" | "virtual" | "hybrid";
        name: string;
        address?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
        room?: string | undefined;
        floor?: string | undefined;
        meetingUrl?: string | undefined;
    } | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    timezone?: string | undefined;
    isAllDay?: boolean | undefined;
    attendees?: {
        name: string;
        email: string;
        role: "organizer" | "required" | "optional" | "resource";
        responseStatus: "tentative" | "accepted" | "declined" | "pending";
        userId?: string | undefined;
        responseTime?: number | undefined;
        comment?: string | undefined;
        isResource?: boolean | undefined;
    }[] | undefined;
    reminders?: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[] | undefined;
    conferenceData?: {
        type: "zoom" | "teams" | "meet" | "webex" | "other";
        url: string;
        meetingId?: string | undefined;
        passcode?: string | undefined;
        phoneNumbers?: {
            number: string;
            region: string;
            pin?: string | undefined;
        }[] | undefined;
        notes?: string | undefined;
    } | undefined;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        count?: number | undefined;
        until?: number | undefined;
        byDay?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        exceptions?: number[] | undefined;
    } | undefined;
    color?: string | undefined;
    categories?: string[] | undefined;
    isPrivate?: boolean | undefined;
}>;
export declare const AvailabilityParamsSchema: z.ZodObject<{
    userId: z.ZodString;
    timeRange: z.ZodObject<{
        start: z.ZodEffects<z.ZodNumber, number, number>;
        end: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    duration: z.ZodNumber;
    excludeEvents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeBufferTime: z.ZodDefault<z.ZodBoolean>;
    workingHoursOnly: z.ZodDefault<z.ZodBoolean>;
    constraints: z.ZodOptional<z.ZodObject<{
        earliestTime: z.ZodOptional<z.ZodString>;
        latestTime: z.ZodOptional<z.ZodString>;
        avoidDays: z.ZodOptional<z.ZodArray<z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>, "many">>;
        bufferBefore: z.ZodOptional<z.ZodNumber>;
        bufferAfter: z.ZodOptional<z.ZodNumber>;
        maxConsecutiveHours: z.ZodOptional<z.ZodNumber>;
        preferredLocation: z.ZodOptional<z.ZodEnum<["remote", "office", "any"]>>;
    }, "strip", z.ZodTypeAny, {
        earliestTime?: string | undefined;
        latestTime?: string | undefined;
        avoidDays?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        bufferBefore?: number | undefined;
        bufferAfter?: number | undefined;
        maxConsecutiveHours?: number | undefined;
        preferredLocation?: "remote" | "office" | "any" | undefined;
    }, {
        earliestTime?: string | undefined;
        latestTime?: string | undefined;
        avoidDays?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        bufferBefore?: number | undefined;
        bufferAfter?: number | undefined;
        maxConsecutiveHours?: number | undefined;
        preferredLocation?: "remote" | "office" | "any" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    timeRange: {
        start: number;
        end: number;
    };
    duration: number;
    includeBufferTime: boolean;
    workingHoursOnly: boolean;
    excludeEvents?: string[] | undefined;
    constraints?: {
        earliestTime?: string | undefined;
        latestTime?: string | undefined;
        avoidDays?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        bufferBefore?: number | undefined;
        bufferAfter?: number | undefined;
        maxConsecutiveHours?: number | undefined;
        preferredLocation?: "remote" | "office" | "any" | undefined;
    } | undefined;
}, {
    userId: string;
    timeRange: {
        start: number;
        end: number;
    };
    duration: number;
    excludeEvents?: string[] | undefined;
    includeBufferTime?: boolean | undefined;
    workingHoursOnly?: boolean | undefined;
    constraints?: {
        earliestTime?: string | undefined;
        latestTime?: string | undefined;
        avoidDays?: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[] | undefined;
        bufferBefore?: number | undefined;
        bufferAfter?: number | undefined;
        maxConsecutiveHours?: number | undefined;
        preferredLocation?: "remote" | "office" | "any" | undefined;
    } | undefined;
}>;
export declare const MeetingConstraintsSchema: z.ZodObject<{
    duration: z.ZodNumber;
    requiredAttendees: z.ZodArray<z.ZodString, "many">;
    optionalAttendees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    roomRequired: z.ZodDefault<z.ZodBoolean>;
    equipmentRequired: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    preferredTimes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
        weight: number;
    }, {
        start: string;
        end: string;
        weight: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    requiredAttendees: string[];
    roomRequired: boolean;
    title?: string | undefined;
    description?: string | undefined;
    optionalAttendees?: string[] | undefined;
    equipmentRequired?: string[] | undefined;
    preferredTimes?: {
        start: string;
        end: string;
        weight: number;
    }[] | undefined;
}, {
    duration: number;
    requiredAttendees: string[];
    title?: string | undefined;
    description?: string | undefined;
    optionalAttendees?: string[] | undefined;
    roomRequired?: boolean | undefined;
    equipmentRequired?: string[] | undefined;
    preferredTimes?: {
        start: string;
        end: string;
        weight: number;
    }[] | undefined;
}>;
export declare const WorkingHoursSchema: z.ZodObject<{
    userId: z.ZodString;
    timezone: z.ZodString;
    schedule: z.ZodArray<z.ZodObject<{
        day: z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>;
        isWorkingDay: z.ZodBoolean;
        start: z.ZodOptional<z.ZodString>;
        end: z.ZodOptional<z.ZodString>;
        breaks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
        isWorkingDay: boolean;
        start?: string | undefined;
        end?: string | undefined;
        breaks?: {
            start: string;
            end: string;
        }[] | undefined;
    }, {
        day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
        isWorkingDay: boolean;
        start?: string | undefined;
        end?: string | undefined;
        breaks?: {
            start: string;
            end: string;
        }[] | undefined;
    }>, "many">;
    exceptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        date: z.ZodEffects<z.ZodNumber, number, number>;
        isWorkingDay: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date: number;
        isWorkingDay: boolean;
        reason?: string | undefined;
    }, {
        date: number;
        isWorkingDay: boolean;
        reason?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    timezone: string;
    schedule: {
        day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
        isWorkingDay: boolean;
        start?: string | undefined;
        end?: string | undefined;
        breaks?: {
            start: string;
            end: string;
        }[] | undefined;
    }[];
    exceptions?: {
        date: number;
        isWorkingDay: boolean;
        reason?: string | undefined;
    }[] | undefined;
}, {
    userId: string;
    timezone: string;
    schedule: {
        day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
        isWorkingDay: boolean;
        start?: string | undefined;
        end?: string | undefined;
        breaks?: {
            start: string;
            end: string;
        }[] | undefined;
    }[];
    exceptions?: {
        date: number;
        isWorkingDay: boolean;
        reason?: string | undefined;
    }[] | undefined;
}>;
export declare const CalendarPreferencesSchema: z.ZodObject<{
    userId: z.ZodString;
    defaultCalendarId: z.ZodString;
    defaultMeetingDuration: z.ZodDefault<z.ZodNumber>;
    defaultReminders: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["email", "popup", "sms", "push"]>;
        minutesBefore: z.ZodNumber;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }, {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }>, "many">;
    workingHours: z.ZodObject<{
        userId: z.ZodString;
        timezone: z.ZodString;
        schedule: z.ZodArray<z.ZodObject<{
            day: z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>;
            isWorkingDay: z.ZodBoolean;
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
            breaks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
            }, {
                start: string;
                end: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
            isWorkingDay: boolean;
            start?: string | undefined;
            end?: string | undefined;
            breaks?: {
                start: string;
                end: string;
            }[] | undefined;
        }, {
            day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
            isWorkingDay: boolean;
            start?: string | undefined;
            end?: string | undefined;
            breaks?: {
                start: string;
                end: string;
            }[] | undefined;
        }>, "many">;
        exceptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            date: z.ZodEffects<z.ZodNumber, number, number>;
            isWorkingDay: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            date: number;
            isWorkingDay: boolean;
            reason?: string | undefined;
        }, {
            date: number;
            isWorkingDay: boolean;
            reason?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        timezone: string;
        schedule: {
            day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
            isWorkingDay: boolean;
            start?: string | undefined;
            end?: string | undefined;
            breaks?: {
                start: string;
                end: string;
            }[] | undefined;
        }[];
        exceptions?: {
            date: number;
            isWorkingDay: boolean;
            reason?: string | undefined;
        }[] | undefined;
    }, {
        userId: string;
        timezone: string;
        schedule: {
            day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
            isWorkingDay: boolean;
            start?: string | undefined;
            end?: string | undefined;
            breaks?: {
                start: string;
                end: string;
            }[] | undefined;
        }[];
        exceptions?: {
            date: number;
            isWorkingDay: boolean;
            reason?: string | undefined;
        }[] | undefined;
    }>;
    autoDeclineConflicts: z.ZodDefault<z.ZodBoolean>;
    showDeclinedEvents: z.ZodDefault<z.ZodBoolean>;
    weekStartsOn: z.ZodDefault<z.ZodEnum<["MO", "TU", "WE", "TH", "FR", "SA", "SU"]>>;
    timeZone: z.ZodString;
    preferredMeetingTypes: z.ZodArray<z.ZodEnum<["meeting", "appointment", "task", "reminder", "focus", "out-of-office"]>, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    defaultCalendarId: string;
    defaultMeetingDuration: number;
    defaultReminders: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[];
    workingHours: {
        userId: string;
        timezone: string;
        schedule: {
            day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
            isWorkingDay: boolean;
            start?: string | undefined;
            end?: string | undefined;
            breaks?: {
                start: string;
                end: string;
            }[] | undefined;
        }[];
        exceptions?: {
            date: number;
            isWorkingDay: boolean;
            reason?: string | undefined;
        }[] | undefined;
    };
    autoDeclineConflicts: boolean;
    showDeclinedEvents: boolean;
    weekStartsOn: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
    timeZone: string;
    preferredMeetingTypes: ("meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office")[];
}, {
    userId: string;
    defaultCalendarId: string;
    defaultReminders: {
        type: "push" | "email" | "popup" | "sms";
        minutesBefore: number;
        message?: string | undefined;
    }[];
    workingHours: {
        userId: string;
        timezone: string;
        schedule: {
            day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
            isWorkingDay: boolean;
            start?: string | undefined;
            end?: string | undefined;
            breaks?: {
                start: string;
                end: string;
            }[] | undefined;
        }[];
        exceptions?: {
            date: number;
            isWorkingDay: boolean;
            reason?: string | undefined;
        }[] | undefined;
    };
    timeZone: string;
    preferredMeetingTypes: ("meeting" | "appointment" | "task" | "reminder" | "focus" | "out-of-office")[];
    defaultMeetingDuration?: number | undefined;
    autoDeclineConflicts?: boolean | undefined;
    showDeclinedEvents?: boolean | undefined;
    weekStartsOn?: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU" | undefined;
}>;
//# sourceMappingURL=calendar.schemas.d.ts.map