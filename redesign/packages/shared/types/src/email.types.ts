import { z } from 'zod';
import { UserIdSchema } from './base.types.js';

// ============================================================================
// Email Types
// ============================================================================

export const EmailIdSchema = z.string().brand('EmailId');
export type EmailId = z.infer<typeof EmailIdSchema>;

export const EmailAddressSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export type EmailAddress = z.infer<typeof EmailAddressSchema>;

export const EmailPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);
export type EmailPriority = z.infer<typeof EmailPrioritySchema>;

export const EmailCategorySchema = z.enum([
  'inbox',
  'important',
  'flagged',
  'draft',
  'sent',
  'archive',
  'spam',
  'trash',
]);

export type EmailCategory = z.infer<typeof EmailCategorySchema>;

export const EmailTriageStatusSchema = z.enum([
  'pending',
  'triaged',
  'auto_handled',
  'needs_attention',
  'delegated',
]);

export type EmailTriageStatus = z.infer<typeof EmailTriageStatusSchema>;

export const EmailSentimentSchema = z.enum([
  'positive',
  'neutral',
  'negative',
  'urgent',
  'angry',
]);

export type EmailSentiment = z.infer<typeof EmailSentimentSchema>;

export const EmailSchema = z.object({
  id: EmailIdSchema,
  userId: UserIdSchema,
  threadId: z.string(),
  subject: z.string(),
  from: EmailAddressSchema,
  to: z.array(EmailAddressSchema),
  cc: z.array(EmailAddressSchema).optional(),
  bcc: z.array(EmailAddressSchema).optional(),
  replyTo: EmailAddressSchema.optional(),
  body: z.object({
    text: z.string(),
    html: z.string().optional(),
  }),
  attachments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    url: z.string().optional(),
  })).optional(),
  priority: EmailPrioritySchema,
  category: EmailCategorySchema,
  triageStatus: EmailTriageStatusSchema,
  sentiment: EmailSentimentSchema.optional(),
  aiAnalysis: z.object({
    summary: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
    suggestedActions: z.array(z.string()).optional(),
    importance: z.number().min(0).max(1).optional(),
    urgency: z.number().min(0).max(1).optional(),
    topics: z.array(z.string()).optional(),
    entities: z.array(z.object({
      type: z.string(),
      value: z.string(),
    })).optional(),
  }).optional(),
  metadata: z.object({
    isRead: z.boolean(),
    isFlagged: z.boolean(),
    isStarred: z.boolean(),
    labels: z.array(z.string()),
    folder: z.string().optional(),
  }),
  receivedAt: z.number(),
  sentAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Email = z.infer<typeof EmailSchema>;

// ============================================================================
// Email Thread Types
// ============================================================================

export const EmailThreadSchema = z.object({
  id: z.string(),
  userId: UserIdSchema,
  subject: z.string(),
  participants: z.array(EmailAddressSchema),
  messageCount: z.number(),
  latestMessage: EmailSchema,
  summary: z.string().optional(),
  importance: z.number().min(0).max(1),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastMessageAt: z.number(),
});

export type EmailThread = z.infer<typeof EmailThreadSchema>;

// ============================================================================
// Email Composition Types
// ============================================================================

export const EmailDraftSchema = z.object({
  id: z.string().uuid(),
  userId: UserIdSchema,
  to: z.array(EmailAddressSchema),
  cc: z.array(EmailAddressSchema).optional(),
  bcc: z.array(EmailAddressSchema).optional(),
  subject: z.string(),
  body: z.string(),
  replyToId: EmailIdSchema.optional(),
  forwardFromId: EmailIdSchema.optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    mimeType: z.string(),
    data: z.string(),
  })).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type EmailDraft = z.infer<typeof EmailDraftSchema>;

// ============================================================================
// Email Triage Types
// ============================================================================

export const TriageResultSchema = z.object({
  emailId: EmailIdSchema,
  importance: z.number().min(0).max(1),
  urgency: z.number().min(0).max(1),
  sentiment: EmailSentimentSchema,
  category: EmailCategorySchema,
  suggestedActions: z.array(z.object({
    type: z.enum(['reply', 'forward', 'archive', 'flag', 'schedule', 'delegate']),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  })),
  canAutoHandle: z.boolean(),
  recommendedReply: z.string().optional(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    confidence: z.number(),
  })),
  topics: z.array(z.string()),
  processingTime: z.number(),
  modelUsed: z.string(),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

// ============================================================================
// Email Provider Types
// ============================================================================

export const EmailProviderSchema = z.enum(['gmail', 'outlook', 'exchange', 'imap']);
export type EmailProvider = z.infer<typeof EmailProviderSchema>;

export const EmailAccountSchema = z.object({
  id: z.string().uuid(),
  userId: UserIdSchema,
  provider: EmailProviderSchema,
  email: z.string().email(),
  name: z.string(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  credentials: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: z.number(),
  }),
  settings: z.object({
    syncEnabled: z.boolean(),
    triageEnabled: z.boolean(),
    autoReplyEnabled: z.boolean(),
    syncFrequency: z.number(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastSyncAt: z.number().optional(),
});

export type EmailAccount = z.infer<typeof EmailAccountSchema>;
