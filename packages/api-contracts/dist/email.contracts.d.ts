/**
 * Email API Contracts
 *
 * Zod schemas for all email-related API endpoints
 */
import { z } from 'zod';
export declare const SendEmailRequestSchema: z.ZodObject<{
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
    replyToThreadId?: string | undefined;
    bcc?: string[] | undefined;
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
    replyToThreadId?: string | undefined;
    bcc?: string[] | undefined;
    attachments?: {
        filename: string;
        mimeType: string;
        size: number;
        content: string;
    }[] | undefined;
}>;
export declare const SearchEmailsRequestSchema: z.ZodObject<{
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
    limit: z.ZodDefault<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    to?: string | undefined;
    subject?: string | undefined;
    query?: string | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    from?: string | undefined;
    labels?: string[] | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
    isStarred?: boolean | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    to?: string | undefined;
    subject?: string | undefined;
    query?: string | undefined;
    dateAfter?: string | undefined;
    dateBefore?: string | undefined;
    from?: string | undefined;
    labels?: string[] | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
    isStarred?: boolean | undefined;
}>;
export declare const GetEmailRequestSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const GetThreadRequestSchema: z.ZodObject<{
    threadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    threadId: string;
}, {
    threadId: string;
}>;
export declare const UpdateEmailRequestSchema: z.ZodObject<{
    id: z.ZodString;
    isRead: z.ZodOptional<z.ZodBoolean>;
    isStarred: z.ZodOptional<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    labels?: string[] | undefined;
    isStarred?: boolean | undefined;
    isRead?: boolean | undefined;
}, {
    id: string;
    labels?: string[] | undefined;
    isStarred?: boolean | undefined;
    isRead?: boolean | undefined;
}>;
export declare const ArchiveEmailRequestSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SyncEmailsRequestSchema: z.ZodObject<{
    provider: z.ZodEnum<["gmail", "outlook"]>;
    fullSync: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gmail" | "outlook";
    fullSync: boolean;
}, {
    provider: "gmail" | "outlook";
    fullSync?: boolean | undefined;
}>;
export declare const SendEmailResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    messageId: z.ZodString;
    threadId: z.ZodString;
    sentAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    threadId: string;
    messageId: string;
    sentAt: string;
}, {
    success: boolean;
    threadId: string;
    messageId: string;
    sentAt: string;
}>;
export declare const EmailSchema: z.ZodObject<{
    id: z.ZodString;
    externalId: z.ZodString;
    threadId: z.ZodString;
    direction: z.ZodEnum<["sent", "received"]>;
    from: z.ZodString;
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    snippet: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }>, "many">>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isRead: z.ZodBoolean;
    isStarred: z.ZodBoolean;
    isImportant: z.ZodBoolean;
    date: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: string;
    createdAt: string;
    externalId: string;
    to: string[];
    subject: string;
    snippet: string;
    from: string;
    isStarred: boolean;
    threadId: string;
    isRead: boolean;
    direction: "received" | "sent";
    isImportant: boolean;
    cc?: string[] | undefined;
    body?: string | undefined;
    labels?: string[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
}, {
    id: string;
    date: string;
    createdAt: string;
    externalId: string;
    to: string[];
    subject: string;
    snippet: string;
    from: string;
    isStarred: boolean;
    threadId: string;
    isRead: boolean;
    direction: "received" | "sent";
    isImportant: boolean;
    cc?: string[] | undefined;
    body?: string | undefined;
    labels?: string[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
}>;
export declare const SearchEmailsResponseSchema: z.ZodObject<{
    emails: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        threadId: z.ZodString;
        direction: z.ZodEnum<["sent", "received"]>;
        from: z.ZodString;
        to: z.ZodArray<z.ZodString, "many">;
        cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        subject: z.ZodString;
        snippet: z.ZodString;
        body: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            mimeType: z.ZodString;
            size: z.ZodNumber;
            url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }, {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }>, "many">>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        isRead: z.ZodBoolean;
        isStarred: z.ZodBoolean;
        isImportant: z.ZodBoolean;
        date: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }, {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    total: number;
    hasMore: boolean;
    emails: {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }[];
}, {
    limit: number;
    page: number;
    total: number;
    hasMore: boolean;
    emails: {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }[];
}>;
export declare const GetEmailResponseSchema: z.ZodObject<{
    id: z.ZodString;
    externalId: z.ZodString;
    threadId: z.ZodString;
    direction: z.ZodEnum<["sent", "received"]>;
    from: z.ZodString;
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    snippet: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }>, "many">>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isRead: z.ZodBoolean;
    isStarred: z.ZodBoolean;
    isImportant: z.ZodBoolean;
    date: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: string;
    createdAt: string;
    externalId: string;
    to: string[];
    subject: string;
    snippet: string;
    from: string;
    isStarred: boolean;
    threadId: string;
    isRead: boolean;
    direction: "received" | "sent";
    isImportant: boolean;
    cc?: string[] | undefined;
    body?: string | undefined;
    labels?: string[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
}, {
    id: string;
    date: string;
    createdAt: string;
    externalId: string;
    to: string[];
    subject: string;
    snippet: string;
    from: string;
    isStarred: boolean;
    threadId: string;
    isRead: boolean;
    direction: "received" | "sent";
    isImportant: boolean;
    cc?: string[] | undefined;
    body?: string | undefined;
    labels?: string[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
}>;
export declare const ThreadEmailSchema: z.ZodObject<{
    id: z.ZodString;
    externalId: z.ZodString;
    threadId: z.ZodString;
    direction: z.ZodEnum<["sent", "received"]>;
    from: z.ZodString;
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    snippet: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }>, "many">>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isRead: z.ZodBoolean;
    isStarred: z.ZodBoolean;
    isImportant: z.ZodBoolean;
    date: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: string;
    createdAt: string;
    externalId: string;
    to: string[];
    subject: string;
    snippet: string;
    from: string;
    isStarred: boolean;
    threadId: string;
    isRead: boolean;
    direction: "received" | "sent";
    isImportant: boolean;
    cc?: string[] | undefined;
    body?: string | undefined;
    labels?: string[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
}, {
    id: string;
    date: string;
    createdAt: string;
    externalId: string;
    to: string[];
    subject: string;
    snippet: string;
    from: string;
    isStarred: boolean;
    threadId: string;
    isRead: boolean;
    direction: "received" | "sent";
    isImportant: boolean;
    cc?: string[] | undefined;
    body?: string | undefined;
    labels?: string[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
}>;
export declare const GetThreadResponseSchema: z.ZodObject<{
    threadId: z.ZodString;
    subject: z.ZodString;
    participants: z.ZodArray<z.ZodString, "many">;
    messageCount: z.ZodNumber;
    emails: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        threadId: z.ZodString;
        direction: z.ZodEnum<["sent", "received"]>;
        from: z.ZodString;
        to: z.ZodArray<z.ZodString, "many">;
        cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        subject: z.ZodString;
        snippet: z.ZodString;
        body: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            mimeType: z.ZodString;
            size: z.ZodNumber;
            url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }, {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }>, "many">>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        isRead: z.ZodBoolean;
        isStarred: z.ZodBoolean;
        isImportant: z.ZodBoolean;
        date: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }, {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }>, "many">;
    latestDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    participants: string[];
    subject: string;
    threadId: string;
    emails: {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }[];
    messageCount: number;
    latestDate: string;
}, {
    participants: string[];
    subject: string;
    threadId: string;
    emails: {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }[];
    messageCount: number;
    latestDate: string;
}>;
export declare const UpdateEmailResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    email: z.ZodObject<{
        id: z.ZodString;
        externalId: z.ZodString;
        threadId: z.ZodString;
        direction: z.ZodEnum<["sent", "received"]>;
        from: z.ZodString;
        to: z.ZodArray<z.ZodString, "many">;
        cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        subject: z.ZodString;
        snippet: z.ZodString;
        body: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            mimeType: z.ZodString;
            size: z.ZodNumber;
            url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }, {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }>, "many">>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        isRead: z.ZodBoolean;
        isStarred: z.ZodBoolean;
        isImportant: z.ZodBoolean;
        date: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }, {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    email: {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    };
    success: boolean;
}, {
    email: {
        id: string;
        date: string;
        createdAt: string;
        externalId: string;
        to: string[];
        subject: string;
        snippet: string;
        from: string;
        isStarred: boolean;
        threadId: string;
        isRead: boolean;
        direction: "received" | "sent";
        isImportant: boolean;
        cc?: string[] | undefined;
        body?: string | undefined;
        labels?: string[] | undefined;
        attachments?: {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            url?: string | undefined;
        }[] | undefined;
    };
    success: boolean;
}>;
export declare const ArchiveEmailResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    archivedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    archivedAt: string;
}, {
    success: boolean;
    archivedAt: string;
}>;
export declare const SyncEmailsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    newEmails: z.ZodNumber;
    updatedEmails: z.ZodNumber;
    syncedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    newEmails: number;
    updatedEmails: number;
    syncedAt: string;
}, {
    success: boolean;
    newEmails: number;
    updatedEmails: number;
    syncedAt: string;
}>;
export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;
export type SendEmailResponse = z.infer<typeof SendEmailResponseSchema>;
export type SearchEmailsRequest = z.infer<typeof SearchEmailsRequestSchema>;
export type SearchEmailsResponse = z.infer<typeof SearchEmailsResponseSchema>;
export type GetEmailRequest = z.infer<typeof GetEmailRequestSchema>;
export type GetEmailResponse = z.infer<typeof GetEmailResponseSchema>;
export type GetThreadRequest = z.infer<typeof GetThreadRequestSchema>;
export type GetThreadResponse = z.infer<typeof GetThreadResponseSchema>;
export type UpdateEmailRequest = z.infer<typeof UpdateEmailRequestSchema>;
export type UpdateEmailResponse = z.infer<typeof UpdateEmailResponseSchema>;
export type ArchiveEmailRequest = z.infer<typeof ArchiveEmailRequestSchema>;
export type ArchiveEmailResponse = z.infer<typeof ArchiveEmailResponseSchema>;
export type SyncEmailsRequest = z.infer<typeof SyncEmailsRequestSchema>;
export type SyncEmailsResponse = z.infer<typeof SyncEmailsResponseSchema>;
export declare const EmailContracts: {
    readonly sendEmail: {
        readonly method: "POST";
        readonly path: "/api/email/send";
        readonly request: z.ZodObject<{
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
            replyToThreadId?: string | undefined;
            bcc?: string[] | undefined;
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
            replyToThreadId?: string | undefined;
            bcc?: string[] | undefined;
            attachments?: {
                filename: string;
                mimeType: string;
                size: number;
                content: string;
            }[] | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            messageId: z.ZodString;
            threadId: z.ZodString;
            sentAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            threadId: string;
            messageId: string;
            sentAt: string;
        }, {
            success: boolean;
            threadId: string;
            messageId: string;
            sentAt: string;
        }>;
    };
    readonly searchEmails: {
        readonly method: "GET";
        readonly path: "/api/email/search";
        readonly request: z.ZodObject<{
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
            limit: z.ZodDefault<z.ZodNumber>;
            page: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            page: number;
            to?: string | undefined;
            subject?: string | undefined;
            query?: string | undefined;
            dateAfter?: string | undefined;
            dateBefore?: string | undefined;
            from?: string | undefined;
            labels?: string[] | undefined;
            hasAttachment?: boolean | undefined;
            isUnread?: boolean | undefined;
            isStarred?: boolean | undefined;
        }, {
            limit?: number | undefined;
            page?: number | undefined;
            to?: string | undefined;
            subject?: string | undefined;
            query?: string | undefined;
            dateAfter?: string | undefined;
            dateBefore?: string | undefined;
            from?: string | undefined;
            labels?: string[] | undefined;
            hasAttachment?: boolean | undefined;
            isUnread?: boolean | undefined;
            isStarred?: boolean | undefined;
        }>;
        readonly response: z.ZodObject<{
            emails: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                threadId: z.ZodString;
                direction: z.ZodEnum<["sent", "received"]>;
                from: z.ZodString;
                to: z.ZodArray<z.ZodString, "many">;
                cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                subject: z.ZodString;
                snippet: z.ZodString;
                body: z.ZodOptional<z.ZodString>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodString;
                    mimeType: z.ZodString;
                    size: z.ZodNumber;
                    url: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }>, "many">>;
                labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                isRead: z.ZodBoolean;
                isStarred: z.ZodBoolean;
                isImportant: z.ZodBoolean;
                date: z.ZodString;
                createdAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }>, "many">;
            total: z.ZodNumber;
            page: z.ZodNumber;
            limit: z.ZodNumber;
            hasMore: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            page: number;
            total: number;
            hasMore: boolean;
            emails: {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }[];
        }, {
            limit: number;
            page: number;
            total: number;
            hasMore: boolean;
            emails: {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }[];
        }>;
    };
    readonly getEmail: {
        readonly method: "GET";
        readonly path: "/api/email/:id";
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
            threadId: z.ZodString;
            direction: z.ZodEnum<["sent", "received"]>;
            from: z.ZodString;
            to: z.ZodArray<z.ZodString, "many">;
            cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            subject: z.ZodString;
            snippet: z.ZodString;
            body: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                filename: z.ZodString;
                mimeType: z.ZodString;
                size: z.ZodNumber;
                url: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                filename: string;
                mimeType: string;
                size: number;
                url?: string | undefined;
            }, {
                id: string;
                filename: string;
                mimeType: string;
                size: number;
                url?: string | undefined;
            }>, "many">>;
            labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            isRead: z.ZodBoolean;
            isStarred: z.ZodBoolean;
            isImportant: z.ZodBoolean;
            date: z.ZodString;
            createdAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            date: string;
            createdAt: string;
            externalId: string;
            to: string[];
            subject: string;
            snippet: string;
            from: string;
            isStarred: boolean;
            threadId: string;
            isRead: boolean;
            direction: "received" | "sent";
            isImportant: boolean;
            cc?: string[] | undefined;
            body?: string | undefined;
            labels?: string[] | undefined;
            attachments?: {
                id: string;
                filename: string;
                mimeType: string;
                size: number;
                url?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            date: string;
            createdAt: string;
            externalId: string;
            to: string[];
            subject: string;
            snippet: string;
            from: string;
            isStarred: boolean;
            threadId: string;
            isRead: boolean;
            direction: "received" | "sent";
            isImportant: boolean;
            cc?: string[] | undefined;
            body?: string | undefined;
            labels?: string[] | undefined;
            attachments?: {
                id: string;
                filename: string;
                mimeType: string;
                size: number;
                url?: string | undefined;
            }[] | undefined;
        }>;
    };
    readonly getThread: {
        readonly method: "GET";
        readonly path: "/api/email/threads/:threadId";
        readonly request: z.ZodObject<{
            threadId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            threadId: string;
        }, {
            threadId: string;
        }>;
        readonly response: z.ZodObject<{
            threadId: z.ZodString;
            subject: z.ZodString;
            participants: z.ZodArray<z.ZodString, "many">;
            messageCount: z.ZodNumber;
            emails: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                threadId: z.ZodString;
                direction: z.ZodEnum<["sent", "received"]>;
                from: z.ZodString;
                to: z.ZodArray<z.ZodString, "many">;
                cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                subject: z.ZodString;
                snippet: z.ZodString;
                body: z.ZodOptional<z.ZodString>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodString;
                    mimeType: z.ZodString;
                    size: z.ZodNumber;
                    url: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }>, "many">>;
                labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                isRead: z.ZodBoolean;
                isStarred: z.ZodBoolean;
                isImportant: z.ZodBoolean;
                date: z.ZodString;
                createdAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }>, "many">;
            latestDate: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            participants: string[];
            subject: string;
            threadId: string;
            emails: {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }[];
            messageCount: number;
            latestDate: string;
        }, {
            participants: string[];
            subject: string;
            threadId: string;
            emails: {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }[];
            messageCount: number;
            latestDate: string;
        }>;
    };
    readonly updateEmail: {
        readonly method: "PUT";
        readonly path: "/api/email/:id";
        readonly request: z.ZodObject<{
            id: z.ZodString;
            isRead: z.ZodOptional<z.ZodBoolean>;
            isStarred: z.ZodOptional<z.ZodBoolean>;
            labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            labels?: string[] | undefined;
            isStarred?: boolean | undefined;
            isRead?: boolean | undefined;
        }, {
            id: string;
            labels?: string[] | undefined;
            isStarred?: boolean | undefined;
            isRead?: boolean | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            email: z.ZodObject<{
                id: z.ZodString;
                externalId: z.ZodString;
                threadId: z.ZodString;
                direction: z.ZodEnum<["sent", "received"]>;
                from: z.ZodString;
                to: z.ZodArray<z.ZodString, "many">;
                cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                subject: z.ZodString;
                snippet: z.ZodString;
                body: z.ZodOptional<z.ZodString>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodString;
                    mimeType: z.ZodString;
                    size: z.ZodNumber;
                    url: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }>, "many">>;
                labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                isRead: z.ZodBoolean;
                isStarred: z.ZodBoolean;
                isImportant: z.ZodBoolean;
                date: z.ZodString;
                createdAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            email: {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            };
            success: boolean;
        }, {
            email: {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            };
            success: boolean;
        }>;
    };
    readonly archiveEmail: {
        readonly method: "POST";
        readonly path: "/api/email/:id/archive";
        readonly request: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            archivedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            archivedAt: string;
        }, {
            success: boolean;
            archivedAt: string;
        }>;
    };
    readonly syncEmails: {
        readonly method: "POST";
        readonly path: "/api/email/sync";
        readonly request: z.ZodObject<{
            provider: z.ZodEnum<["gmail", "outlook"]>;
            fullSync: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            provider: "gmail" | "outlook";
            fullSync: boolean;
        }, {
            provider: "gmail" | "outlook";
            fullSync?: boolean | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            newEmails: z.ZodNumber;
            updatedEmails: z.ZodNumber;
            syncedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            newEmails: number;
            updatedEmails: number;
            syncedAt: string;
        }, {
            success: boolean;
            newEmails: number;
            updatedEmails: number;
            syncedAt: string;
        }>;
    };
};
//# sourceMappingURL=email.contracts.d.ts.map