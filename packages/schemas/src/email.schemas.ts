/**
 * Email domain validation schemas
 * Runtime validation for all email-related operations
 */

import { z } from 'zod';
import {
  EmailSchema,
  UUIDSchema,
  TimestampSchema,
  PrioritySchema,
  EmailProviderSchema
} from './primitives.schemas';

// Email contact with optional name
export const EmailContactSchema = z.object({
  email: EmailSchema,
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional()
});

// Email body with multiple formats
export const EmailBodySchema = z.object({
  text: z.string().min(1, 'Email body cannot be empty'),
  html: z.string().optional(),
  markdown: z.string().optional()
});

// Attachment validation
export const AttachmentSchema = z.object({
  id: UUIDSchema,
  filename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'Invalid MIME type'),
  size: z.number().int().positive().max(25 * 1024 * 1024, 'Attachment too large (max 25MB)'),
  url: z.string().url().optional(),
  inline: z.boolean().default(false),
  contentId: z.string().optional()
});

// Send email parameters - the most critical validation
export const SendEmailParamsSchema = z.object({
  userId: UUIDSchema,
  from: EmailContactSchema,
  to: z.array(EmailContactSchema).min(1, 'At least one recipient required'),
  cc: z.array(EmailContactSchema).optional(),
  bcc: z.array(EmailContactSchema).optional(),
  subject: z.string()
    .min(1, 'Subject cannot be empty')
    .max(998, 'Subject too long'),
  body: EmailBodySchema,
  attachments: z.array(AttachmentSchema).max(10, 'Too many attachments').optional(),
  provider: EmailProviderSchema,
  priority: PrioritySchema.optional(),
  replyTo: UUIDSchema.optional(),
  threadId: UUIDSchema.optional()
}).refine(
  data => {
    // Validate total recipients doesn't exceed limit
    const totalRecipients =
      data.to.length +
      (data.cc?.length || 0) +
      (data.bcc?.length || 0);
    return totalRecipients <= 100;
  },
  { message: 'Total recipients cannot exceed 100' }
);

// Draft email parameters
export const DraftEmailParamsSchema = SendEmailParamsSchema.omit({
  userId: true,
  from: true,
  provider: true
});

// Email search query
export const EmailQuerySchema = z.object({
  userId: UUIDSchema,
  text: z.string().min(1).max(500).optional(),
  from: EmailSchema.optional(),
  to: EmailSchema.optional(),
  subject: z.string().max(200).optional(),
  hasAttachment: z.boolean().optional(),
  isUnread: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  category: z.enum(['personal', 'work', 'newsletter', 'promotional', 'social', 'updates', 'forums', 'important', 'spam']).optional(),
  dateRange: z.object({
    start: TimestampSchema,
    end: TimestampSchema
  }).refine(data => data.end > data.start, 'Invalid date range').optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
});

// Draft context for AI suggestions
export const DraftContextSchema = z.object({
  userId: UUIDSchema,
  recipient: EmailContactSchema,
  subject: z.string().max(200).optional(),
  context: z.string().min(1).max(2000),
  tone: z.enum(['formal', 'casual', 'friendly', 'professional']).optional(),
  length: z.enum(['brief', 'normal', 'detailed']).optional(),
  previousEmails: z.array(z.unknown()).max(10).optional() // Would be EmailDomain[]
});

// Email template
export const EmailTemplateSchema = z.object({
  templateId: UUIDSchema.optional(),
  userId: UUIDSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  variables: z.array(z.object({
    name: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid variable name'),
    type: z.enum(['text', 'date', 'number', 'email']),
    defaultValue: z.string().optional(),
    required: z.boolean().default(true)
  })).optional(),
  category: z.string().max(50),
  usageCount: z.number().int().min(0).default(0),
  lastUsed: TimestampSchema.optional(),
  createdAt: TimestampSchema.optional()
});

// Batch email operations
export const EmailOperationSchema = z.object({
  type: z.enum(['markAsRead', 'markAsUnread', 'star', 'unstar', 'archive', 'delete', 'label']),
  emailIds: z.array(UUIDSchema).min(1).max(100),
  params: z.unknown().optional()
});

export const BatchEmailOperationsSchema = z.array(EmailOperationSchema).min(1).max(50);