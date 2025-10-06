/**
 * Email-specific validation schemas
 */
import { z } from 'zod';
export declare const emailSubjectSchema: z.ZodString;
export declare const emailBodySchema: z.ZodString;
export declare const emailSnippetSchema: z.ZodString;
export declare const emailLabelsSchema: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
export declare const sendEmailSchema: z.ZodObject<{
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    body: z.ZodString;
    replyToThreadId: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    to: string[];
    subject: string;
    body: string;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    replyToThreadId?: string | undefined;
    attachments?: {
        filename: string;
        mimeType: string;
        size: number;
        content: string;
    }[] | undefined;
}, {
    to: string[];
    subject: string;
    body: string;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    replyToThreadId?: string | undefined;
    attachments?: {
        filename: string;
        mimeType: string;
        size: number;
        content: string;
    }[] | undefined;
}>;
export declare const updateEmailSchema: z.ZodObject<{
    id: z.ZodString;
    isRead: z.ZodOptional<z.ZodBoolean>;
    isStarred: z.ZodOptional<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    isRead?: boolean | undefined;
    isStarred?: boolean | undefined;
    labels?: string[] | undefined;
}, {
    id: string;
    isRead?: boolean | undefined;
    isStarred?: boolean | undefined;
    labels?: string[] | undefined;
}>;
export declare const searchEmailsSchema: z.ZodEffects<z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    query: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    dateAfter: z.ZodOptional<z.ZodString>;
    dateBefore: z.ZodOptional<z.ZodString>;
    hasAttachment: z.ZodOptional<z.ZodBoolean>;
    isUnread: z.ZodOptional<z.ZodBoolean>;
    isStarred: z.ZodOptional<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    to?: string | undefined;
    subject?: string | undefined;
    isStarred?: boolean | undefined;
    labels?: string[] | undefined;
    query?: string | undefined;
    from?: string | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
}, {
    to?: string | undefined;
    subject?: string | undefined;
    isStarred?: boolean | undefined;
    labels?: string[] | undefined;
    query?: string | undefined;
    from?: string | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>, {
    page: number;
    limit: number;
    to?: string | undefined;
    subject?: string | undefined;
    isStarred?: boolean | undefined;
    labels?: string[] | undefined;
    query?: string | undefined;
    from?: string | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
}, {
    to?: string | undefined;
    subject?: string | undefined;
    isStarred?: boolean | undefined;
    labels?: string[] | undefined;
    query?: string | undefined;
    from?: string | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const emailProviderSchema: z.ZodEnum<["gmail", "outlook"]>;
export declare const syncEmailsSchema: z.ZodObject<{
    provider: z.ZodEnum<["gmail", "outlook"]>;
    fullSync: z.ZodDefault<z.ZodBoolean>;
    since: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gmail" | "outlook";
    fullSync: boolean;
    since?: string | undefined;
}, {
    provider: "gmail" | "outlook";
    fullSync?: boolean | undefined;
    since?: string | undefined;
}>;
//# sourceMappingURL=email.validators.d.ts.map