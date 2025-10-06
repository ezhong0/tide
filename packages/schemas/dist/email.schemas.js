"use strict";
/**
 * Email domain validation schemas
 * Runtime validation for all email-related operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchEmailOperationsSchema = exports.EmailOperationSchema = exports.EmailTemplateSchema = exports.DraftContextSchema = exports.EmailQuerySchema = exports.DraftEmailParamsSchema = exports.SendEmailParamsSchema = exports.AttachmentSchema = exports.EmailBodySchema = exports.EmailContactSchema = void 0;
const zod_1 = require("zod");
const primitives_schemas_1 = require("./primitives.schemas");
// Email contact with optional name
exports.EmailContactSchema = zod_1.z.object({
    email: primitives_schemas_1.EmailSchema,
    name: zod_1.z.string().min(1).max(100).optional(),
    avatar: zod_1.z.string().url().optional()
});
// Email body with multiple formats
exports.EmailBodySchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Email body cannot be empty'),
    html: zod_1.z.string().optional(),
    markdown: zod_1.z.string().optional()
});
// Attachment validation
exports.AttachmentSchema = zod_1.z.object({
    id: primitives_schemas_1.UUIDSchema,
    filename: zod_1.z.string().min(1).max(255),
    mimeType: zod_1.z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'Invalid MIME type'),
    size: zod_1.z.number().int().positive().max(25 * 1024 * 1024, 'Attachment too large (max 25MB)'),
    url: zod_1.z.string().url().optional(),
    inline: zod_1.z.boolean().default(false),
    contentId: zod_1.z.string().optional()
});
// Base send email parameters (without refinement)
const SendEmailParamsBase = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    from: exports.EmailContactSchema,
    to: zod_1.z.array(exports.EmailContactSchema).min(1, 'At least one recipient required'),
    cc: zod_1.z.array(exports.EmailContactSchema).optional(),
    bcc: zod_1.z.array(exports.EmailContactSchema).optional(),
    subject: zod_1.z.string()
        .min(1, 'Subject cannot be empty')
        .max(998, 'Subject too long'),
    body: exports.EmailBodySchema,
    attachments: zod_1.z.array(exports.AttachmentSchema).max(10, 'Too many attachments').optional(),
    provider: primitives_schemas_1.EmailProviderSchema,
    priority: primitives_schemas_1.PrioritySchema.optional(),
    replyTo: primitives_schemas_1.UUIDSchema.optional(),
    threadId: primitives_schemas_1.UUIDSchema.optional()
});
// Send email parameters - the most critical validation
exports.SendEmailParamsSchema = SendEmailParamsBase.refine(data => {
    // Validate total recipients doesn't exceed limit
    const totalRecipients = data.to.length +
        (data.cc?.length || 0) +
        (data.bcc?.length || 0);
    return totalRecipients <= 100;
}, { message: 'Total recipients cannot exceed 100' });
// Draft email parameters
exports.DraftEmailParamsSchema = SendEmailParamsBase.omit({
    userId: true,
    from: true,
    provider: true
});
// Email search query
exports.EmailQuerySchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    text: zod_1.z.string().min(1).max(500).optional(),
    from: primitives_schemas_1.EmailSchema.optional(),
    to: primitives_schemas_1.EmailSchema.optional(),
    subject: zod_1.z.string().max(200).optional(),
    hasAttachment: zod_1.z.boolean().optional(),
    isUnread: zod_1.z.boolean().optional(),
    isStarred: zod_1.z.boolean().optional(),
    category: zod_1.z.enum(['personal', 'work', 'newsletter', 'promotional', 'social', 'updates', 'forums', 'important', 'spam']).optional(),
    dateRange: zod_1.z.object({
        start: primitives_schemas_1.TimestampSchema,
        end: primitives_schemas_1.TimestampSchema
    }).refine(data => data.end > data.start, 'Invalid date range').optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(50),
    offset: zod_1.z.number().int().min(0).default(0)
});
// Draft context for AI suggestions
exports.DraftContextSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    recipient: exports.EmailContactSchema,
    subject: zod_1.z.string().max(200).optional(),
    context: zod_1.z.string().min(1).max(2000),
    tone: zod_1.z.enum(['formal', 'casual', 'friendly', 'professional']).optional(),
    length: zod_1.z.enum(['brief', 'normal', 'detailed']).optional(),
    previousEmails: zod_1.z.array(zod_1.z.unknown()).max(10).optional() // Would be EmailDomain[]
});
// Email template
exports.EmailTemplateSchema = zod_1.z.object({
    templateId: primitives_schemas_1.UUIDSchema.optional(),
    userId: primitives_schemas_1.UUIDSchema,
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    subject: zod_1.z.string().min(1).max(200),
    body: zod_1.z.string().min(1).max(10000),
    variables: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid variable name'),
        type: zod_1.z.enum(['text', 'date', 'number', 'email']),
        defaultValue: zod_1.z.string().optional(),
        required: zod_1.z.boolean().default(true)
    })).optional(),
    category: zod_1.z.string().max(50),
    usageCount: zod_1.z.number().int().min(0).default(0),
    lastUsed: primitives_schemas_1.TimestampSchema.optional(),
    createdAt: primitives_schemas_1.TimestampSchema.optional()
});
// Batch email operations
exports.EmailOperationSchema = zod_1.z.object({
    type: zod_1.z.enum(['markAsRead', 'markAsUnread', 'star', 'unstar', 'archive', 'delete', 'label']),
    emailIds: zod_1.z.array(primitives_schemas_1.UUIDSchema).min(1).max(100),
    params: zod_1.z.unknown().optional()
});
exports.BatchEmailOperationsSchema = zod_1.z.array(exports.EmailOperationSchema).min(1).max(50);
//# sourceMappingURL=email.schemas.js.map