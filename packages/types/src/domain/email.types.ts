/**
 * Email domain types with comprehensive modeling of email entities
 */

import {
  UUID, Timestamp, Email as EmailAddress, UserId, ThreadId, EmailId
} from '../base.types';

// Email provider types
export type EmailProvider = 'gmail' | 'outlook' | 'icloud' | 'custom';

// Email status types
export type EmailStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'failed' | 'bounced';

// Email priority
export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

// Email categories
export type EmailCategory =
  | 'personal'
  | 'work'
  | 'newsletter'
  | 'promotional'
  | 'social'
  | 'updates'
  | 'forums'
  | 'important'
  | 'spam';

// Email body types
export interface EmailBody {
  text: string;
  html?: string;
  markdown?: string;
}

// Attachment interface
export interface Attachment {
  id: UUID;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
  inline: boolean;
  contentId?: string;
}

// Email address with name
export interface EmailContact {
  email: EmailAddress;
  name?: string;
  avatar?: string;
}

// Tone analysis for emails
export interface ToneAnalysis {
  formality: number;  // 0-1: informal to formal
  urgency: number;    // 0-1: low to high urgency
  sentiment: number;  // -1 to 1: negative to positive
  confidence: number; // 0-1: confidence in analysis
}

// Importance scoring
export interface ImportanceScore {
  score: number;      // 0-100
  factors: ImportanceFactor[];
}

export interface ImportanceFactor {
  type: 'sender' | 'subject' | 'content' | 'time' | 'thread';
  weight: number;
  reason: string;
}

// Main email domain entity
export interface EmailDomain {
  // Identifiers
  emailId: EmailId;
  userId: UserId;
  threadId: ThreadId;
  messageId: string;  // Provider's message ID

  // Email metadata
  provider: EmailProvider;
  status: EmailStatus;
  priority: EmailPriority;
  category: EmailCategory;

  // Recipients
  from: EmailContact;
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  replyTo?: EmailContact;

  // Content
  subject: string;
  body: EmailBody;
  snippet: string;  // Preview text

  // Attachments
  attachments?: Attachment[];

  // Threading
  inReplyTo?: EmailId;
  references?: EmailId[];
  threadPosition: number;

  // Timestamps
  createdAt: Timestamp;
  sentAt?: Timestamp;
  receivedAt?: Timestamp;
  readAt?: Timestamp;

  // Flags
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  isDraft: boolean;

  // Analysis
  tone?: ToneAnalysis;
  importance?: ImportanceScore;
  labels?: string[];

  // Tracking
  openedAt?: Timestamp;
  clickedLinks?: LinkClick[];
}

export interface LinkClick {
  url: string;
  clickedAt: Timestamp;
  count: number;
}

// Email thread representation
export interface EmailThread {
  threadId: ThreadId;
  userId: UserId;
  subject: string;
  participants: EmailContact[];
  emailIds: EmailId[];
  emailCount: number;
  unreadCount: number;
  lastMessageAt: Timestamp;
  firstMessageAt: Timestamp;
  labels?: string[];
  importance?: ImportanceScore;
}

// Email search query
export interface EmailQuery {
  userId: UserId;
  text?: string;
  from?: EmailAddress;
  to?: EmailAddress;
  subject?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isStarred?: boolean;
  category?: EmailCategory;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  limit?: number;
  offset?: number;
}

// Email draft parameters
export interface DraftEmailParams {
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject: string;
  body: EmailBody;
  attachments?: Attachment[];
  replyTo?: EmailId;
  threadId?: ThreadId;
  scheduledFor?: Timestamp;
  priority?: EmailPriority;
}

// Send email parameters
export interface SendEmailParams extends DraftEmailParams {
  userId: UserId;
  from: EmailContact;
  provider: EmailProvider;
}

// Email draft context for AI assistance
export interface DraftContext {
  userId: UserId;
  recipient: EmailContact;
  subject?: string;
  context: string;
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  length?: 'brief' | 'normal' | 'detailed';
  previousEmails?: EmailDomain[];
}

// Email draft suggestion
export interface DraftSuggestion {
  subject: string;
  body: string;
  tone: ToneAnalysis;
  alternativeVersions?: Array<{
    tone: string;
    body: string;
  }>;
  confidence: number;
}

// Email monitoring response
export interface EmailResponse {
  emailId: EmailId;
  threadId: ThreadId;
  from: EmailContact;
  subject: string;
  receivedAt: Timestamp;
  isAutoReply: boolean;
  requiresAction: boolean;
  suggestedActions?: EmailAction[];
}

export interface EmailAction {
  type: 'reply' | 'forward' | 'schedule' | 'archive' | 'flag';
  reason: string;
  confidence: number;
  suggestedContent?: string;
}

// Email template
export interface EmailTemplate {
  templateId: UUID;
  userId: UserId;
  name: string;
  description?: string;
  subject: string;
  body: string;
  variables?: TemplateVariable[];
  category: string;
  usageCount: number;
  lastUsed?: Timestamp;
  createdAt: Timestamp;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'email';
  defaultValue?: string;
  required: boolean;
}

// Email analytics
export interface EmailAnalytics {
  userId: UserId;
  period: TimeRange;
  sent: number;
  received: number;
  averageResponseTime: number;
  topSenders: EmailContact[];
  topRecipients: EmailContact[];
  categoryBreakdown: Record<EmailCategory, number>;
  peakHours: number[];
  threadCount: number;
  averageThreadLength: number;
}

export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

// Email sync status
export interface EmailSyncStatus {
  userId: UserId;
  provider: EmailProvider;
  lastSync: Timestamp;
  nextSync: Timestamp;
  status: 'idle' | 'syncing' | 'error';
  totalEmails: number;
  syncedEmails: number;
  error?: string;
}