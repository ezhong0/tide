/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect } from '@jest/globals';

import {
  EmailContactSchema,
  AttachmentSchema,
  EmailQuerySchema
} from './email.schemas';
import { EmailSchema, PrioritySchema } from './primitives.schemas';

describe('Email Schemas', () => {
  describe('EmailSchema (from primitives)', () => {
    it('should validate correct email addresses', () => {
      const result = EmailSchema.safeParse('user@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = EmailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });
  });

  describe('PrioritySchema (from primitives)', () => {
    it('should accept valid priorities', () => {
      const result = PrioritySchema.safeParse('normal');
      expect(result.success).toBe(true);
    });

    it('should reject invalid priorities', () => {
      const result = PrioritySchema.safeParse('critical');
      expect(result.success).toBe(false);
    });
  });

  describe('EmailContactSchema', () => {
    it('should validate correct email contact', () => {
      const contact = {
        email: 'user@example.com',
        name: 'Test User'
      };

      const result = EmailContactSchema.safeParse(contact);
      expect(result.success).toBe(true);
    });
  });

  describe('AttachmentSchema', () => {
    it('should validate correct attachment structure', () => {
      const attachment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        filename: 'document.pdf',
        size: 1024000,
        mimeType: 'application/pdf'
      };

      const result = AttachmentSchema.safeParse(attachment);
      expect(result.success).toBe(true);
    });

    it('should reject oversized attachments', () => {
      const attachment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        filename: 'huge.pdf',
        size: 30 * 1024 * 1024, // 30MB
        mimeType: 'application/pdf'
      };

      const result = AttachmentSchema.safeParse(attachment);
      expect(result.success).toBe(false);
    });
  });

  describe('EmailQuerySchema', () => {
    it('should validate email query', () => {
      const query = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        text: 'search term'
      };

      const result = EmailQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });
  });
});
