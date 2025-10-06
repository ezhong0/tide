import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  EmailAddressSchema,
  EmailPrioritySchema,
  AttachmentSchema,
  SendEmailParamsSchema,
  EmailSchema,
  EmailThreadSchema,
  SearchEmailParamsSchema,
  GetEmailParamsSchema,
  CreateThreadParamsSchema,
  MarkAsReadParamsSchema,
  DeleteEmailParamsSchema
} from './email.schemas';

describe('Email Schemas', () => {
  describe('EmailAddressSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.org'
      ];

      validEmails.forEach(email => {
        const result = EmailAddressSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        ''
      ];

      invalidEmails.forEach(email => {
        const result = EmailAddressSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('EmailPrioritySchema', () => {
    it('should accept valid priorities', () => {
      const priorities = ['low', 'normal', 'high', 'urgent'];
      priorities.forEach(priority => {
        const result = EmailPrioritySchema.safeParse(priority);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid priorities', () => {
      const result = EmailPrioritySchema.safeParse('critical');
      expect(result.success).toBe(false);
    });
  });

  describe('AttachmentSchema', () => {
    it('should validate correct attachment structure', () => {
      const attachment = {
        name: 'document.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        data: 'base64encodeddata'
      };

      const result = AttachmentSchema.safeParse(attachment);
      expect(result.success).toBe(true);
    });

    it('should reject oversized attachments', () => {
      const attachment = {
        name: 'huge.pdf',
        size: 30 * 1024 * 1024, // 30MB
        mimeType: 'application/pdf',
        data: 'data'
      };

      const result = AttachmentSchema.safeParse(attachment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('25MB');
      }
    });

    it('should require positive size', () => {
      const attachment = {
        name: 'empty.txt',
        size: 0,
        mimeType: 'text/plain',
        data: ''
      };

      const result = AttachmentSchema.safeParse(attachment);
      expect(result.success).toBe(false);
    });
  });

  describe('SendEmailParamsSchema', () => {
    it('should validate minimal send parameters', () => {
      const params = {
        to: ['user@example.com'],
        subject: 'Test Subject',
        body: 'Test body content',
        priority: 'normal'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should validate full send parameters', () => {
      const params = {
        to: ['user1@example.com', 'user2@example.com'],
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        from: 'sender@example.com',
        replyTo: 'reply@example.com',
        subject: 'Test Subject',
        body: 'Test body',
        htmlBody: '<p>Test body</p>',
        attachments: [{
          name: 'file.txt',
          size: 100,
          mimeType: 'text/plain',
          data: 'data'
        }],
        priority: 'high',
        tags: ['important', 'project'],
        metadata: {
          projectId: '123',
          version: 2
        },
        scheduledAt: new Date('2024-12-01T10:00:00Z'),
        threadId: 'thread-123',
        inReplyTo: 'email-456'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should reject empty recipient list', () => {
      const params = {
        to: [],
        subject: 'Test',
        body: 'Test',
        priority: 'normal'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject too many recipients', () => {
      const params = {
        to: Array(51).fill('user@example.com'),
        subject: 'Test',
        body: 'Test',
        priority: 'normal'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject empty subject', () => {
      const params = {
        to: ['user@example.com'],
        subject: '',
        body: 'Test',
        priority: 'normal'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject subject that is too long', () => {
      const params = {
        to: ['user@example.com'],
        subject: 'a'.repeat(256),
        body: 'Test',
        priority: 'normal'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject body that is too long', () => {
      const params = {
        to: ['user@example.com'],
        subject: 'Test',
        body: 'a'.repeat(1000001),
        priority: 'normal'
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should validate scheduled date is in the future', () => {
      const params = {
        to: ['user@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal',
        scheduledAt: new Date(Date.now() + 3600000) // 1 hour from now
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should reject scheduled date in the past', () => {
      const params = {
        to: ['user@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal',
        scheduledAt: new Date(Date.now() - 3600000) // 1 hour ago
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject too many attachments', () => {
      const attachments = Array(11).fill({
        name: 'file.txt',
        size: 100,
        mimeType: 'text/plain',
        data: 'data'
      });

      const params = {
        to: ['user@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal',
        attachments
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject too many tags', () => {
      const tags = Array(21).fill('tag');

      const params = {
        to: ['user@example.com'],
        subject: 'Test',
        body: 'Test',
        priority: 'normal',
        tags
      };

      const result = SendEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchEmailParamsSchema', () => {
    it('should validate search parameters', () => {
      const params = {
        query: 'search term',
        limit: 20,
        offset: 10,
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'subject keyword',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        hasAttachments: true,
        isRead: false,
        tags: ['tag1', 'tag2'],
        threadId: 'thread-123'
      };

      const result = SearchEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should enforce minimum query length', () => {
      const params = {
        query: '',
        limit: 10
      };

      const result = SearchEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should enforce maximum limit', () => {
      const params = {
        query: 'test',
        limit: 101
      };

      const result = SearchEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should provide default limit', () => {
      const params = {
        query: 'test'
      };

      const result = SearchEmailParamsSchema.parse(params);
      expect(result.limit).toBe(50);
    });
  });

  describe('GetEmailParamsSchema', () => {
    it('should validate email ID parameter', () => {
      const params = {
        emailId: 'email-123'
      };

      const result = GetEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should reject empty email ID', () => {
      const params = {
        emailId: ''
      };

      const result = GetEmailParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });
  });

  describe('EmailThreadSchema', () => {
    it('should validate complete thread structure', () => {
      const thread = {
        id: 'thread-123',
        subject: 'Thread Subject',
        participants: ['user1@example.com', 'user2@example.com'],
        emails: [
          {
            id: 'email-1',
            threadId: 'thread-123',
            to: ['user2@example.com'],
            from: 'user1@example.com',
            subject: 'Thread Subject',
            body: 'First message',
            sentAt: new Date(),
            receivedAt: new Date(),
            read: false,
            folder: 'inbox',
            priority: 'normal'
          }
        ],
        lastActivity: new Date(),
        unreadCount: 1,
        totalCount: 1
      };

      const result = EmailThreadSchema.safeParse(thread);
      expect(result.success).toBe(true);
    });
  });
});