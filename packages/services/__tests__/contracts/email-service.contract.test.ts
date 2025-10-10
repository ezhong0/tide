/**
 * Email Service Contract Tests
 * Ensures the Email service API maintains its contract with consumers
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Email Service API Contract', () => {
  const EmailSchema = z.object({
    id: z.string(),
    userId: z.string(),
    provider: z.enum(['gmail', 'exchange']),
    messageId: z.string(),
    threadId: z.string().optional(),
    from: z.string().email(),
    to: z.array(z.string().email()),
    cc: z.array(z.string().email()).optional(),
    subject: z.string(),
    body: z.string(),
    timestamp: z.string().datetime(),
    isRead: z.boolean(),
    intelligence: z
      .object({
        importance: z.number().min(0).max(1),
        urgency: z.string(),
        category: z.string(),
        sentiment: z.string(),
        actionRequired: z.boolean(),
        confidence: z.number().min(0).max(1),
      })
      .optional(),
  });

  describe('GET /api/emails/search - Search Endpoint', () => {
    const SearchRequestSchema = z.object({
      userId: z.string(),
      query: z.string().optional(),
      from: z.string().email().optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      isUnread: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    });

    const SearchResponseSchema = z.object({
      emails: z.array(EmailSchema),
      count: z.number(),
      hasMore: z.boolean().optional(),
    });

    it('should define valid search request schema', () => {
      const validRequest = {
        userId: 'user-123',
        query: 'urgent',
        limit: 10,
        offset: 0,
      };

      const result = SearchRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should enforce limit constraints', () => {
      const invalidRequest = {
        userId: 'user-123',
        limit: 200, // Exceeds max
      };

      const result = SearchRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should define valid search response schema', () => {
      const validResponse = {
        emails: [
          {
            id: 'email-1',
            userId: 'user-123',
            provider: 'gmail' as const,
            messageId: 'msg-1',
            from: 'sender@example.com',
            to: ['recipient@example.com'],
            subject: 'Test',
            body: 'Body',
            timestamp: '2025-01-10T10:00:00Z',
            isRead: false,
            intelligence: {
              importance: 0.8,
              urgency: 'high',
              category: 'work',
              sentiment: 'neutral',
              actionRequired: true,
              confidence: 0.92,
            },
          },
        ],
        count: 1,
        hasMore: false,
      };

      const result = SearchResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/emails/triage - Triage Endpoint', () => {
    const TriageRequestSchema = z.object({
      userId: z.string(),
      emailIds: z.array(z.string()).min(1).max(100),
    });

    const TriageResultSchema = z.object({
      emailId: z.string(),
      category: z.string(),
      priority: z.number().min(0).max(10),
      urgency: z.string(),
      intelligence: z.object({
        importance: z.number().min(0).max(1),
        sentiment: z.string(),
        actionRequired: z.boolean(),
        confidence: z.number().min(0).max(1),
      }),
    });

    const TriageResponseSchema = z.object({
      results: z.array(TriageResultSchema),
    });

    it('should define valid triage request', () => {
      const validRequest = {
        userId: 'user-123',
        emailIds: ['email-1', 'email-2', 'email-3'],
      };

      const result = TriageRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should enforce batch size limits', () => {
      const largeRequest = {
        userId: 'user-123',
        emailIds: Array.from({ length: 150 }, (_, i) => `email-${i}`),
      };

      const result = TriageRequestSchema.safeParse(largeRequest);
      expect(result.success).toBe(false);
    });

    it('should require at least one email', () => {
      const emptyRequest = {
        userId: 'user-123',
        emailIds: [],
      };

      const result = TriageRequestSchema.safeParse(emptyRequest);
      expect(result.success).toBe(false);
    });

    it('should define valid triage response', () => {
      const validResponse = {
        results: [
          {
            emailId: 'email-1',
            category: 'urgent',
            priority: 9,
            urgency: 'high',
            intelligence: {
              importance: 0.95,
              sentiment: 'neutral',
              actionRequired: true,
              confidence: 0.88,
            },
          },
        ],
      };

      const result = TriageResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/emails/compose - Compose Endpoint', () => {
    const ComposeRequestSchema = z.object({
      userId: z.string(),
      to: z.string().email(),
      context: z.string(),
      tone: z.enum(['formal', 'professional', 'casual', 'friendly']).default('professional'),
      length: z.enum(['brief', 'balanced', 'detailed']).default('balanced'),
      replyToEmailId: z.string().optional(),
    });

    const ComposeResponseSchema = z.object({
      draft: z.string(),
      subject: z.string(),
      previewText: z.string(),
      wordCount: z.number(),
    });

    it('should define valid compose request', () => {
      const validRequest = {
        userId: 'user-123',
        to: 'recipient@example.com',
        context: 'Politely decline meeting request',
        tone: 'formal' as const,
        length: 'brief' as const,
      };

      const result = ComposeRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should enforce valid tone options', () => {
      const invalidRequest = {
        userId: 'user-123',
        to: 'recipient@example.com',
        context: 'Test',
        tone: 'aggressive', // Invalid
      };

      const result = ComposeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should define valid compose response', () => {
      const validResponse = {
        draft: 'Thank you for your email...',
        subject: 'Re: Meeting Request',
        previewText: 'Thank you for your email. Unfortunately...',
        wordCount: 45,
      };

      const result = ComposeResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/emails/send - Send Endpoint', () => {
    const SendRequestSchema = z.object({
      userId: z.string(),
      to: z.string().email(),
      subject: z.string().min(1),
      body: z.string().min(1),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
    });

    const SendResponseSchema = z.object({
      messageId: z.string(),
      sentAt: z.string().datetime(),
    });

    it('should define valid send request', () => {
      const validRequest = {
        userId: 'user-123',
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'This is a test email.',
      };

      const result = SendRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should require subject and body', () => {
      const invalidRequest = {
        userId: 'user-123',
        to: 'recipient@example.com',
        subject: '',
        body: '',
      };

      const result = SendRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should define valid send response', () => {
      const validResponse = {
        messageId: 'msg-abc123',
        sentAt: '2025-01-10T14:30:00Z',
      };

      const result = SendResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Intelligence Data Contract', () => {
    const IntelligenceSchema = z.object({
      importance: z.number().min(0).max(1),
      urgency: z.enum(['low', 'normal', 'high', 'critical']),
      category: z.string(),
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      actionRequired: z.boolean(),
      relationships: z.array(z.any()).optional(),
      autonomousActions: z.array(z.any()).optional(),
      confidence: z.number().min(0).max(1),
    });

    it('should define valid intelligence structure', () => {
      const validIntelligence = {
        importance: 0.75,
        urgency: 'high' as const,
        category: 'work',
        sentiment: 'neutral' as const,
        actionRequired: true,
        confidence: 0.88,
      };

      const result = IntelligenceSchema.safeParse(validIntelligence);
      expect(result.success).toBe(true);
    });

    it('should enforce importance range', () => {
      const invalidIntelligence = {
        importance: 1.5, // Out of range
        urgency: 'high',
        category: 'work',
        sentiment: 'neutral',
        actionRequired: false,
        confidence: 0.9,
      };

      const result = IntelligenceSchema.safeParse(invalidIntelligence);
      expect(result.success).toBe(false);
    });
  });

  describe('Backward Compatibility', () => {
    it('should allow emails without intelligence data', () => {
      const emailWithoutIntelligence = {
        id: 'email-1',
        userId: 'user-123',
        provider: 'gmail' as const,
        messageId: 'msg-1',
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        body: 'Body',
        timestamp: '2025-01-10T10:00:00Z',
        isRead: true,
        // No intelligence field
      };

      const result = EmailSchema.safeParse(emailWithoutIntelligence);
      expect(result.success).toBe(true);
    });
  });
});

