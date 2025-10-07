import { z } from 'zod';
import { EmailSchema as EmailAddressSchema } from './base.schema';

/**
 * Contact schema
 */
export const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: EmailAddressSchema,
});

export type Contact = z.infer<typeof ContactSchema>;

/**
 * Email priority schema
 */
export const EmailPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

/**
 * Email attachment schema
 */
export const EmailAttachmentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url().optional(),
});

/**
 * Email schema
 */
export const EmailSchema = z.object({
  id: z.string(),
  from: ContactSchema,
  to: z.array(ContactSchema).min(1),
  cc: z.array(ContactSchema).optional(),
  bcc: z.array(ContactSchema).optional(),
  subject: z.string().max(500),
  body: z.string(),
  htmlBody: z.string().optional(),
  priority: EmailPrioritySchema.optional(),
  labels: z.array(z.string()).optional(),
  timestamp: z.number().int().positive(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  aiSummary: z.string().optional(),
  aiCategory: z.string().optional(),
  read: z.boolean().default(false),
  starred: z.boolean().default(false),
  archived: z.boolean().default(false),
});

export type Email = z.infer<typeof EmailSchema>;

/**
 * Send email schema
 */
export const SendEmailSchema = z.object({
  to: z.array(ContactSchema).min(1),
  cc: z.array(ContactSchema).optional(),
  bcc: z.array(ContactSchema).optional(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  htmlBody: z.string().optional(),
  priority: EmailPrioritySchema.optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // Base64 encoded
    mimeType: z.string(),
  })).optional(),
  inReplyTo: z.string().optional(),
  scheduledAt: z.date().optional(),
});

export type SendEmail = z.infer<typeof SendEmailSchema>;

/**
 * Email triage result schema
 */
export const EmailTriageResultSchema = z.object({
  emailId: z.string(),
  priority: EmailPrioritySchema,
  category: z.string(),
  summary: z.string(),
  suggestedActions: z.array(z.string()),
  requiresResponse: z.boolean(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  urgency: z.number().min(0).max(1),
});

export type EmailTriageResult = z.infer<typeof EmailTriageResultSchema>;

/**
 * Email draft request schema
 */
export const EmailDraftRequestSchema = z.object({
  context: z.string(),
  tone: z.enum(['formal', 'casual', 'friendly', 'professional']).default('professional'),
  length: z.enum(['brief', 'medium', 'detailed']).default('medium'),
  includeSignature: z.boolean().default(true),
  keyPoints: z.array(z.string()).optional(),
});

export type EmailDraftRequest = z.infer<typeof EmailDraftRequestSchema>;

/**
 * Email filter schema
 */
export const EmailFilterSchema = z.object({
  labels: z.array(z.string()).optional(),
  priority: EmailPrioritySchema.optional(),
  unreadOnly: z.boolean().optional(),
  starredOnly: z.boolean().optional(),
  hasAttachments: z.boolean().optional(),
  from: EmailAddressSchema.optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type EmailFilter = z.infer<typeof EmailFilterSchema>;
