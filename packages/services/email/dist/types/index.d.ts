import type { UserId } from '@tide/types';
/**
 * Email provider types
 */
export type EmailProvider = 'gmail' | 'exchange' | 'imap';
/**
 * Email urgency levels
 */
export type EmailUrgency = 'immediate' | 'today' | 'this_week' | 'whenever';
/**
 * Email categories
 */
export type EmailCategory = 'meeting' | 'request' | 'fyi' | 'newsletter' | 'social' | 'promotional' | 'important';
/**
 * Email action types
 */
export type EmailAction = 'reply' | 'schedule' | 'delegate' | 'file' | 'none';
/**
 * Triage strategy types
 */
export type TriageStrategy = 'auto_reply' | 'auto_decline' | 'auto_delegate' | 'auto_acknowledge' | 'auto_schedule' | 'smart_draft' | 'escalate' | 'archive';
/**
 * Draft approach types
 */
export type DraftApproach = 'detailed' | 'concise' | 'friendly' | 'formal' | 'ai-enhanced';
/**
 * Email sentiment
 */
export type EmailSentiment = 'positive' | 'neutral' | 'negative' | 'urgent';
/**
 * Email interface
 */
export interface Email {
    id: string;
    userId: UserId;
    provider: EmailProvider;
    messageId: string;
    threadId?: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    htmlBody?: string;
    timestamp: Date;
    labels?: string[];
    isRead: boolean;
    isStarred: boolean;
    hasAttachments: boolean;
    attachments?: EmailAttachment[];
    inReplyTo?: string;
    references?: string[];
    threadLength?: number;
}
/**
 * Email attachment interface
 */
export interface EmailAttachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url?: string;
}
/**
 * Triage result interface
 */
export interface TriageResult {
    importance: number;
    urgency: EmailUrgency;
    category: EmailCategory;
    sentiment: EmailSentiment;
    actionRequired: EmailAction;
    relationships: RelationshipContext;
    strategy: {
        type: TriageStrategy;
        auto: boolean;
        reasoning: string;
    };
    confidence: number;
    canAutoHandle: boolean;
}
/**
 * Relationship context interface
 */
export interface RelationshipContext {
    senderImportance: number;
    interactionCount: number;
    lastInteraction?: Date;
    averageResponseTime?: number;
    isVIP: boolean;
    tags: string[];
}
/**
 * Email draft interface
 */
export interface EmailDraft {
    approach: DraftApproach;
    subject: string;
    body: string;
    tone: string;
    length: number;
    confidence: number;
}
/**
 * Compose request interface
 */
export interface ComposeRequest {
    userId: UserId;
    recipient: string;
    subject?: string;
    thread?: Email[];
    context?: string;
    preferences?: ComposePreferences;
}
/**
 * Compose preferences interface
 */
export interface ComposePreferences {
    tone?: 'professional' | 'casual' | 'formal' | 'friendly';
    length?: 'brief' | 'moderate' | 'detailed';
    includeGreeting?: boolean;
    includeClosing?: boolean;
}
/**
 * Writing style interface
 */
export interface WritingStyle {
    preferredGreetings: string[];
    preferredClosings: string[];
    averageSentenceLength: number;
    formalityLevel: number;
    commonPhrases: string[];
    toneProfile: {
        professional: number;
        casual: number;
        formal: number;
    };
}
/**
 * Email action result interface
 */
export interface EmailActionResult {
    type: 'send' | 'draft' | 'queue' | 'archive' | 'delegate';
    email?: EmailDraft;
    confidence: number;
    reasoning?: string;
    calendarAction?: {
        type: 'tentative_block' | 'create_event';
        slots?: TimeSlot[];
    };
}
/**
 * Time slot interface
 */
export interface TimeSlot {
    start: Date;
    end: Date;
    score?: number;
}
/**
 * OAuth tokens interface
 */
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    scope: string[];
}
/**
 * Email provider interface
 */
export interface IEmailProvider {
    initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
    fetchEmails(options: FetchOptions): Promise<Email[]>;
    sendEmail(draft: EmailDraft, to: string[]): Promise<void>;
    replyToEmail(emailId: string, draft: EmailDraft): Promise<void>;
    modifyLabels(messageId: string, add: string[], remove: string[]): Promise<void>;
    setupNotifications(userId: UserId): Promise<void>;
}
/**
 * Fetch options interface
 */
export interface FetchOptions {
    query?: string;
    limit?: number;
    unreadOnly?: boolean;
    after?: Date;
    labels?: string[];
    pageToken?: string;
}
//# sourceMappingURL=index.d.ts.map