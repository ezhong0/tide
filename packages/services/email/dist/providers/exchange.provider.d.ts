import type { UserId } from '@tide/types';
import type { Email, EmailDraft, IEmailProvider, OAuthTokens, FetchOptions } from '../types/index.js';
/**
 * Exchange/Outlook provider implementation using Microsoft Graph API
 */
export declare class ExchangeProvider implements IEmailProvider {
    private client;
    private userId;
    /**
     * Initialize Exchange client with OAuth credentials
     */
    initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
    /**
     * Fetch emails from Outlook
     */
    fetchEmails(options?: FetchOptions): Promise<Email[]>;
    /**
     * Transform Microsoft Graph message to Email format
     */
    private transformToEmail;
    /**
     * Send email
     */
    sendEmail(draft: EmailDraft, to: string[]): Promise<void>;
    /**
     * Reply to email
     */
    replyToEmail(emailId: string, draft: EmailDraft): Promise<void>;
    /**
     * Modify email labels (categories in Outlook)
     */
    modifyLabels(messageId: string, add: string[], remove: string[]): Promise<void>;
    /**
     * Setup push notifications for real-time updates
     */
    setupNotifications(userId: UserId): Promise<void>;
}
//# sourceMappingURL=exchange.provider.d.ts.map