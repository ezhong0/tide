"use strict";
/**
 * Realistic Mock Email Service Implementation
 * Maintains state, simulates latency, handles errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEmailService = void 0;
const types_1 = require("@tide/types");
class MockEmailService {
    emails = new Map();
    threads = new Map();
    templates = new Map();
    syncStatus = new Map();
    threadMonitors = new Map();
    // Simulated latency ranges (ms)
    latency = {
        send: { min: 200, max: 500 },
        search: { min: 50, max: 100 },
        get: { min: 20, max: 50 },
        update: { min: 30, max: 100 }
    };
    // Rate limiting simulation
    sendCount = 0;
    lastSendTime = 0;
    maxSendsPerMinute = 30;
    async sendEmail(params) {
        await this.simulateLatency('send');
        // Validate email addresses
        for (const to of params.to) {
            if (!this.isValidEmail(to.email)) {
                return (0, types_1.Err)(new Error(`Invalid email address: ${to.email}`));
            }
        }
        // Simulate rate limiting
        if (this.isSendingTooFast()) {
            return (0, types_1.Err)(new Error('Rate limit exceeded. Please wait before sending more emails.'));
        }
        // Simulate random failures (2% chance)
        if (Math.random() < 0.02) {
            return (0, types_1.Err)(new Error('Failed to connect to email provider'));
        }
        const emailId = EmailId(this.generateId());
        const threadId = params.threadId || ThreadId(this.generateId());
        const now = Timestamp(Date.now());
        const email = {
            emailId,
            userId: params.userId,
            threadId,
            messageId: `<${emailId}@tide.ai>`,
            provider: params.provider,
            status: 'sent',
            priority: params.priority || 'normal',
            category: this.categorizeEmail(params),
            from: params.from,
            to: params.to,
            cc: params.cc,
            bcc: params.bcc,
            subject: params.subject,
            body: params.body,
            snippet: this.generateSnippet(params.body.text),
            attachments: params.attachments,
            inReplyTo: params.replyTo,
            threadPosition: this.getThreadPosition(threadId),
            createdAt: now,
            sentAt: now,
            isRead: false,
            isStarred: false,
            isImportant: this.isImportant(params),
            isArchived: false,
            isDeleted: false,
            isDraft: false,
            tone: this.analyzeTone(params.body.text),
            importance: this.calculateImportance(params)
        };
        this.emails.set(emailId, email);
        this.updateThread(threadId, emailId);
        this.updateSendCount();
        // Simulate sending to recipients (would trigger incoming email for them)
        await this.simulateRecipientReceive(email);
        return (0, types_1.Ok)(emailId);
    }
    async scheduleEmail(params, scheduledFor) {
        await this.simulateLatency('update');
        const emailId = EmailId(this.generateId());
        const threadId = params.threadId || ThreadId(this.generateId());
        const now = Timestamp(Date.now());
        const email = {
            emailId,
            userId: params.userId,
            threadId,
            messageId: '',
            provider: params.provider,
            status: 'draft',
            priority: params.priority || 'normal',
            category: 'work',
            from: params.from,
            to: params.to,
            cc: params.cc,
            bcc: params.bcc,
            subject: params.subject,
            body: params.body,
            snippet: this.generateSnippet(params.body.text),
            attachments: params.attachments,
            threadPosition: 0,
            createdAt: now,
            isRead: true,
            isStarred: false,
            isImportant: false,
            isArchived: false,
            isDeleted: false,
            isDraft: true
        };
        this.emails.set(emailId, email);
        // Simulate scheduling
        setTimeout(async () => {
            email.status = 'sent';
            email.sentAt = Timestamp(Date.now());
            email.isDraft = false;
            this.emails.set(emailId, email);
        }, scheduledFor - Date.now());
        return (0, types_1.Ok)(emailId);
    }
    async createDraft(params) {
        await this.simulateLatency('update');
        const emailId = EmailId(this.generateId());
        const threadId = params.threadId || ThreadId(this.generateId());
        const now = Timestamp(Date.now());
        const email = {
            emailId,
            userId: UserId('mock-user'),
            threadId,
            messageId: '',
            provider: 'gmail',
            status: 'draft',
            priority: params.priority || 'normal',
            category: 'work',
            from: { email: Email('user@tide.ai'), name: 'User' },
            to: params.to,
            cc: params.cc,
            bcc: params.bcc,
            subject: params.subject,
            body: params.body,
            snippet: this.generateSnippet(params.body.text),
            attachments: params.attachments,
            threadPosition: 0,
            createdAt: now,
            isRead: true,
            isStarred: false,
            isImportant: false,
            isArchived: false,
            isDeleted: false,
            isDraft: true
        };
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(emailId);
    }
    async updateDraft(emailId, updates) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        if (!email.isDraft) {
            return (0, types_1.Err)(new Error('Cannot update non-draft email'));
        }
        // Apply updates
        if (updates.to)
            email.to = updates.to;
        if (updates.cc)
            email.cc = updates.cc;
        if (updates.bcc)
            email.bcc = updates.bcc;
        if (updates.subject)
            email.subject = updates.subject;
        if (updates.body) {
            email.body = updates.body;
            email.snippet = this.generateSnippet(updates.body.text);
        }
        if (updates.attachments)
            email.attachments = updates.attachments;
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(email);
    }
    async searchEmails(query) {
        await this.simulateLatency('search');
        let results = Array.from(this.emails.values())
            .filter(email => email.userId === query.userId);
        // Apply filters
        if (query.text) {
            const searchText = query.text.toLowerCase();
            results = results.filter(email => {
                const content = `${email.subject} ${email.body.text} ${email.from.email}`.toLowerCase();
                return content.includes(searchText);
            });
        }
        if (query.from) {
            results = results.filter(email => email.from.email === query.from);
        }
        if (query.to) {
            results = results.filter(email => email.to.some(recipient => recipient.email === query.to));
        }
        if (query.subject) {
            results = results.filter(email => email.subject.toLowerCase().includes(query.subject.toLowerCase()));
        }
        if (query.hasAttachment !== undefined) {
            results = results.filter(email => query.hasAttachment ? (email.attachments && email.attachments.length > 0) : true);
        }
        if (query.isUnread !== undefined) {
            results = results.filter(email => !email.isRead === query.isUnread);
        }
        if (query.isStarred !== undefined) {
            results = results.filter(email => email.isStarred === query.isStarred);
        }
        if (query.category) {
            results = results.filter(email => email.category === query.category);
        }
        if (query.dateRange) {
            results = results.filter(email => email.createdAt >= query.dateRange.start &&
                email.createdAt <= query.dateRange.end);
        }
        // Sort by date descending
        results.sort((a, b) => b.createdAt - a.createdAt);
        // Apply pagination
        const limit = query.limit || 50;
        const offset = query.offset || 0;
        results = results.slice(offset, offset + limit);
        return (0, types_1.Ok)(results);
    }
    async getEmail(emailId) {
        await this.simulateLatency('get');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        return (0, types_1.Ok)(email);
    }
    async getThread(threadId) {
        await this.simulateLatency('get');
        const emailIds = this.threads.get(threadId) || [];
        const emails = emailIds
            .map(id => this.emails.get(id))
            .filter(email => email !== undefined);
        // Sort chronologically
        emails.sort((a, b) => a.createdAt - b.createdAt);
        return (0, types_1.Ok)(emails);
    }
    async monitorThread(threadId, callback) {
        await this.simulateLatency('get');
        // Add callback to monitors
        if (!this.threadMonitors.has(threadId)) {
            this.threadMonitors.set(threadId, []);
        }
        this.threadMonitors.get(threadId).push(callback);
        // Return unsubscribe function
        const unsubscribe = () => {
            const callbacks = this.threadMonitors.get(threadId) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
        // Simulate receiving a response after random delay
        setTimeout(() => {
            this.simulateIncomingEmail(threadId);
        }, Math.random() * 60000 + 5000); // 5-65 seconds
        return (0, types_1.Ok)(unsubscribe);
    }
    async getDraftSuggestions(context) {
        await this.simulateLatency('search');
        // Simulate AI-generated suggestions
        const suggestions = [];
        // Formal version
        suggestions.push({
            subject: context.subject || `Re: ${context.context}`,
            body: this.generateFormalEmail(context),
            tone: {
                formality: 0.9,
                urgency: 0.3,
                sentiment: 0.6,
                confidence: 0.85
            },
            confidence: 0.85
        });
        // Casual version
        suggestions.push({
            subject: context.subject || `Re: ${context.context}`,
            body: this.generateCasualEmail(context),
            tone: {
                formality: 0.3,
                urgency: 0.3,
                sentiment: 0.7,
                confidence: 0.82
            },
            confidence: 0.82
        });
        // Brief version
        suggestions.push({
            subject: context.subject || `Re: ${context.context}`,
            body: this.generateBriefEmail(context),
            tone: {
                formality: 0.5,
                urgency: 0.4,
                sentiment: 0.6,
                confidence: 0.78
            },
            confidence: 0.78
        });
        return (0, types_1.Ok)(suggestions);
    }
    async markAsRead(emailId) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        email.isRead = true;
        email.readAt = Timestamp(Date.now());
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(undefined);
    }
    async markAsUnread(emailId) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        email.isRead = false;
        email.readAt = undefined;
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(undefined);
    }
    async starEmail(emailId) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        email.isStarred = true;
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(undefined);
    }
    async unstarEmail(emailId) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        email.isStarred = false;
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(undefined);
    }
    async archiveEmail(emailId) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        email.isArchived = true;
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(undefined);
    }
    async deleteEmail(emailId, permanent) {
        await this.simulateLatency('update');
        if (permanent) {
            this.emails.delete(emailId);
        }
        else {
            const email = this.emails.get(emailId);
            if (!email) {
                return (0, types_1.Err)(new Error('Email not found'));
            }
            email.isDeleted = true;
            this.emails.set(emailId, email);
        }
        return (0, types_1.Ok)(undefined);
    }
    async labelEmail(emailId, labels) {
        await this.simulateLatency('update');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        email.labels = labels;
        this.emails.set(emailId, email);
        return (0, types_1.Ok)(undefined);
    }
    async getSuggestedActions(emailId) {
        await this.simulateLatency('search');
        const email = this.emails.get(emailId);
        if (!email) {
            return (0, types_1.Err)(new Error('Email not found'));
        }
        const actions = [];
        // Suggest reply if it's received
        if (!email.isDraft && email.from.email !== Email('user@tide.ai')) {
            actions.push({
                type: 'reply',
                reason: 'This email appears to require a response',
                confidence: 0.85,
                suggestedContent: 'Thank you for your email. I will review and respond shortly.'
            });
        }
        // Suggest archiving if old
        if (Date.now() - email.createdAt > 7 * 24 * 60 * 60 * 1000) {
            actions.push({
                type: 'archive',
                reason: 'This email is over a week old',
                confidence: 0.7
            });
        }
        // Suggest scheduling if contains meeting keywords
        if (email.body.text.toLowerCase().includes('meeting') ||
            email.body.text.toLowerCase().includes('schedule')) {
            actions.push({
                type: 'schedule',
                reason: 'This email mentions scheduling',
                confidence: 0.75
            });
        }
        return (0, types_1.Ok)(actions);
    }
    async createTemplate(template) {
        await this.simulateLatency('update');
        const templateId = this.generateId();
        const fullTemplate = {
            ...template,
            templateId: UUID(templateId),
            createdAt: Timestamp(Date.now()),
            usageCount: 0
        };
        this.templates.set(templateId, fullTemplate);
        return (0, types_1.Ok)(templateId);
    }
    async getTemplates(userId) {
        await this.simulateLatency('get');
        const templates = Array.from(this.templates.values())
            .filter(t => t.userId === userId);
        return (0, types_1.Ok)(templates);
    }
    async getAnalytics(userId, startDate, endDate) {
        await this.simulateLatency('search');
        const userEmails = Array.from(this.emails.values())
            .filter(email => email.userId === userId &&
            email.createdAt >= startDate &&
            email.createdAt <= endDate);
        const analytics = {
            userId,
            period: { start: Timestamp(startDate), end: Timestamp(endDate) },
            sent: userEmails.filter(e => e.status === 'sent').length,
            received: userEmails.filter(e => e.from.email !== Email('user@tide.ai')).length,
            averageResponseTime: 3600000, // 1 hour in ms
            topSenders: this.getTopSenders(userEmails),
            topRecipients: this.getTopRecipients(userEmails),
            categoryBreakdown: this.getCategoryBreakdown(userEmails),
            peakHours: [9, 10, 14, 15, 16],
            threadCount: new Set(userEmails.map(e => e.threadId)).size,
            averageThreadLength: 3.5
        };
        return (0, types_1.Ok)(analytics);
    }
    async syncEmails(userId, fullSync) {
        await this.simulateLatency('update');
        const status = {
            userId,
            provider: 'gmail',
            lastSync: Timestamp(Date.now() - 3600000),
            nextSync: Timestamp(Date.now() + 300000),
            status: 'syncing',
            totalEmails: this.emails.size,
            syncedEmails: this.emails.size,
            error: undefined
        };
        this.syncStatus.set(userId, status);
        // Simulate sync completion
        setTimeout(() => {
            status.status = 'idle';
            status.lastSync = Timestamp(Date.now());
            this.syncStatus.set(userId, status);
        }, 2000);
        return (0, types_1.Ok)(status);
    }
    async getSyncStatus(userId) {
        await this.simulateLatency('get');
        const status = this.syncStatus.get(userId) || {
            userId,
            provider: 'gmail',
            lastSync: Timestamp(Date.now()),
            nextSync: Timestamp(Date.now() + 300000),
            status: 'idle',
            totalEmails: this.emails.size,
            syncedEmails: this.emails.size
        };
        return (0, types_1.Ok)(status);
    }
    async replyToEmail(emailId, replyParams) {
        await this.simulateLatency('update');
        const originalEmail = this.emails.get(emailId);
        if (!originalEmail) {
            return (0, types_1.Err)(new Error('Original email not found'));
        }
        const params = {
            userId: originalEmail.userId,
            from: { email: Email('user@tide.ai'), name: 'User' },
            to: [originalEmail.from],
            subject: `Re: ${originalEmail.subject}`,
            body: replyParams.body,
            provider: 'gmail',
            replyTo: emailId,
            threadId: originalEmail.threadId
        };
        return this.sendEmail(params);
    }
    async forwardEmail(emailId, forwardParams) {
        await this.simulateLatency('update');
        const originalEmail = this.emails.get(emailId);
        if (!originalEmail) {
            return (0, types_1.Err)(new Error('Original email not found'));
        }
        const params = {
            userId: originalEmail.userId,
            from: { email: Email('user@tide.ai'), name: 'User' },
            to: forwardParams.to,
            cc: forwardParams.cc,
            subject: `Fwd: ${originalEmail.subject}`,
            body: {
                text: `${forwardParams.body.text}\n\n---------- Forwarded message ----------\n${originalEmail.body.text}`,
                html: forwardParams.body.html
            },
            provider: 'gmail'
        };
        return this.sendEmail(params);
    }
    async batchOperations(operations) {
        await this.simulateLatency('update');
        const results = [];
        for (const op of operations) {
            let success = true;
            let error;
            let affectedCount = 0;
            try {
                switch (op.type) {
                    case 'markAsRead':
                        for (const emailId of op.emailIds) {
                            const result = await this.markAsRead(emailId);
                            if (result.success)
                                affectedCount++;
                            else {
                                success = false;
                                error = result.error.message;
                            }
                        }
                        break;
                    case 'markAsUnread':
                        for (const emailId of op.emailIds) {
                            const result = await this.markAsUnread(emailId);
                            if (result.success)
                                affectedCount++;
                        }
                        break;
                    case 'star':
                        for (const emailId of op.emailIds) {
                            const result = await this.starEmail(emailId);
                            if (result.success)
                                affectedCount++;
                        }
                        break;
                    case 'archive':
                        for (const emailId of op.emailIds) {
                            const result = await this.archiveEmail(emailId);
                            if (result.success)
                                affectedCount++;
                        }
                        break;
                    case 'delete':
                        for (const emailId of op.emailIds) {
                            const result = await this.deleteEmail(emailId);
                            if (result.success)
                                affectedCount++;
                        }
                        break;
                }
            }
            catch (e) {
                success = false;
                error = e.message;
            }
            results.push({
                operation: op,
                success,
                error,
                affectedCount
            });
        }
        return (0, types_1.Ok)(results);
    }
    // Helper methods
    async simulateLatency(operation) {
        const range = this.latency[operation];
        const delay = Math.random() * (range.max - range.min) + range.min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    isSendingTooFast() {
        const now = Date.now();
        if (now - this.lastSendTime < 60000) {
            if (this.sendCount >= this.maxSendsPerMinute) {
                return true;
            }
        }
        else {
            this.sendCount = 0;
            this.lastSendTime = now;
        }
        return false;
    }
    updateSendCount() {
        this.sendCount++;
        if (this.lastSendTime === 0) {
            this.lastSendTime = Date.now();
        }
    }
    categorizeEmail(params) {
        const subject = params.subject.toLowerCase();
        const body = params.body.text.toLowerCase();
        if (subject.includes('newsletter') || body.includes('unsubscribe')) {
            return 'newsletter';
        }
        if (subject.includes('order') || subject.includes('invoice')) {
            return 'promotional';
        }
        if (params.to.some(t => t.email.includes('@linkedin') || t.email.includes('@facebook'))) {
            return 'social';
        }
        if (subject.includes('update') || subject.includes('notification')) {
            return 'updates';
        }
        if (subject.includes('urgent') || subject.includes('important')) {
            return 'important';
        }
        return 'work';
    }
    generateSnippet(text) {
        return text.substring(0, 100).replace(/\n/g, ' ').trim() + (text.length > 100 ? '...' : '');
    }
    analyzeTone(text) {
        const formal = /dear|sincerely|regards|respectfully/i.test(text);
        const urgent = /urgent|asap|immediately|critical/i.test(text);
        const positive = /thanks|appreciate|great|excellent|wonderful/i.test(text);
        const negative = /unfortunately|problem|issue|concern|disappointed/i.test(text);
        return {
            formality: formal ? 0.8 : 0.3,
            urgency: urgent ? 0.9 : 0.2,
            sentiment: positive ? 0.7 : (negative ? -0.3 : 0.5),
            confidence: 0.75
        };
    }
    calculateImportance(params) {
        const factors = [];
        let score = 50;
        // Check sender importance
        if (params.from.email.includes('ceo') || params.from.email.includes('manager')) {
            factors.push({ type: 'sender', weight: 30, reason: 'From important person' });
            score += 30;
        }
        // Check subject keywords
        if (params.subject.toLowerCase().includes('urgent') ||
            params.subject.toLowerCase().includes('important')) {
            factors.push({ type: 'subject', weight: 20, reason: 'Urgent subject' });
            score += 20;
        }
        // Check if it's a reply
        if (params.replyTo) {
            factors.push({ type: 'thread', weight: 10, reason: 'Part of conversation' });
            score += 10;
        }
        return { score: Math.min(100, score), factors };
    }
    isImportant(params) {
        const importance = this.calculateImportance(params);
        return importance.score > 70;
    }
    getThreadPosition(threadId) {
        const emails = this.threads.get(threadId) || [];
        return emails.length;
    }
    updateThread(threadId, emailId) {
        if (!this.threads.has(threadId)) {
            this.threads.set(threadId, []);
        }
        this.threads.get(threadId).push(emailId);
    }
    async simulateRecipientReceive(email) {
        // In a real system, this would trigger notifications
        // For mock, we just store it
    }
    simulateIncomingEmail(threadId) {
        const callbacks = this.threadMonitors.get(threadId) || [];
        if (callbacks.length > 0) {
            const response = {
                emailId: EmailId(this.generateId()),
                threadId,
                from: { email: Email('colleague@company.com'), name: 'Colleague' },
                subject: 'Re: Your inquiry',
                receivedAt: Timestamp(Date.now()),
                isAutoReply: false,
                requiresAction: true,
                suggestedActions: [{
                        type: 'reply',
                        reason: 'Response received to your email',
                        confidence: 0.9
                    }]
            };
            callbacks.forEach(cb => cb(response));
        }
    }
    generateFormalEmail(context) {
        return `Dear ${context.recipient.name || 'Sir/Madam'},

I hope this email finds you well. ${context.context}

I would appreciate your consideration of this matter at your earliest convenience.

Best regards,
User`;
    }
    generateCasualEmail(context) {
        return `Hi ${context.recipient.name?.split(' ')[0] || 'there'},

${context.context}

Let me know if you need anything else!

Thanks,
User`;
    }
    generateBriefEmail(context) {
        return `${context.context}

Please let me know if you have any questions.

Best,
User`;
    }
    getTopSenders(emails) {
        const senderCount = new Map();
        emails.forEach(email => {
            if (email.from.email !== Email('user@tide.ai')) {
                const key = email.from.email;
                if (!senderCount.has(key)) {
                    senderCount.set(key, email.from);
                }
            }
        });
        return Array.from(senderCount.values()).slice(0, 5);
    }
    getTopRecipients(emails) {
        const recipientCount = new Map();
        emails.forEach(email => {
            email.to.forEach(recipient => {
                const key = recipient.email;
                if (!recipientCount.has(key)) {
                    recipientCount.set(key, recipient);
                }
            });
        });
        return Array.from(recipientCount.values()).slice(0, 5);
    }
    getCategoryBreakdown(emails) {
        const breakdown = {
            personal: 0, work: 0, newsletter: 0, promotional: 0,
            social: 0, updates: 0, forums: 0, important: 0, spam: 0
        };
        emails.forEach(email => {
            breakdown[email.category]++;
        });
        return breakdown;
    }
}
exports.MockEmailService = MockEmailService;
//# sourceMappingURL=MockEmailService.js.map