import { z } from 'zod';
/**
 * Contact schema
 */
export declare const ContactSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
}, {
    email: string;
    name: string;
}>;
export type Contact = z.infer<typeof ContactSchema>;
/**
 * Email priority schema
 */
export declare const EmailPrioritySchema: z.ZodEnum<["low", "normal", "high", "urgent"]>;
/**
 * Email attachment schema
 */
export declare const EmailAttachmentSchema: z.ZodObject<{
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
}>;
/**
 * Email schema
 */
export declare const EmailSchema: z.ZodObject<{
    id: z.ZodString;
    from: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>;
    to: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
    subject: z.ZodString;
    body: z.ZodString;
    htmlBody: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    timestamp: z.ZodNumber;
    threadId: z.ZodOptional<z.ZodString>;
    inReplyTo: z.ZodOptional<z.ZodString>;
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
    aiSummary: z.ZodOptional<z.ZodString>;
    aiCategory: z.ZodOptional<z.ZodString>;
    read: z.ZodDefault<z.ZodBoolean>;
    starred: z.ZodDefault<z.ZodBoolean>;
    archived: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    id: string;
    from: {
        email: string;
        name: string;
    };
    to: {
        email: string;
        name: string;
    }[];
    subject: string;
    body: string;
    read: boolean;
    starred: boolean;
    archived: boolean;
    cc?: {
        email: string;
        name: string;
    }[] | undefined;
    bcc?: {
        email: string;
        name: string;
    }[] | undefined;
    htmlBody?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    labels?: string[] | undefined;
    threadId?: string | undefined;
    inReplyTo?: string | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
    aiSummary?: string | undefined;
    aiCategory?: string | undefined;
}, {
    timestamp: number;
    id: string;
    from: {
        email: string;
        name: string;
    };
    to: {
        email: string;
        name: string;
    }[];
    subject: string;
    body: string;
    cc?: {
        email: string;
        name: string;
    }[] | undefined;
    bcc?: {
        email: string;
        name: string;
    }[] | undefined;
    htmlBody?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    labels?: string[] | undefined;
    threadId?: string | undefined;
    inReplyTo?: string | undefined;
    attachments?: {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
    aiSummary?: string | undefined;
    aiCategory?: string | undefined;
    read?: boolean | undefined;
    starred?: boolean | undefined;
    archived?: boolean | undefined;
}>;
export type Email = z.infer<typeof EmailSchema>;
/**
 * Send email schema
 */
export declare const SendEmailSchema: z.ZodObject<{
    to: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
    }, {
        email: string;
        name: string;
    }>, "many">>;
    subject: z.ZodString;
    body: z.ZodString;
    htmlBody: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        filename: string;
        mimeType: string;
    }, {
        content: string;
        filename: string;
        mimeType: string;
    }>, "many">>;
    inReplyTo: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    to: {
        email: string;
        name: string;
    }[];
    subject: string;
    body: string;
    cc?: {
        email: string;
        name: string;
    }[] | undefined;
    bcc?: {
        email: string;
        name: string;
    }[] | undefined;
    htmlBody?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    inReplyTo?: string | undefined;
    attachments?: {
        content: string;
        filename: string;
        mimeType: string;
    }[] | undefined;
    scheduledAt?: Date | undefined;
}, {
    to: {
        email: string;
        name: string;
    }[];
    subject: string;
    body: string;
    cc?: {
        email: string;
        name: string;
    }[] | undefined;
    bcc?: {
        email: string;
        name: string;
    }[] | undefined;
    htmlBody?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    inReplyTo?: string | undefined;
    attachments?: {
        content: string;
        filename: string;
        mimeType: string;
    }[] | undefined;
    scheduledAt?: Date | undefined;
}>;
export type SendEmail = z.infer<typeof SendEmailSchema>;
/**
 * Email triage result schema
 */
export declare const EmailTriageResultSchema: z.ZodObject<{
    emailId: z.ZodString;
    priority: z.ZodEnum<["low", "normal", "high", "urgent"]>;
    category: z.ZodString;
    summary: z.ZodString;
    suggestedActions: z.ZodArray<z.ZodString, "many">;
    requiresResponse: z.ZodBoolean;
    sentiment: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative"]>>;
    urgency: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    suggestedActions: string[];
    priority: "low" | "normal" | "high" | "urgent";
    emailId: string;
    category: string;
    summary: string;
    requiresResponse: boolean;
    urgency: number;
    sentiment?: "positive" | "neutral" | "negative" | undefined;
}, {
    suggestedActions: string[];
    priority: "low" | "normal" | "high" | "urgent";
    emailId: string;
    category: string;
    summary: string;
    requiresResponse: boolean;
    urgency: number;
    sentiment?: "positive" | "neutral" | "negative" | undefined;
}>;
export type EmailTriageResult = z.infer<typeof EmailTriageResultSchema>;
/**
 * Email draft request schema
 */
export declare const EmailDraftRequestSchema: z.ZodObject<{
    context: z.ZodString;
    tone: z.ZodDefault<z.ZodEnum<["formal", "casual", "friendly", "professional"]>>;
    length: z.ZodDefault<z.ZodEnum<["brief", "medium", "detailed"]>>;
    includeSignature: z.ZodDefault<z.ZodBoolean>;
    keyPoints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    length: "brief" | "medium" | "detailed";
    context: string;
    tone: "professional" | "formal" | "casual" | "friendly";
    includeSignature: boolean;
    keyPoints?: string[] | undefined;
}, {
    context: string;
    length?: "brief" | "medium" | "detailed" | undefined;
    tone?: "professional" | "formal" | "casual" | "friendly" | undefined;
    includeSignature?: boolean | undefined;
    keyPoints?: string[] | undefined;
}>;
export type EmailDraftRequest = z.infer<typeof EmailDraftRequestSchema>;
/**
 * Email filter schema
 */
export declare const EmailFilterSchema: z.ZodObject<{
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    unreadOnly: z.ZodOptional<z.ZodBoolean>;
    starredOnly: z.ZodOptional<z.ZodBoolean>;
    hasAttachments: z.ZodOptional<z.ZodBoolean>;
    from: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    from?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    labels?: string[] | undefined;
    unreadOnly?: boolean | undefined;
    starredOnly?: boolean | undefined;
    hasAttachments?: boolean | undefined;
    search?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}, {
    from?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    labels?: string[] | undefined;
    unreadOnly?: boolean | undefined;
    starredOnly?: boolean | undefined;
    hasAttachments?: boolean | undefined;
    search?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}>;
export type EmailFilter = z.infer<typeof EmailFilterSchema>;
