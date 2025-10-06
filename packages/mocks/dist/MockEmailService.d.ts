/**
 * Realistic Mock Email Service Implementation
 * Maintains state, simulates latency, handles errors
 */
import { IEmailService } from '@tide/contracts';
import { type Result, EmailId, ThreadId, UserId, type EmailDomain, type EmailQuery, type DraftEmailParams, type DraftContext, type DraftSuggestion, type EmailResponse, type EmailAction, type EmailTemplate, type EmailAnalytics, type EmailSyncStatus } from '@tide/types';
interface SendEmailParams {
    to: string[];
    cc?: string[];
    bcc?: string[];
    from?: string;
    subject: string;
    body: string;
    htmlBody?: string;
    attachments?: Array<{
        name: string;
        size: number;
        mimeType: string;
        data: string;
    }>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    metadata?: Record<string, unknown>;
    scheduledAt?: Date;
    threadId?: string;
    inReplyTo?: string;
    replyTo?: string;
}
interface OperationResult {
    success: boolean;
    message?: string;
}
export declare class MockEmailService implements IEmailService {
    private emails;
    private threads;
    private templates;
    private syncStatus;
    private threadMonitors;
    private latency;
    private sendCount;
    private lastSendTime;
    private readonly maxSendsPerMinute;
    sendEmail(params: SendEmailParams): Promise<Result<EmailId>>;
    scheduleEmail(params: SendEmailParams, scheduledFor: number): Promise<Result<EmailId>>;
    createDraft(params: DraftEmailParams): Promise<Result<EmailId>>;
    updateDraft(emailId: EmailId, updates: Partial<DraftEmailParams>): Promise<Result<EmailDomain>>;
    searchEmails(query: EmailQuery): Promise<Result<EmailDomain[]>>;
    getEmail(emailId: EmailId): Promise<Result<EmailDomain>>;
    getThread(threadId: ThreadId): Promise<Result<EmailDomain[]>>;
    monitorThread(threadId: ThreadId, callback: (response: EmailResponse) => void): Promise<Result<() => void>>;
    getDraftSuggestions(context: DraftContext): Promise<Result<DraftSuggestion[]>>;
    markAsRead(emailId: EmailId): Promise<Result<void>>;
    markAsUnread(emailId: EmailId): Promise<Result<void>>;
    starEmail(emailId: EmailId): Promise<Result<void>>;
    unstarEmail(emailId: EmailId): Promise<Result<void>>;
    archiveEmail(emailId: EmailId): Promise<Result<void>>;
    deleteEmail(emailId: EmailId, permanent?: boolean): Promise<Result<void>>;
    labelEmail(emailId: EmailId, labels: string[]): Promise<Result<void>>;
    getSuggestedActions(emailId: EmailId): Promise<Result<EmailAction[]>>;
    createTemplate(template: Omit<EmailTemplate, 'templateId' | 'createdAt'>): Promise<Result<string>>;
    getTemplates(userId: UserId): Promise<Result<EmailTemplate[]>>;
    getAnalytics(userId: UserId, startDate: number, endDate: number): Promise<Result<EmailAnalytics>>;
    syncEmails(userId: UserId, fullSync?: boolean): Promise<Result<EmailSyncStatus>>;
    getSyncStatus(userId: UserId): Promise<Result<EmailSyncStatus>>;
    replyToEmail(emailId: EmailId, replyParams: DraftEmailParams): Promise<Result<EmailId>>;
    forwardEmail(emailId: EmailId, forwardParams: DraftEmailParams): Promise<Result<EmailId>>;
    batchOperations(operations: any[]): Promise<Result<OperationResult[]>>;
    private simulateLatency;
    private generateId;
    private isValidEmail;
    private isSendingTooFast;
    private updateSendCount;
    private categorizeEmail;
    private generateSnippet;
    private analyzeTone;
    private calculateImportance;
    private isImportant;
    private getThreadPosition;
    private updateThread;
    private simulateRecipientReceive;
    private simulateIncomingEmail;
    private generateFormalEmail;
    private generateCasualEmail;
    private generateBriefEmail;
    private getTopSenders;
    private getTopRecipients;
    private getCategoryBreakdown;
}
export {};
//# sourceMappingURL=MockEmailService.d.ts.map