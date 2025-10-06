/**
 * Email domain types with comprehensive modeling of email entities
 */
import { UUID, Timestamp, Email as EmailAddress, UserId, ThreadId, EmailId } from '../base.types';
export type EmailProvider = 'gmail' | 'outlook' | 'icloud' | 'custom';
export type EmailStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'failed' | 'bounced';
export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';
export type EmailCategory = 'personal' | 'work' | 'newsletter' | 'promotional' | 'social' | 'updates' | 'forums' | 'important' | 'spam';
export interface EmailBody {
    text: string;
    html?: string;
    markdown?: string;
}
export interface Attachment {
    id: UUID;
    filename: string;
    mimeType: string;
    size: number;
    url?: string;
    inline: boolean;
    contentId?: string;
}
export interface EmailContact {
    email: EmailAddress;
    name?: string;
    avatar?: string;
}
export interface ToneAnalysis {
    formality: number;
    urgency: number;
    sentiment: number;
    confidence: number;
}
export interface ImportanceScore {
    score: number;
    factors: ImportanceFactor[];
}
export interface ImportanceFactor {
    type: 'sender' | 'subject' | 'content' | 'time' | 'thread';
    weight: number;
    reason: string;
}
export interface EmailDomain {
    emailId: EmailId;
    userId: UserId;
    threadId: ThreadId;
    messageId: string;
    provider: EmailProvider;
    status: EmailStatus;
    priority: EmailPriority;
    category: EmailCategory;
    from: EmailContact;
    to: EmailContact[];
    cc?: EmailContact[];
    bcc?: EmailContact[];
    replyTo?: EmailContact;
    subject: string;
    body: EmailBody;
    snippet: string;
    attachments?: Attachment[];
    inReplyTo?: EmailId;
    references?: EmailId[];
    threadPosition: number;
    createdAt: Timestamp;
    sentAt?: Timestamp;
    receivedAt?: Timestamp;
    readAt?: Timestamp;
    isRead: boolean;
    isStarred: boolean;
    isImportant: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    isDraft: boolean;
    tone?: ToneAnalysis;
    importance?: ImportanceScore;
    labels?: string[];
    openedAt?: Timestamp;
    clickedLinks?: LinkClick[];
}
export interface LinkClick {
    url: string;
    clickedAt: Timestamp;
    count: number;
}
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
export interface SendEmailParams extends DraftEmailParams {
    userId: UserId;
    from: EmailContact;
    provider: EmailProvider;
}
export interface DraftContext {
    userId: UserId;
    recipient: EmailContact;
    subject?: string;
    context: string;
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    length?: 'brief' | 'normal' | 'detailed';
    previousEmails?: EmailDomain[];
}
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
//# sourceMappingURL=email.types.d.ts.map