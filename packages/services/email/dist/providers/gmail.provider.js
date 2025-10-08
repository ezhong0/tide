import { google } from 'googleapis';
import { logger } from '@tide/logger';
/**
 * Gmail provider implementation
 */
export class GmailProvider {
    constructor() {
        this.gmail = null;
        this.userId = null;
    }
    /**
     * Initialize Gmail client with OAuth credentials
     */
    async initialize(userId, tokens) {
        try {
            this.userId = userId;
            // Create OAuth2 client
            this.auth = new google.auth.OAuth2();
            this.auth.setCredentials({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expiry_date: tokens.expiresAt.getTime(),
            });
            // Initialize Gmail API client
            this.gmail = google.gmail({ version: 'v1', auth: this.auth });
            logger.info({ userId }, 'Gmail provider initialized');
        }
        catch (error) {
            logger.error({ userId, error }, 'Failed to initialize Gmail provider');
            throw error;
        }
    }
    /**
     * Fetch emails from Gmail
     */
    async fetchEmails(options = {}) {
        if (!this.gmail || !this.userId) {
            throw new Error('Gmail provider not initialized');
        }
        try {
            // Build query
            let query = options.query || '';
            if (options.unreadOnly) {
                query += ' is:unread';
            }
            if (options.labels && options.labels.length > 0) {
                query += ` label:${options.labels.join(' label:')}`;
            }
            // Fetch message list with pagination support
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: query.trim() || undefined,
                maxResults: options.limit || 50,
                pageToken: options.pageToken || undefined,
            });
            if (!response.data.messages || response.data.messages.length === 0) {
                return [];
            }
            // Log pagination info
            if (response.data.nextPageToken) {
                logger.debug({ userId: this.userId, nextPageToken: response.data.nextPageToken }, 'More emails available - use nextPageToken for pagination');
            }
            // Fetch full message details in parallel
            // Filter out messages without IDs before fetching
            const validMessages = response.data.messages.filter((msg) => !!msg.id);
            const emails = await Promise.all(validMessages.map((msg) => this.fetchFullEmail(msg.id)));
            return emails.filter((email) => email !== null);
        }
        catch (error) {
            logger.error({ userId: this.userId, error }, 'Failed to fetch emails');
            throw error;
        }
    }
    /**
     * Fetch full email details
     */
    async fetchFullEmail(messageId) {
        if (!this.gmail || !this.userId) {
            return null;
        }
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });
            const message = response.data;
            if (!message) {
                return null;
            }
            // Extract headers
            const headers = message.payload?.headers || [];
            const getHeader = (name) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
            // Extract body
            const body = this.extractBody(message.payload);
            // Extract attachments
            const attachments = this.extractAttachments(message.payload);
            return {
                id: message.id,
                userId: this.userId,
                provider: 'gmail',
                messageId: getHeader('message-id'),
                threadId: message.threadId || undefined,
                from: getHeader('from'),
                to: getHeader('to')
                    ? getHeader('to').split(',').map((email) => email.trim()).filter(Boolean)
                    : [],
                cc: getHeader('cc')
                    ? getHeader('cc').split(',').map((email) => email.trim()).filter(Boolean)
                    : undefined,
                subject: getHeader('subject'),
                body: body.text,
                htmlBody: body.html || undefined,
                timestamp: message.internalDate
                    ? new Date(parseInt(message.internalDate))
                    : new Date(), // fallback to current time if missing
                labels: message.labelIds || undefined,
                isRead: !(message.labelIds?.includes('UNREAD') ?? false),
                isStarred: message.labelIds?.includes('STARRED') ?? false,
                hasAttachments: attachments.length > 0,
                attachments: attachments.length > 0 ? attachments : undefined,
                inReplyTo: getHeader('in-reply-to') || undefined,
                references: getHeader('references')
                    ? getHeader('references').split(/\s+/)
                    : undefined,
            };
        }
        catch (error) {
            logger.error({ messageId, error }, 'Failed to fetch full email');
            return null;
        }
    }
    /**
     * Extract email body from message payload
     */
    extractBody(payload) {
        if (!payload) {
            return { text: '' };
        }
        let textBody = '';
        let htmlBody = '';
        // Check if payload has body data
        if (payload.body?.data) {
            const decoded = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            if (payload.mimeType === 'text/html') {
                htmlBody = decoded;
            }
            else {
                textBody = decoded;
            }
        }
        // Recursively check parts for multipart messages
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    textBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
                else if (part.mimeType === 'text/html' && part.body?.data) {
                    htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
                else if (part.parts) {
                    const nested = this.extractBody(part);
                    textBody = textBody || nested.text;
                    htmlBody = htmlBody || nested.html || '';
                }
            }
        }
        return {
            text: textBody,
            html: htmlBody || undefined,
        };
    }
    /**
     * Extract attachments from message payload
     */
    extractAttachments(payload) {
        if (!payload || !payload.parts) {
            return [];
        }
        const attachments = [];
        for (const part of payload.parts) {
            if (part.filename && part.body?.attachmentId) {
                attachments.push({
                    id: part.body.attachmentId,
                    filename: part.filename,
                    mimeType: part.mimeType || 'application/octet-stream',
                    size: part.body.size || 0,
                });
            }
            // Recursively check nested parts
            if (part.parts) {
                attachments.push(...this.extractAttachments(part));
            }
        }
        return attachments;
    }
    /**
     * Send email
     */
    async sendEmail(draft, to) {
        if (!this.gmail || !this.userId) {
            throw new Error('Gmail provider not initialized');
        }
        try {
            const message = this.createMimeMessage(draft, to);
            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: Buffer.from(message).toString('base64url'),
                },
            });
            logger.info({ userId: this.userId, to, subject: draft.subject }, 'Email sent');
        }
        catch (error) {
            logger.error({ userId: this.userId, error }, 'Failed to send email');
            throw error;
        }
    }
    /**
     * Reply to email
     */
    async replyToEmail(emailId, draft) {
        if (!this.gmail || !this.userId) {
            throw new Error('Gmail provider not initialized');
        }
        try {
            // Get original message to extract headers
            const original = await this.gmail.users.messages.get({
                userId: 'me',
                id: emailId,
                format: 'full',
            });
            const headers = original.data.payload?.headers || [];
            const getHeader = (name) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
            const to = [getHeader('from')];
            const message = this.createMimeMessage(draft, to, {
                inReplyTo: getHeader('message-id'),
                references: getHeader('references') || getHeader('message-id'),
                threadId: original.data.threadId || undefined,
            });
            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: Buffer.from(message).toString('base64url'),
                    threadId: original.data.threadId,
                },
            });
            logger.info({ userId: this.userId, emailId }, 'Reply sent');
        }
        catch (error) {
            logger.error({ userId: this.userId, emailId, error }, 'Failed to reply to email');
            throw error;
        }
    }
    /**
     * Create MIME message
     */
    createMimeMessage(draft, to, headers) {
        const boundary = `----=_Part_${Date.now()}`;
        const lines = [
            `To: ${to.join(', ')}`,
            `Subject: ${draft.subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ];
        if (headers?.inReplyTo) {
            lines.push(`In-Reply-To: ${headers.inReplyTo}`);
        }
        if (headers?.references) {
            lines.push(`References: ${headers.references}`);
        }
        lines.push('', `--${boundary}`);
        lines.push('Content-Type: text/plain; charset=UTF-8');
        lines.push('', draft.body, '');
        lines.push(`--${boundary}--`);
        return lines.join('\r\n');
    }
    /**
     * Modify email labels
     */
    async modifyLabels(messageId, add, remove) {
        if (!this.gmail || !this.userId) {
            throw new Error('Gmail provider not initialized');
        }
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    addLabelIds: add.length > 0 ? add : undefined,
                    removeLabelIds: remove.length > 0 ? remove : undefined,
                },
            });
            logger.info({ userId: this.userId, messageId, add, remove }, 'Labels modified');
        }
        catch (error) {
            logger.error({ userId: this.userId, messageId, error }, 'Failed to modify labels');
            throw error;
        }
    }
    /**
     * Setup push notifications for real-time updates
     */
    async setupNotifications(userId) {
        if (!this.gmail) {
            throw new Error('Gmail provider not initialized');
        }
        try {
            // This would require Google Cloud Pub/Sub setup
            // For now, we'll log that notifications are not yet implemented
            logger.info({ userId }, 'Gmail push notifications setup (not yet implemented)');
        }
        catch (error) {
            logger.error({ userId, error }, 'Failed to setup notifications');
            throw error;
        }
    }
}
//# sourceMappingURL=gmail.provider.js.map