import type { UserId } from '@tide/types';
import type { Email, EmailDraft, IEmailProvider, OAuthTokens, FetchOptions } from '../types';
/**
 * Gmail provider implementation
 */
export declare class GmailProvider implements IEmailProvider {
    private auth;
    private gmail;
    private userId;
    /**
     * Initialize Gmail client with OAuth credentials
     */
    initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
    /**
     * Fetch emails from Gmail
     */
    fetchEmails(options?: FetchOptions): Promise<Email[]>;
    /**
     * Fetch full email details
     */
    private fetchFullEmail;
    /**
     * Extract email body from message payload
     */
    private extractBody;
    /**
     * Extract attachments from message payload
     */
    private extractAttachments;
    /**
     * Send email
     */
    sendEmail(draft: EmailDraft, to: string[]): Promise<void>;
    /**
     * Reply to email
     */
    replyToEmail(emailId: string, draft: EmailDraft): Promise<void>;
    /**
     * Create MIME message
     */
    private createMimeMessage;
    /**
     * Modify email labels
     */
    modifyLabels(messageId: string, add: string[], remove: string[]): Promise<void>;
    /**
     * Setup push notifications for real-time updates
     */
    setupNotifications(userId: UserId): Promise<void>;
}
//# sourceMappingURL=gmail.provider.d.ts.map