"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailFilterSchema = exports.EmailDraftRequestSchema = exports.EmailTriageResultSchema = exports.SendEmailSchema = exports.EmailSchema = exports.EmailAttachmentSchema = exports.EmailPrioritySchema = exports.ContactSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
/**
 * Contact schema
 */
exports.ContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    email: base_schema_1.EmailAddressSchema,
});
/**
 * Email priority schema
 */
exports.EmailPrioritySchema = zod_1.z.enum(['low', 'normal', 'high', 'urgent']);
/**
 * Email attachment schema
 */
exports.EmailAttachmentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    filename: zod_1.z.string(),
    mimeType: zod_1.z.string(),
    size: zod_1.z.number().int().positive(),
    url: zod_1.z.string().url().optional(),
});
/**
 * Email schema
 */
exports.EmailSchema = zod_1.z.object({
    id: zod_1.z.string(),
    from: exports.ContactSchema,
    to: zod_1.z.array(exports.ContactSchema).min(1),
    cc: zod_1.z.array(exports.ContactSchema).optional(),
    bcc: zod_1.z.array(exports.ContactSchema).optional(),
    subject: zod_1.z.string().max(500),
    body: zod_1.z.string(),
    htmlBody: zod_1.z.string().optional(),
    priority: exports.EmailPrioritySchema.optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    timestamp: zod_1.z.number().int().positive(),
    threadId: zod_1.z.string().optional(),
    inReplyTo: zod_1.z.string().optional(),
    attachments: zod_1.z.array(exports.EmailAttachmentSchema).optional(),
    aiSummary: zod_1.z.string().optional(),
    aiCategory: zod_1.z.string().optional(),
    read: zod_1.z.boolean().default(false),
    starred: zod_1.z.boolean().default(false),
    archived: zod_1.z.boolean().default(false),
});
/**
 * Send email schema
 */
exports.SendEmailSchema = zod_1.z.object({
    to: zod_1.z.array(exports.ContactSchema).min(1),
    cc: zod_1.z.array(exports.ContactSchema).optional(),
    bcc: zod_1.z.array(exports.ContactSchema).optional(),
    subject: zod_1.z.string().min(1).max(500),
    body: zod_1.z.string().min(1),
    htmlBody: zod_1.z.string().optional(),
    priority: exports.EmailPrioritySchema.optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        content: zod_1.z.string(), // Base64 encoded
        mimeType: zod_1.z.string(),
    })).optional(),
    inReplyTo: zod_1.z.string().optional(),
    scheduledAt: zod_1.z.date().optional(),
});
/**
 * Email triage result schema
 */
exports.EmailTriageResultSchema = zod_1.z.object({
    emailId: zod_1.z.string(),
    priority: exports.EmailPrioritySchema,
    category: zod_1.z.string(),
    summary: zod_1.z.string(),
    suggestedActions: zod_1.z.array(zod_1.z.string()),
    requiresResponse: zod_1.z.boolean(),
    sentiment: zod_1.z.enum(['positive', 'neutral', 'negative']).optional(),
    urgency: zod_1.z.number().min(0).max(1),
});
/**
 * Email draft request schema
 */
exports.EmailDraftRequestSchema = zod_1.z.object({
    context: zod_1.z.string(),
    tone: zod_1.z.enum(['formal', 'casual', 'friendly', 'professional']).default('professional'),
    length: zod_1.z.enum(['brief', 'medium', 'detailed']).default('medium'),
    includeSignature: zod_1.z.boolean().default(true),
    keyPoints: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Email filter schema
 */
exports.EmailFilterSchema = zod_1.z.object({
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    priority: exports.EmailPrioritySchema.optional(),
    unreadOnly: zod_1.z.boolean().optional(),
    starredOnly: zod_1.z.boolean().optional(),
    hasAttachments: zod_1.z.boolean().optional(),
    from: base_schema_1.EmailAddressSchema.optional(),
    search: zod_1.z.string().optional(),
    startDate: zod_1.z.date().optional(),
    endDate: zod_1.z.date().optional(),
});
