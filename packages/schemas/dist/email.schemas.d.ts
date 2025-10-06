/**
 * Email domain validation schemas
 * Runtime validation for all email-related operations
 */
import { z } from 'zod';
export declare const EmailContactSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name?: string | undefined;
    avatar?: string | undefined;
}, {
    email: string;
    name?: string | undefined;
    avatar?: string | undefined;
}>;
export declare const EmailBodySchema: z.ZodObject<{
    text: z.ZodString;
    html: z.ZodOptional<z.ZodString>;
    markdown: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    html?: string | undefined;
    markdown?: string | undefined;
}, {
    text: string;
    html?: string | undefined;
    markdown?: string | undefined;
}>;
export declare const AttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    url: z.ZodOptional<z.ZodString>;
    inline: z.ZodDefault<z.ZodBoolean>;
    contentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    inline: boolean;
    url?: string | undefined;
    contentId?: string | undefined;
}, {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url?: string | undefined;
    inline?: boolean | undefined;
    contentId?: string | undefined;
}>;
export declare const SendEmailParamsSchema: z.ZodEffects<z.ZodObject<{
    userId: z.ZodString;
    from: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>;
    to: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>, "many">>;
    subject: z.ZodString;
    body: z.ZodObject<{
        text: z.ZodString;
        html: z.ZodOptional<z.ZodString>;
        markdown: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    }, {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    }>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodOptional<z.ZodString>;
        inline: z.ZodDefault<z.ZodBoolean>;
        contentId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        inline: boolean;
        url?: string | undefined;
        contentId?: string | undefined;
    }, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
        inline?: boolean | undefined;
        contentId?: string | undefined;
    }>, "many">>;
    provider: z.ZodEnum<["gmail", "outlook", "icloud", "custom"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    replyTo: z.ZodOptional<z.ZodString>;
    threadId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    from: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    };
    to: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[];
    subject: string;
    body: {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    };
    provider: "gmail" | "outlook" | "icloud" | "custom";
    cc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    bcc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        inline: boolean;
        url?: string | undefined;
        contentId?: string | undefined;
    }[] | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    replyTo?: string | undefined;
    threadId?: string | undefined;
}, {
    userId: string;
    from: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    };
    to: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[];
    subject: string;
    body: {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    };
    provider: "gmail" | "outlook" | "icloud" | "custom";
    cc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    bcc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
        inline?: boolean | undefined;
        contentId?: string | undefined;
    }[] | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    replyTo?: string | undefined;
    threadId?: string | undefined;
}>, {
    userId: string;
    from: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    };
    to: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[];
    subject: string;
    body: {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    };
    provider: "gmail" | "outlook" | "icloud" | "custom";
    cc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    bcc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        inline: boolean;
        url?: string | undefined;
        contentId?: string | undefined;
    }[] | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    replyTo?: string | undefined;
    threadId?: string | undefined;
}, {
    userId: string;
    from: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    };
    to: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[];
    subject: string;
    body: {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    };
    provider: "gmail" | "outlook" | "icloud" | "custom";
    cc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    bcc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
        inline?: boolean | undefined;
        contentId?: string | undefined;
    }[] | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    replyTo?: string | undefined;
    threadId?: string | undefined;
}>;
export declare const DraftEmailParamsSchema: z.ZodObject<Omit<{
    userId: z.ZodString;
    from: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>;
    to: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>, "many">>;
    subject: z.ZodString;
    body: z.ZodObject<{
        text: z.ZodString;
        html: z.ZodOptional<z.ZodString>;
        markdown: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    }, {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    }>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodOptional<z.ZodString>;
        inline: z.ZodDefault<z.ZodBoolean>;
        contentId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        inline: boolean;
        url?: string | undefined;
        contentId?: string | undefined;
    }, {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
        inline?: boolean | undefined;
        contentId?: string | undefined;
    }>, "many">>;
    provider: z.ZodEnum<["gmail", "outlook", "icloud", "custom"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    replyTo: z.ZodOptional<z.ZodString>;
    threadId: z.ZodOptional<z.ZodString>;
}, "userId" | "from" | "provider">, "strip", z.ZodTypeAny, {
    to: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[];
    subject: string;
    body: {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    };
    cc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    bcc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        inline: boolean;
        url?: string | undefined;
        contentId?: string | undefined;
    }[] | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    replyTo?: string | undefined;
    threadId?: string | undefined;
}, {
    to: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[];
    subject: string;
    body: {
        text: string;
        html?: string | undefined;
        markdown?: string | undefined;
    };
    cc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    bcc?: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }[] | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
        inline?: boolean | undefined;
        contentId?: string | undefined;
    }[] | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    replyTo?: string | undefined;
    threadId?: string | undefined;
}>;
export declare const EmailQuerySchema: z.ZodObject<{
    userId: z.ZodString;
    text: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    hasAttachment: z.ZodOptional<z.ZodBoolean>;
    isUnread: z.ZodOptional<z.ZodBoolean>;
    isStarred: z.ZodOptional<z.ZodBoolean>;
    category: z.ZodOptional<z.ZodEnum<["personal", "work", "newsletter", "promotional", "social", "updates", "forums", "important", "spam"]>>;
    dateRange: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        start: z.ZodEffects<z.ZodNumber, number, number>;
        end: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    userId: string;
    text?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    subject?: string | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
    isStarred?: boolean | undefined;
    category?: "personal" | "work" | "newsletter" | "promotional" | "social" | "updates" | "forums" | "important" | "spam" | undefined;
    dateRange?: {
        start: number;
        end: number;
    } | undefined;
}, {
    userId: string;
    limit?: number | undefined;
    offset?: number | undefined;
    text?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    subject?: string | undefined;
    hasAttachment?: boolean | undefined;
    isUnread?: boolean | undefined;
    isStarred?: boolean | undefined;
    category?: "personal" | "work" | "newsletter" | "promotional" | "social" | "updates" | "forums" | "important" | "spam" | undefined;
    dateRange?: {
        start: number;
        end: number;
    } | undefined;
}>;
export declare const DraftContextSchema: z.ZodObject<{
    userId: z.ZodString;
    recipient: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    }>;
    subject: z.ZodOptional<z.ZodString>;
    context: z.ZodString;
    tone: z.ZodOptional<z.ZodEnum<["formal", "casual", "friendly", "professional"]>>;
    length: z.ZodOptional<z.ZodEnum<["brief", "normal", "detailed"]>>;
    previousEmails: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    recipient: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    };
    context: string;
    length?: "normal" | "brief" | "detailed" | undefined;
    subject?: string | undefined;
    tone?: "formal" | "casual" | "friendly" | "professional" | undefined;
    previousEmails?: unknown[] | undefined;
}, {
    userId: string;
    recipient: {
        email: string;
        name?: string | undefined;
        avatar?: string | undefined;
    };
    context: string;
    length?: "normal" | "brief" | "detailed" | undefined;
    subject?: string | undefined;
    tone?: "formal" | "casual" | "friendly" | "professional" | undefined;
    previousEmails?: unknown[] | undefined;
}>;
export declare const EmailTemplateSchema: z.ZodObject<{
    templateId: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    body: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["text", "date", "number", "email"]>;
        defaultValue: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "number" | "email" | "text" | "date";
        name: string;
        required: boolean;
        defaultValue?: string | undefined;
    }, {
        type: "number" | "email" | "text" | "date";
        name: string;
        defaultValue?: string | undefined;
        required?: boolean | undefined;
    }>, "many">>;
    category: z.ZodString;
    usageCount: z.ZodDefault<z.ZodNumber>;
    lastUsed: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    createdAt: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    userId: string;
    subject: string;
    body: string;
    category: string;
    usageCount: number;
    templateId?: string | undefined;
    description?: string | undefined;
    variables?: {
        type: "number" | "email" | "text" | "date";
        name: string;
        required: boolean;
        defaultValue?: string | undefined;
    }[] | undefined;
    lastUsed?: number | undefined;
    createdAt?: number | undefined;
}, {
    name: string;
    userId: string;
    subject: string;
    body: string;
    category: string;
    templateId?: string | undefined;
    description?: string | undefined;
    variables?: {
        type: "number" | "email" | "text" | "date";
        name: string;
        defaultValue?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
    usageCount?: number | undefined;
    lastUsed?: number | undefined;
    createdAt?: number | undefined;
}>;
export declare const EmailOperationSchema: z.ZodObject<{
    type: z.ZodEnum<["markAsRead", "markAsUnread", "star", "unstar", "archive", "delete", "label"]>;
    emailIds: z.ZodArray<z.ZodString, "many">;
    params: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "markAsRead" | "markAsUnread" | "star" | "unstar" | "archive" | "delete" | "label";
    emailIds: string[];
    params?: unknown;
}, {
    type: "markAsRead" | "markAsUnread" | "star" | "unstar" | "archive" | "delete" | "label";
    emailIds: string[];
    params?: unknown;
}>;
export declare const BatchEmailOperationsSchema: z.ZodArray<z.ZodObject<{
    type: z.ZodEnum<["markAsRead", "markAsUnread", "star", "unstar", "archive", "delete", "label"]>;
    emailIds: z.ZodArray<z.ZodString, "many">;
    params: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "markAsRead" | "markAsUnread" | "star" | "unstar" | "archive" | "delete" | "label";
    emailIds: string[];
    params?: unknown;
}, {
    type: "markAsRead" | "markAsUnread" | "star" | "unstar" | "archive" | "delete" | "label";
    emailIds: string[];
    params?: unknown;
}>, "many">;
//# sourceMappingURL=email.schemas.d.ts.map