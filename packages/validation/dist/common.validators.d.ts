/**
 * Common validation schemas
 *
 * Reusable Zod schemas for common data types
 */
import { z } from 'zod';
export declare const emailSchema: z.ZodString;
export declare const uuidSchema: z.ZodString;
export declare const datetimeSchema: z.ZodString;
export declare const urlSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const timezoneSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const timeOfDaySchema: z.ZodEnum<["morning", "lunch", "afternoon", "evening"]>;
export declare const toneSchema: z.ZodEnum<["professional", "casual", "friendly", "formal"]>;
export declare const relationshipTypeSchema: z.ZodEnum<["colleague", "client", "friend", "boss", "vendor"]>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const cursorPaginationSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    limit?: number | undefined;
    cursor?: string | undefined;
}>;
export declare const dateRangeSchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
}, {
    start: string;
    end: string;
}>, {
    start: string;
    end: string;
}, {
    start: string;
    end: string;
}>;
export declare const optionalDateRangeSchema: z.ZodEffects<z.ZodObject<{
    dateAfter: z.ZodOptional<z.ZodString>;
    dateBefore: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
}, {
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
}>, {
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
}, {
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const threadIdParamSchema: z.ZodObject<{
    threadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    threadId: string;
}, {
    threadId: string;
}>;
export declare const emailParamSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const searchQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    query: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    query?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
}>;
export declare const semanticSearchSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    threshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    threshold?: number | undefined;
}, {
    query: string;
    limit?: number | undefined;
    threshold?: number | undefined;
}>;
export declare const attachmentSchema: z.ZodObject<{
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
    mimeType: string;
    size: number;
    content: string;
}, {
    filename: string;
    mimeType: string;
    size: number;
    content: string;
}>;
export declare const attachmentsArraySchema: z.ZodArray<z.ZodObject<{
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
    mimeType: string;
    size: number;
    content: string;
}, {
    filename: string;
    mimeType: string;
    size: number;
    content: string;
}>, "many">;
export declare const emailAddressSchema: z.ZodString;
export declare const emailAddressArraySchema: z.ZodArray<z.ZodString, "many">;
export declare const optionalEmailAddressArraySchema: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
export declare const quietHoursSchema: z.ZodObject<{
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
}>;
export declare const notificationInterruptionsSchema: z.ZodObject<{
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
}>;
export declare const notificationPreferencesSchema: z.ZodObject<{
    interruptions: z.ZodObject<{
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
    }>;
    batch_interval: z.ZodNumber;
    quiet_hours: z.ZodObject<{
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
    }>;
}, "strip", z.ZodTypeAny, {
    interruptions: {
        vip_emails: boolean;
        meeting_reminders: boolean;
        urgent_deadlines: boolean;
        tracked_responses: boolean;
    };
    batch_interval: number;
    quiet_hours: {
        start: string;
        end: string;
        enabled: boolean;
    };
}, {
    interruptions: {
        vip_emails: boolean;
        meeting_reminders: boolean;
        urgent_deadlines: boolean;
        tracked_responses: boolean;
    };
    batch_interval: number;
    quiet_hours: {
        start: string;
        end: string;
        enabled: boolean;
    };
}>;
export declare const webhookHeaderSchema: z.ZodObject<{
    'x-webhook-signature': z.ZodString;
    'x-webhook-timestamp': z.ZodString;
}, "strip", z.ZodTypeAny, {
    'x-webhook-signature': string;
    'x-webhook-timestamp': string;
}, {
    'x-webhook-signature': string;
    'x-webhook-timestamp': string;
}>;
export declare const sortOrderSchema: z.ZodEnum<["asc", "desc"]>;
export declare const sortSchema: z.ZodObject<{
    field: z.ZodString;
    order: z.ZodEnum<["asc", "desc"]>;
}, "strip", z.ZodTypeAny, {
    field: string;
    order: "asc" | "desc";
}, {
    field: string;
    order: "asc" | "desc";
}>;
export declare const statusFilterSchema: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
export declare const tagsFilterSchema: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
export declare const booleanFilterSchema: z.ZodOptional<z.ZodBoolean>;
//# sourceMappingURL=common.validators.d.ts.map