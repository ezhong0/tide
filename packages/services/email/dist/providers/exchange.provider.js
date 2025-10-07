"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeProvider = void 0;
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const logger_1 = require("@tide/logger");
/**
 * Exchange/Outlook provider implementation using Microsoft Graph API
 */
class ExchangeProvider {
    constructor() {
        this.client = null;
        this.userId = null;
    }
    /**
     * Initialize Exchange client with OAuth credentials
     */
    async initialize(userId, tokens) {
        try {
            this.userId = userId;
            // Create Microsoft Graph client with auth
            this.client = microsoft_graph_client_1.Client.init({
                authProvider: (done) => {
                    done(null, tokens.accessToken);
                },
            });
            logger_1.logger.info({ userId }, 'Exchange provider initialized');
        }
        catch (error) {
            logger_1.logger.error({ userId, error }, 'Failed to initialize Exchange provider');
            throw error;
        }
    }
    /**
     * Fetch emails from Outlook
     */
    async fetchEmails(options = {}) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange provider not initialized');
        }
        try {
            // Build filter query
            let filter = options.query || '';
            if (options.unreadOnly) {
                filter = filter ? `${filter} and isRead eq false` : 'isRead eq false';
            }
            // Build request
            let request = this.client
                .api('/me/messages')
                .select([
                'id',
                'subject',
                'from',
                'toRecipients',
                'ccRecipients',
                'bccRecipients',
                'body',
                'bodyPreview',
                'receivedDateTime',
                'isRead',
                'hasAttachments',
                'internetMessageId',
                'conversationId',
                'importance',
            ])
                .orderby('receivedDateTime DESC')
                .top(options.limit || 50);
            if (filter) {
                request = request.filter(filter);
            }
            const response = await request.get();
            if (!response.value || response.value.length === 0) {
                return [];
            }
            // Transform to Email format
            return response.value.map((msg) => this.transformToEmail(msg));
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, error }, 'Failed to fetch emails');
            throw error;
        }
    }
    /**
     * Transform Microsoft Graph message to Email format
     */
    transformToEmail(msg) {
        return {
            id: msg.id,
            userId: this.userId,
            provider: 'exchange',
            messageId: msg.internetMessageId || msg.id,
            threadId: msg.conversationId,
            from: msg.from?.emailAddress?.address || '',
            to: msg.toRecipients?.map((r) => r.emailAddress?.address) || [],
            cc: msg.ccRecipients?.map((r) => r.emailAddress?.address),
            bcc: msg.bccRecipients?.map((r) => r.emailAddress?.address),
            subject: msg.subject || '',
            body: msg.body?.content || msg.bodyPreview || '',
            htmlBody: msg.body?.contentType === 'html' ? msg.body?.content : undefined,
            timestamp: new Date(msg.receivedDateTime),
            labels: [],
            isRead: msg.isRead ?? false,
            isStarred: msg.flag?.flagStatus === 'flagged',
            hasAttachments: msg.hasAttachments ?? false,
            attachments: undefined, // Would need separate API call to fetch
        };
    }
    /**
     * Send email
     */
    async sendEmail(draft, to) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange provider not initialized');
        }
        try {
            const message = {
                subject: draft.subject,
                body: {
                    contentType: 'Text',
                    content: draft.body,
                },
                toRecipients: to.map((email) => ({
                    emailAddress: {
                        address: email,
                    },
                })),
            };
            await this.client.api('/me/sendMail').post({
                message,
                saveToSentItems: true,
            });
            logger_1.logger.info({ userId: this.userId, to, subject: draft.subject }, 'Email sent');
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, error }, 'Failed to send email');
            throw error;
        }
    }
    /**
     * Reply to email
     */
    async replyToEmail(emailId, draft) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange provider not initialized');
        }
        try {
            await this.client.api(`/me/messages/${emailId}/reply`).post({
                comment: draft.body,
            });
            logger_1.logger.info({ userId: this.userId, emailId }, 'Reply sent');
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, emailId, error }, 'Failed to reply to email');
            throw error;
        }
    }
    /**
     * Modify email labels (categories in Outlook)
     */
    async modifyLabels(messageId, add, remove) {
        if (!this.client || !this.userId) {
            throw new Error('Exchange provider not initialized');
        }
        try {
            // Get current categories
            const message = await this.client
                .api(`/me/messages/${messageId}`)
                .select('categories')
                .get();
            const currentCategories = message.categories || [];
            const newCategories = [
                ...currentCategories.filter((c) => !remove.includes(c)),
                ...add,
            ];
            await this.client.api(`/me/messages/${messageId}`).patch({
                categories: newCategories,
            });
            logger_1.logger.info({ userId: this.userId, messageId, add, remove }, 'Labels modified');
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, messageId, error }, 'Failed to modify labels');
            throw error;
        }
    }
    /**
     * Setup push notifications for real-time updates
     */
    async setupNotifications(userId) {
        if (!this.client) {
            throw new Error('Exchange provider not initialized');
        }
        try {
            // This would require Microsoft Graph webhook setup
            // For now, we'll log that notifications are not yet implemented
            logger_1.logger.info({ userId }, 'Exchange push notifications setup (not yet implemented)');
        }
        catch (error) {
            logger_1.logger.error({ userId, error }, 'Failed to setup notifications');
            throw error;
        }
    }
}
exports.ExchangeProvider = ExchangeProvider;
//# sourceMappingURL=exchange.provider.js.map