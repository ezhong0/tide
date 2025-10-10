/**
 * Email Tools Unit Tests
 * Tests all email tool handlers with mocked external services
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  searchEmailsTool,
  composeEmailTool,
  sendEmailTool,
  categorizeEmailsTool,
} from '../email.tools';
import type { ToolContext } from '../types';
import { createUserId } from '@tide/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Email Tools', () => {
  let mockContext: ToolContext;

  beforeEach(() => {
    mockContext = {
      userId: createUserId('test-user-123'),
      requestId: 'test-request-456',
      userEmail: 'test@example.com',
      timestamp: Date.now(),
    };

    // Reset fetch mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchEmailsTool', () => {
    it('should search emails with query parameter', async () => {
      const mockResponse = {
        emails: [
          { id: '1', subject: 'Test Email', from: 'sender@example.com' },
          { id: '2', subject: 'Another Email', from: 'other@example.com' },
        ],
        count: 2,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchEmailsTool.handler(
        { query: 'urgent', limit: 10 },
        mockContext
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/emails/search'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('urgent'),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should search emails with date range', async () => {
      const mockResponse = { emails: [], count: 0 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchEmailsTool.handler(
        {
          dateFrom: '2025-01-01T00:00:00Z',
          dateTo: '2025-01-31T23:59:59Z',
          limit: 50,
        },
        mockContext
      );

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should filter by sender email', async () => {
      const mockResponse = {
        emails: [{ id: '1', from: 'boss@company.com' }],
        count: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchEmailsTool.handler(
        { from: 'boss@company.com', limit: 20 },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.from).toBe('boss@company.com');
      expect(result).toEqual(mockResponse);
    });

    it('should filter unread emails only', async () => {
      const mockResponse = {
        emails: [{ id: '1', isRead: false }],
        count: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchEmailsTool.handler(
        { isUnread: true, limit: 20 },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.isUnread).toBe(true);
    });

    it('should respect limit parameter (max 100)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ emails: [], count: 0 }),
      });

      await searchEmailsTool.handler({ limit: 100 }, mockContext);

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.limit).toBe(100);
    });

    it('should use default limit of 20 when not specified', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ emails: [], count: 0 }),
      });

      await searchEmailsTool.handler({}, mockContext);

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.limit).toBe(20);
    });

    it('should throw error when email service fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        searchEmailsTool.handler({ query: 'test' }, mockContext)
      ).rejects.toThrow('Email search failed: Internal Server Error');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        searchEmailsTool.handler({ query: 'test' }, mockContext)
      ).rejects.toThrow('Network error');
    });

    it('should include userId in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ emails: [], count: 0 }),
      });

      await searchEmailsTool.handler({ query: 'test' }, mockContext);

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.userId).toBe(mockContext.userId);
    });
  });

  describe('composeEmailTool', () => {
    it('should compose email with required parameters', async () => {
      const mockDraft = {
        draft: 'Thank you for your email. I appreciate your time.',
        subject: 'Re: Meeting Request',
        previewText: 'Thank you for your email...',
        wordCount: 10,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: mockDraft.draft, subject: mockDraft.subject }),
      });

      const result = await composeEmailTool.handler(
        {
          to: 'recipient@example.com',
          context: 'Politely decline the meeting request',
        },
        mockContext
      );

      expect(result.draft).toBe(mockDraft.draft);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should use specified tone', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: 'Formal email body', subject: 'Test' }),
      });

      await composeEmailTool.handler(
        {
          to: 'exec@company.com',
          context: 'Request time off',
          tone: 'formal',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.tone).toBe('formal');
    });

    it('should use specified length', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: 'Brief email', subject: 'Test' }),
      });

      await composeEmailTool.handler(
        {
          to: 'colleague@company.com',
          context: 'Quick update',
          length: 'brief',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.length).toBe('brief');
    });

    it('should default to professional tone', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: 'Professional email', subject: 'Test' }),
      });

      await composeEmailTool.handler(
        {
          to: 'someone@example.com',
          context: 'General message',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.tone).toBe('professional');
    });

    it('should default to balanced length', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: 'Balanced email', subject: 'Test' }),
      });

      await composeEmailTool.handler(
        {
          to: 'someone@example.com',
          context: 'General message',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.length).toBe('balanced');
    });

    it('should include replyToEmailId when replying', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: 'Reply body', subject: 'Re: Original' }),
      });

      await composeEmailTool.handler(
        {
          to: 'original-sender@example.com',
          context: 'Reply to their question',
          replyToEmailId: 'email-123',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.replyToEmailId).toBe('email-123');
    });

    it('should calculate word count correctly', async () => {
      const longBody = 'This is a test email with exactly ten words here.';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: longBody, subject: 'Test' }),
      });

      const result = await composeEmailTool.handler(
        {
          to: 'test@example.com',
          context: 'Test',
        },
        mockContext
      );

      expect(result.wordCount).toBe(10);
    });

    it('should truncate preview text to 200 characters', async () => {
      const longBody = 'A'.repeat(300);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ body: longBody, subject: 'Test' }),
      });

      const result = await composeEmailTool.handler(
        {
          to: 'test@example.com',
          context: 'Test',
        },
        mockContext
      );

      expect(result.previewText.length).toBe(200);
    });

    it('should throw error when composition fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      });

      await expect(
        composeEmailTool.handler(
          { to: 'test@example.com', context: 'Test' },
          mockContext
        )
      ).rejects.toThrow('Email composition failed');
    });
  });

  describe('sendEmailTool', () => {
    it('should send email with required parameters', async () => {
      const mockResponse = {
        messageId: 'sent-msg-123',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendEmailTool.handler(
        {
          to: 'recipient@example.com',
          subject: 'Test Email',
          body: 'This is a test email body.',
        },
        mockContext
      );

      expect(result.sent).toBe(true);
      expect(result.messageId).toBe('sent-msg-123');
      expect(result.timestamp).toBeTruthy();
    });

    it('should include CC recipients', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg-123' }),
      });

      await sendEmailTool.handler(
        {
          to: 'primary@example.com',
          subject: 'Test',
          body: 'Body',
          cc: ['cc1@example.com', 'cc2@example.com'],
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.cc).toEqual(['cc1@example.com', 'cc2@example.com']);
    });

    it('should include BCC recipients', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg-123' }),
      });

      await sendEmailTool.handler(
        {
          to: 'primary@example.com',
          subject: 'Test',
          body: 'Body',
          bcc: ['bcc@example.com'],
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.bcc).toEqual(['bcc@example.com']);
    });

    it('should throw error when send fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        sendEmailTool.handler(
          {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Body',
          },
          mockContext
        )
      ).rejects.toThrow('Email send failed');
    });

    it('should validate required parameters', async () => {
      // Tool parameter schema validation is handled by GPT-5
      // This test ensures handler receives all required params
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg-123' }),
      });

      const result = await sendEmailTool.handler(
        {
          to: 'test@example.com',
          subject: 'Required Subject',
          body: 'Required Body',
        },
        mockContext
      );

      expect(result.sent).toBe(true);
    });
  });

  describe('categorizeEmailsTool', () => {
    it('should categorize multiple emails', async () => {
      const mockResponse = {
        results: [
          { emailId: '1', category: 'urgent', priority: 9, urgency: 'high' },
          { emailId: '2', category: 'newsletter', priority: 3, urgency: 'low' },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await categorizeEmailsTool.handler(
        {
          emailIds: ['1', '2'],
        },
        mockContext
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle empty email list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      const result = await categorizeEmailsTool.handler(
        {
          emailIds: [],
        },
        mockContext
      );

      expect(result.results).toEqual([]);
    });

    it('should handle large batch of emails', async () => {
      const emailIds = Array.from({ length: 100 }, (_, i) => `email-${i}`);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: emailIds.map((id) => ({
            emailId: id,
            category: 'other',
            priority: 5,
          })),
        }),
      });

      const result = await categorizeEmailsTool.handler(
        { emailIds },
        mockContext
      );

      expect(result.results).toHaveLength(100);
    });

    it('should throw error when categorization fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        categorizeEmailsTool.handler(
          { emailIds: ['1', '2'] },
          mockContext
        )
      ).rejects.toThrow('Email categorization failed');
    });
  });

  describe('Tool Metadata', () => {
    it('searchEmailsTool should have correct type and name', () => {
      expect(searchEmailsTool.type).toBe('function');
      expect(searchEmailsTool.name).toBe('search_emails');
      expect(searchEmailsTool.description).toBeTruthy();
    });

    it('composeEmailTool should have correct parameters schema', () => {
      expect(composeEmailTool.parameters).toBeTruthy();
      expect(composeEmailTool.parameters.properties.to).toBeTruthy();
      expect(composeEmailTool.parameters.properties.context).toBeTruthy();
      expect(composeEmailTool.parameters.required).toContain('to');
      expect(composeEmailTool.parameters.required).toContain('context');
    });

    it('sendEmailTool should require confirmation', () => {
      expect(sendEmailTool.description).toContain('IMPORTANT');
      expect(sendEmailTool.description).toContain('confirmation');
    });

    it('categorizeEmailsTool should have emailIds parameter', () => {
      expect(categorizeEmailsTool.parameters.properties.emailIds).toBeTruthy();
      expect(categorizeEmailsTool.parameters.properties.emailIds.type).toBe('array');
    });
  });

  describe('Performance', () => {
    it('should complete search in <1s', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ emails: [], count: 0 }),
                }),
              100
            )
          )
      );

      const start = Date.now();
      await searchEmailsTool.handler({ query: 'test' }, mockContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should complete compose in <2s', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ body: 'Draft', subject: 'Test' }),
                }),
              200
            )
          )
      );

      const start = Date.now();
      await composeEmailTool.handler(
        { to: 'test@example.com', context: 'Test' },
        mockContext
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});

