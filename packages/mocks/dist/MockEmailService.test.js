"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const MockEmailService_1 = require("./MockEmailService");
const types_1 = require("@tide/types");
(0, globals_1.describe)('MockEmailService', () => {
    let service;
    (0, globals_1.beforeEach)(() => {
        service = new MockEmailService_1.MockEmailService();
        // Reset random to ensure predictable tests
        globals_1.jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });
    afterEach(() => {
        globals_1.jest.restoreAllMocks();
    });
    (0, globals_1.describe)('sendEmail', () => {
        (0, globals_1.it)('should send email successfully', async () => {
            const params = {
                to: ['test@example.com'],
                subject: 'Test Email',
                body: 'Test body',
                priority: 'normal'
            };
            const result = await service.sendEmail(params);
            (0, globals_1.expect)((0, types_1.isOk)(result)).toBe(true);
            const emailId = (0, types_1.unwrap)(result);
            (0, globals_1.expect)(emailId).toMatch(/^email-/);
        });
        (0, globals_1.it)('should handle cc and bcc recipients', async () => {
            const params = {
                to: ['to@example.com'],
                cc: ['cc@example.com'],
                bcc: ['bcc@example.com'],
                subject: 'Multi-recipient Email',
                body: 'Test',
                priority: 'normal'
            };
            const result = await service.sendEmail(params);
            (0, globals_1.expect)((0, types_1.isOk)(result)).toBe(true);
            const emailId = (0, types_1.unwrap)(result);
            const email = await service.getEmail({ emailId });
            (0, globals_1.expect)((0, types_1.isOk)(email)).toBe(true);
            const emailData = (0, types_1.unwrap)(email);
            (0, globals_1.expect)(emailData.cc).toEqual(['cc@example.com']);
            (0, globals_1.expect)(emailData.bcc).toEqual(['bcc@example.com']);
        });
        (0, globals_1.it)('should simulate failures occasionally', async () => {
            // Force a failure by mocking random to return low value
            globals_1.jest.spyOn(Math, 'random').mockReturnValue(0.01);
            const params = {
                to: ['test@example.com'],
                subject: 'Test',
                body: 'Test',
                priority: 'normal'
            };
            const result = await service.sendEmail(params);
            (0, globals_1.expect)((0, types_1.isErr)(result)).toBe(true);
            (0, globals_1.expect)((0, types_1.unwrapErr)(result)).toContain('Failed to send email');
        });
        (0, globals_1.it)('should enforce rate limiting', async () => {
            // Send emails up to the rate limit
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(service.sendEmail({
                    to: [`test${i}@example.com`],
                    subject: `Test ${i}`,
                    body: 'Test',
                    priority: 'normal'
                }));
            }
            const results = await Promise.all(promises);
            const successCount = results.filter(types_1.isOk).length;
            const rateLimitedCount = results.filter(r => (0, types_1.isErr)(r) && (0, types_1.unwrapErr)(r).includes('Rate limit')).length;
            (0, globals_1.expect)(successCount).toBeLessThanOrEqual(4);
            (0, globals_1.expect)(rateLimitedCount).toBeGreaterThanOrEqual(1);
        });
        (0, globals_1.it)('should respect different priorities', async () => {
            const highPriority = {
                to: ['test@example.com'],
                subject: 'Urgent',
                body: 'Urgent message',
                priority: 'high'
            };
            const lowPriority = {
                to: ['test@example.com'],
                subject: 'Low priority',
                body: 'Can wait',
                priority: 'low'
            };
            const start = Date.now();
            const [highResult, lowResult] = await Promise.all([
                service.sendEmail(highPriority),
                service.sendEmail(lowPriority)
            ]);
            const elapsed = Date.now() - start;
            (0, globals_1.expect)((0, types_1.isOk)(highResult)).toBe(true);
            (0, globals_1.expect)((0, types_1.isOk)(lowResult)).toBe(true);
            // High priority should complete faster
            (0, globals_1.expect)(elapsed).toBeLessThan(600);
        });
    });
    (0, globals_1.describe)('getEmail', () => {
        (0, globals_1.it)('should retrieve sent email', async () => {
            const sendResult = await service.sendEmail({
                to: ['test@example.com'],
                subject: 'Test Subject',
                body: 'Test Body',
                priority: 'normal'
            });
            const emailId = (0, types_1.unwrap)(sendResult);
            const getResult = await service.getEmail({ emailId });
            (0, globals_1.expect)((0, types_1.isOk)(getResult)).toBe(true);
            const email = (0, types_1.unwrap)(getResult);
            (0, globals_1.expect)(email.id).toBe(emailId);
            (0, globals_1.expect)(email.subject).toBe('Test Subject');
            (0, globals_1.expect)(email.body).toBe('Test Body');
            (0, globals_1.expect)(email.to).toEqual(['test@example.com']);
        });
        (0, globals_1.it)('should return error for non-existent email', async () => {
            const result = await service.getEmail({
                emailId: 'non-existent'
            });
            (0, globals_1.expect)((0, types_1.isErr)(result)).toBe(true);
            (0, globals_1.expect)((0, types_1.unwrapErr)(result)).toBe('Email not found');
        });
    });
    (0, globals_1.describe)('searchEmails', () => {
        (0, globals_1.beforeEach)(async () => {
            // Send some test emails
            await service.sendEmail({
                to: ['alice@example.com'],
                from: 'bob@example.com',
                subject: 'Project Update',
                body: 'Here is the latest update on the project',
                priority: 'normal'
            });
            await service.sendEmail({
                to: ['charlie@example.com'],
                from: 'alice@example.com',
                subject: 'Meeting Tomorrow',
                body: 'Reminder about our meeting tomorrow at 2pm',
                priority: 'high'
            });
            await service.sendEmail({
                to: ['bob@example.com'],
                from: 'charlie@example.com',
                subject: 'Re: Project Update',
                body: 'Thanks for the update',
                priority: 'normal'
            });
        });
        (0, globals_1.it)('should search by subject keyword', async () => {
            const result = await service.searchEmails({
                query: 'Project',
                limit: 10
            });
            (0, globals_1.expect)((0, types_1.isOk)(result)).toBe(true);
            const emails = (0, types_1.unwrap)(result);
            (0, globals_1.expect)(emails.length).toBe(2);
            (0, globals_1.expect)(emails.every(e => e.subject.toLowerCase().includes('project'))).toBe(true);
        });
        (0, globals_1.it)('should search by body content', async () => {
            const result = await service.searchEmails({
                query: 'meeting',
                limit: 10
            });
            (0, globals_1.expect)((0, types_1.isOk)(result)).toBe(true);
            const emails = (0, types_1.unwrap)(result);
            (0, globals_1.expect)(emails.length).toBe(1);
            (0, globals_1.expect)(emails[0].body).toContain('meeting');
        });
        (0, globals_1.it)('should respect limit parameter', async () => {
            const result = await service.searchEmails({
                query: '',
                limit: 2
            });
            (0, globals_1.expect)((0, types_1.isOk)(result)).toBe(true);
            const emails = (0, types_1.unwrap)(result);
            (0, globals_1.expect)(emails.length).toBe(2);
        });
    });
    (0, globals_1.describe)('createThread', () => {
        (0, globals_1.it)('should create thread from emails', async () => {
            const email1Result = await service.sendEmail({
                to: ['test@example.com'],
                subject: 'Thread Test',
                body: 'First message',
                priority: 'normal'
            });
            const email2Result = await service.sendEmail({
                to: ['test@example.com'],
                subject: 'Re: Thread Test',
                body: 'Reply message',
                priority: 'normal'
            });
            const emailId1 = (0, types_1.unwrap)(email1Result);
            const emailId2 = (0, types_1.unwrap)(email2Result);
            const threadResult = await service.createThread({
                emailIds: [emailId1, emailId2],
                subject: 'Thread Test'
            });
            (0, globals_1.expect)((0, types_1.isOk)(threadResult)).toBe(true);
            const threadId = (0, types_1.unwrap)(threadResult);
            (0, globals_1.expect)(threadId).toMatch(/^thread-/);
        });
    });
    (0, globals_1.describe)('getThread', () => {
        (0, globals_1.it)('should retrieve created thread', async () => {
            const email1Result = await service.sendEmail({
                to: ['test@example.com'],
                subject: 'Thread Test',
                body: 'First message',
                priority: 'normal'
            });
            const emailId = (0, types_1.unwrap)(email1Result);
            const threadResult = await service.createThread({
                emailIds: [emailId],
                subject: 'Thread Test'
            });
            const threadId = (0, types_1.unwrap)(threadResult);
            const getThreadResult = await service.getThread({ threadId });
            (0, globals_1.expect)((0, types_1.isOk)(getThreadResult)).toBe(true);
            const thread = (0, types_1.unwrap)(getThreadResult);
            (0, globals_1.expect)(thread.id).toBe(threadId);
            (0, globals_1.expect)(thread.subject).toBe('Thread Test');
            (0, globals_1.expect)(thread.emails).toHaveLength(1);
            (0, globals_1.expect)(thread.emails[0].id).toBe(emailId);
        });
        (0, globals_1.it)('should return error for non-existent thread', async () => {
            const result = await service.getThread({
                threadId: 'non-existent'
            });
            (0, globals_1.expect)((0, types_1.isErr)(result)).toBe(true);
            (0, globals_1.expect)((0, types_1.unwrapErr)(result)).toBe('Thread not found');
        });
    });
    (0, globals_1.describe)('markAsRead/Unread', () => {
        (0, globals_1.it)('should mark email as read', async () => {
            const sendResult = await service.sendEmail({
                to: ['test@example.com'],
                subject: 'Test',
                body: 'Test',
                priority: 'normal'
            });
            const emailId = (0, types_1.unwrap)(sendResult);
            // Initially unread
            const beforeResult = await service.getEmail({ emailId });
            const beforeEmail = (0, types_1.unwrap)(beforeResult);
            (0, globals_1.expect)(beforeEmail.read).toBe(false);
            // Mark as read
            const markResult = await service.markAsRead({ emailIds: [emailId] });
            (0, globals_1.expect)((0, types_1.isOk)(markResult)).toBe(true);
            // Verify it's now read
            const afterResult = await service.getEmail({ emailId });
            const afterEmail = (0, types_1.unwrap)(afterResult);
            (0, globals_1.expect)(afterEmail.read).toBe(true);
        });
        (0, globals_1.it)('should mark email as unread', async () => {
            const sendResult = await service.sendEmail({
                to: ['test@example.com'],
                subject: 'Test',
                body: 'Test',
                priority: 'normal'
            });
            const emailId = (0, types_1.unwrap)(sendResult);
            // Mark as read first
            await service.markAsRead({ emailIds: [emailId] });
            // Then mark as unread
            const markResult = await service.markAsUnread({ emailIds: [emailId] });
            (0, globals_1.expect)((0, types_1.isOk)(markResult)).toBe(true);
            // Verify it's unread
            const result = await service.getEmail({ emailId });
            const email = (0, types_1.unwrap)(result);
            (0, globals_1.expect)(email.read).toBe(false);
        });
    });
    (0, globals_1.describe)('Performance', () => {
        (0, globals_1.it)('should complete operations within expected latency', async () => {
            const operations = [
                {
                    name: 'sendEmail',
                    fn: () => service.sendEmail({
                        to: ['test@example.com'],
                        subject: 'Performance Test',
                        body: 'Test',
                        priority: 'normal'
                    }),
                    maxLatency: 500
                },
                {
                    name: 'searchEmails',
                    fn: () => service.searchEmails({ query: 'test', limit: 10 }),
                    maxLatency: 100
                }
            ];
            for (const op of operations) {
                const start = Date.now();
                await op.fn();
                const elapsed = Date.now() - start;
                (0, globals_1.expect)(elapsed).toBeLessThanOrEqual(op.maxLatency);
            }
        });
    });
});
//# sourceMappingURL=MockEmailService.test.js.map