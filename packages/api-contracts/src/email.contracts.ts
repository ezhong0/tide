/**
 * Email API Contracts
 *
 * Zod schemas for all email-related API endpoints
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

export const SendEmailRequestSchema = z.object({
  to: z.array(z.string().email()).min(1).max(50),
  cc: z.array(z.string().email()).max(50).optional(),
  bcc: z.array(z.string().email()).max(50).optional(),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(50000),
  replyToThreadId: z.string().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
        size: z.number().int().positive(),
        content: z.string(), // base64 encoded
      })
    )
    .max(10)
    .optional(),
});

export const SearchEmailsRequestSchema = z.object({
  query: z.string().max(500).optional(),
  from: z.string().email().optional(),
  to: z.string().email().optional(),
  subject: z.string().max(300).optional(),
  dateAfter: z.string().datetime().optional(),
  dateBefore: z.string().datetime().optional(),
  hasAttachment: z.boolean().optional(),
  isUnread: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  labels: z.array(z.string()).max(10).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  page: z.number().int().min(1).default(1),
});

export const GetEmailRequestSchema = z.object({
  id: z.string().uuid(),
});

export const GetThreadRequestSchema = z.object({
  threadId: z.string(),
});

export const UpdateEmailRequestSchema = z.object({
  id: z.string().uuid(),
  isRead: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

export const ArchiveEmailRequestSchema = z.object({
  id: z.string().uuid(),
});

export const SyncEmailsRequestSchema = z.object({
  provider: z.enum(['gmail', 'outlook']),
  fullSync: z.boolean().default(false),
});

// ============================================================================
// Response Schemas
// ============================================================================

export const SendEmailResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string(),
  threadId: z.string(),
  sentAt: z.string().datetime(),
});

export const EmailSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  threadId: z.string(),
  direction: z.enum(['sent', 'received']),
  from: z.string(),
  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  subject: z.string(),
  snippet: z.string(),
  body: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        mimeType: z.string(),
        size: z.number(),
        url: z.string().url().optional(),
      })
    )
    .optional(),
  labels: z.array(z.string()).optional(),
  isRead: z.boolean(),
  isStarred: z.boolean(),
  isImportant: z.boolean(),
  date: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const SearchEmailsResponseSchema = z.object({
  emails: z.array(EmailSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});

export const GetEmailResponseSchema = EmailSchema;

export const ThreadEmailSchema = EmailSchema;

export const GetThreadResponseSchema = z.object({
  threadId: z.string(),
  subject: z.string(),
  participants: z.array(z.string()),
  messageCount: z.number().int().nonnegative(),
  emails: z.array(ThreadEmailSchema),
  latestDate: z.string().datetime(),
});

export const UpdateEmailResponseSchema = z.object({
  success: z.boolean(),
  email: EmailSchema,
});

export const ArchiveEmailResponseSchema = z.object({
  success: z.boolean(),
  archivedAt: z.string().datetime(),
});

export const SyncEmailsResponseSchema = z.object({
  success: z.boolean(),
  newEmails: z.number().int().nonnegative(),
  updatedEmails: z.number().int().nonnegative(),
  syncedAt: z.string().datetime(),
});

// ============================================================================
// Type Exports
// ============================================================================

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

// ============================================================================
// Contract Definitions
// ============================================================================

export const EmailContracts = {
  sendEmail: {
    method: 'POST' as const,
    path: '/api/email/send',
    request: SendEmailRequestSchema,
    response: SendEmailResponseSchema,
  },
  searchEmails: {
    method: 'GET' as const,
    path: '/api/email/search',
    request: SearchEmailsRequestSchema,
    response: SearchEmailsResponseSchema,
  },
  getEmail: {
    method: 'GET' as const,
    path: '/api/email/:id',
    request: GetEmailRequestSchema,
    response: GetEmailResponseSchema,
  },
  getThread: {
    method: 'GET' as const,
    path: '/api/email/threads/:threadId',
    request: GetThreadRequestSchema,
    response: GetThreadResponseSchema,
  },
  updateEmail: {
    method: 'PUT' as const,
    path: '/api/email/:id',
    request: UpdateEmailRequestSchema,
    response: UpdateEmailResponseSchema,
  },
  archiveEmail: {
    method: 'POST' as const,
    path: '/api/email/:id/archive',
    request: ArchiveEmailRequestSchema,
    response: ArchiveEmailResponseSchema,
  },
  syncEmails: {
    method: 'POST' as const,
    path: '/api/email/sync',
    request: SyncEmailsRequestSchema,
    response: SyncEmailsResponseSchema,
  },
} as const;
