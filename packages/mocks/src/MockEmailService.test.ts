import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MockEmailService } from './MockEmailService';
import { isOk, isErr, unwrap, unwrapErr } from '@tide/types';

type EmailId = string;
type ThreadId = string;

interface SendEmailParams {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

describe('MockEmailService', () => {
  let service: MockEmailService;

  beforeEach(() => {
    service = new MockEmailService();
    // Reset random to ensure predictable tests
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const params: SendEmailParams = {
        to: ['test@example.com'],
        subject: 'Test Email',
        body: 'Test body',
        priority: 'normal'
      };

      const result = await service.sendEmail(params);
      expect(isOk(result)).toBe(true);

      const emailId = unwrap(result);
      expect(emailId).toMatch(/^email-/);
    });

    it('should handle cc and bcc recipients', async () => {
      const params: SendEmailParams = {
        to: ['to@example.com'],
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        subject: 'Multi-recipient Email',
        body: 'Test',
        priority: 'normal'
      };

      const result = await service.sendEmail(params);
      expect(isOk(result)).toBe(true);

      const emailId = unwrap(result);
      const email = await service.getEmail({ emailId });
      expect(isOk(email)).toBe(true);

      const emailData = unwrap(email);
      expect(emailData.cc).toEqual(['cc@example.com']);
      expect(emailData.bcc).toEqual(['bcc@example.com']);
    });

    it('should simulate failures occasionally', async () => {
      // Force a failure by mocking random to return low value
      jest.spyOn(Math, 'random').mockReturnValue(0.01);

      const params: SendEmailParams = {
        to: ['test@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal'
      };

      const result = await service.sendEmail(params);
      expect(isErr(result)).toBe(true);
      expect(unwrapErr(result)).toContain('Failed to send email');
    });

    it('should enforce rate limiting', async () => {
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
      const successCount = results.filter(isOk).length;
      const rateLimitedCount = results.filter(r =>
        isErr(r) && unwrapErr(r).includes('Rate limit')
      ).length;

      expect(successCount).toBeLessThanOrEqual(4);
      expect(rateLimitedCount).toBeGreaterThanOrEqual(1);
    });

    it('should respect different priorities', async () => {
      const highPriority: SendEmailParams = {
        to: ['test@example.com'],
        subject: 'Urgent',
        body: 'Urgent message',
        priority: 'high'
      };

      const lowPriority: SendEmailParams = {
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

      expect(isOk(highResult)).toBe(true);
      expect(isOk(lowResult)).toBe(true);
      // High priority should complete faster
      expect(elapsed).toBeLessThan(600);
    });
  });

  describe('getEmail', () => {
    it('should retrieve sent email', async () => {
      const sendResult = await service.sendEmail({
        to: ['test@example.com'],
        subject: 'Test Subject',
        body: 'Test Body',
        priority: 'normal'
      });

      const emailId = unwrap(sendResult);
      const getResult = await service.getEmail({ emailId });

      expect(isOk(getResult)).toBe(true);
      const email = unwrap(getResult);
      expect(email.id).toBe(emailId);
      expect(email.subject).toBe('Test Subject');
      expect(email.body).toBe('Test Body');
      expect(email.to).toEqual(['test@example.com']);
    });

    it('should return error for non-existent email', async () => {
      const result = await service.getEmail({
        emailId: 'non-existent' as EmailId
      });

      expect(isErr(result)).toBe(true);
      expect(unwrapErr(result)).toBe('Email not found');
    });
  });

  describe('searchEmails', () => {
    beforeEach(async () => {
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

    it('should search by subject keyword', async () => {
      const result = await service.searchEmails({
        query: 'Project',
        limit: 10
      });

      expect(isOk(result)).toBe(true);
      const emails = unwrap(result);
      expect(emails.length).toBe(2);
      expect(emails.every(e =>
        e.subject.toLowerCase().includes('project')
      )).toBe(true);
    });

    it('should search by body content', async () => {
      const result = await service.searchEmails({
        query: 'meeting',
        limit: 10
      });

      expect(isOk(result)).toBe(true);
      const emails = unwrap(result);
      expect(emails.length).toBe(1);
      expect(emails[0].body).toContain('meeting');
    });

    it('should respect limit parameter', async () => {
      const result = await service.searchEmails({
        query: '',
        limit: 2
      });

      expect(isOk(result)).toBe(true);
      const emails = unwrap(result);
      expect(emails.length).toBe(2);
    });
  });

  describe('createThread', () => {
    it('should create thread from emails', async () => {
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

      const emailId1 = unwrap(email1Result);
      const emailId2 = unwrap(email2Result);

      const threadResult = await service.createThread({
        emailIds: [emailId1, emailId2],
        subject: 'Thread Test'
      });

      expect(isOk(threadResult)).toBe(true);
      const threadId = unwrap(threadResult);
      expect(threadId).toMatch(/^thread-/);
    });
  });

  describe('getThread', () => {
    it('should retrieve created thread', async () => {
      const email1Result = await service.sendEmail({
        to: ['test@example.com'],
        subject: 'Thread Test',
        body: 'First message',
        priority: 'normal'
      });

      const emailId = unwrap(email1Result);
      const threadResult = await service.createThread({
        emailIds: [emailId],
        subject: 'Thread Test'
      });

      const threadId = unwrap(threadResult);
      const getThreadResult = await service.getThread({ threadId });

      expect(isOk(getThreadResult)).toBe(true);
      const thread = unwrap(getThreadResult);
      expect(thread.id).toBe(threadId);
      expect(thread.subject).toBe('Thread Test');
      expect(thread.emails).toHaveLength(1);
      expect(thread.emails[0].id).toBe(emailId);
    });

    it('should return error for non-existent thread', async () => {
      const result = await service.getThread({
        threadId: 'non-existent' as ThreadId
      });

      expect(isErr(result)).toBe(true);
      expect(unwrapErr(result)).toBe('Thread not found');
    });
  });

  describe('markAsRead/Unread', () => {
    it('should mark email as read', async () => {
      const sendResult = await service.sendEmail({
        to: ['test@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal'
      });

      const emailId = unwrap(sendResult);

      // Initially unread
      const beforeResult = await service.getEmail({ emailId });
      const beforeEmail = unwrap(beforeResult);
      expect(beforeEmail.read).toBe(false);

      // Mark as read
      const markResult = await service.markAsRead({ emailIds: [emailId] });
      expect(isOk(markResult)).toBe(true);

      // Verify it's now read
      const afterResult = await service.getEmail({ emailId });
      const afterEmail = unwrap(afterResult);
      expect(afterEmail.read).toBe(true);
    });

    it('should mark email as unread', async () => {
      const sendResult = await service.sendEmail({
        to: ['test@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal'
      });

      const emailId = unwrap(sendResult);

      // Mark as read first
      await service.markAsRead({ emailIds: [emailId] });

      // Then mark as unread
      const markResult = await service.markAsUnread({ emailIds: [emailId] });
      expect(isOk(markResult)).toBe(true);

      // Verify it's unread
      const result = await service.getEmail({ emailId });
      const email = unwrap(result);
      expect(email.read).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should complete operations within expected latency', async () => {
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

        expect(elapsed).toBeLessThanOrEqual(op.maxLatency);
      }
    });
  });
});