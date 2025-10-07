"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEmailService = void 0;
class MockEmailService {
    constructor() {
        this.mockEmails = [];
    }
    async fetchEmails(userId, filter) {
        const ts = Date.now();
        return [
            {
                id: 'email_1',
                from: { name: 'John Smith', email: 'john@acme.com' },
                to: [{ name: 'You', email: 'you@company.com' }],
                subject: 'Q4 Budget Review',
                body: 'Hi, I wanted to discuss the Q4 budget allocations...',
                priority: 'high',
                labels: ['important', 'finance'],
                timestamp: ts - 3600000,
                aiSummary: 'Request to review Q4 budget allocations'
            },
            {
                id: 'email_2',
                from: { name: 'Sarah Johnson', email: 'sarah@partner.com' },
                to: [{ name: 'You', email: 'you@company.com' }],
                subject: 'Partnership Opportunity',
                body: 'I hope this email finds you well. I wanted to reach out...',
                priority: 'normal',
                labels: ['business development'],
                timestamp: ts - 7200000,
                aiSummary: 'Partnership proposal from Sarah at Partner Co'
            }
        ];
    }
    async sendEmail(email) {
        const id = Date.now();
        this.mockEmails.push({ ...email, id: `email_${id}`, sent: true });
        return { success: true, messageId: `msg_${id}` };
    }
    async triageEmail(emailId) {
        return {
            priority: 'normal',
            category: 'general',
            suggestedActions: ['reply', 'archive']
        };
    }
}
exports.MockEmailService = MockEmailService;
