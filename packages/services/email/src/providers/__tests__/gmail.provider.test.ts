/**
 * Gmail Provider Unit Tests
 * Tests Gmail API integration and email operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GmailProvider } from '../gmail.provider';
import { createUserId } from '@tide/types';
import type { OAuthTokens, FetchOptions } from '../../types';

// Mock googleapis
vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
      })),
    },
    gmail: vi.fn().mockReturnValue({
      users: {
        messages: {
          list: vi.fn(),
          get: vi.fn(),
          send: vi.fn(),
          modify: vi.fn(),
        },
        watch: vi.fn(),
      },
    }),
  },
}));

describe('GmailProvider', () => {
  let provider: GmailProvider;
  let mockTokens: OAuthTokens;
  let userId: ReturnType<typeof createUserId>;

  beforeEach(() => {
    provider = new GmailProvider();
    userId = createUserId('test-user-123');
    mockTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      provider: 'google',
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with valid tokens', async () => {
      await expect(provider.initialize(userId, mockTokens)).resolves.not.toThrow();
    });

    it('should throw error with invalid tokens', async () => {
      const invalidTokens = {
        ...mockTokens,
        accessToken: '',
      };

      await expect(provider.initialize(userId, invalidTokens)).rejects.toThrow();
    });

    it('should set credentials on auth client', async () => {
      const { google } = await import('googleapis');
      const mockAuth = new google.auth.OAuth2();

      await provider.initialize(userId, mockTokens);

      expect(mockAuth.setCredentials).toHaveBeenCalledWith({
        access_token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
    });
  });

  describe('fetchEmails', () => {
    beforeEach(async () => {
      await provider.initialize(userId, mockTokens);
    });

    it('should fetch emails with default options', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      const mockListResponse = {
        data: {
          messages: [{ id: 'msg-1' }, { id: 'msg-2' }],
        },
      };

      const mockMessageResponse = {
        data: {
          id: 'msg-1',
          threadId: 'thread-1',
          payload: {
            headers: [
              { name: 'From', value: 'sender@example.com' },
              { name: 'To', value: 'recipient@example.com' },
              { name: 'Subject', value: 'Test Email' },
              { name: 'Date', value: 'Thu, 10 Jan 2025 10:00:00 -0800' },
            ],
            body: { data: Buffer.from('Email body').toString('base64') },
          },
        },
      };

      (gmail.users.messages.list as any).mockResolvedValueOnce(mockListResponse);
      (gmail.users.messages.get as any).mockResolvedValue(mockMessageResponse);

      const emails = await provider.fetchEmails();

      expect(emails).toHaveLength(2);
      expect(gmail.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        maxResults: 10,
        q: undefined,
      });
    });

    it('should apply query filter', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      (gmail.users.messages.list as any).mockResolvedValueOnce({ data: { messages: [] } });

      const options: FetchOptions = {
        query: 'is:unread',
      };

      await provider.fetchEmails(options);

      expect(gmail.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        maxResults: 10,
        q: 'is:unread',
      });
    });

    it('should handle pagination', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      (gmail.users.messages.list as any).mockResolvedValueOnce({ data: { messages: [] } });

      const options: FetchOptions = {
        limit: 50,
      };

      await provider.fetchEmails(options);

      expect(gmail.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        maxResults: 50,
        q: undefined,
      });
    });

    it('should handle empty result', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      (gmail.users.messages.list as any).mockResolvedValueOnce({ data: {} });

      const emails = await provider.fetchEmails();

      expect(emails).toEqual([]);
    });

    it('should extract email headers correctly', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      const mockListResponse = {
        data: {
          messages: [{ id: 'msg-1' }],
        },
      };

      const mockMessageResponse = {
        data: {
          id: 'msg-1',
          threadId: 'thread-1',
          payload: {
            headers: [
              { name: 'From', value: 'John Doe <sender@example.com>' },
              { name: 'To', value: 'recipient@example.com' },
              { name: 'Cc', value: 'cc1@example.com, cc2@example.com' },
              { name: 'Subject', value: 'Important Email' },
              { name: 'Date', value: new Date().toUTCString() },
            ],
            body: { data: Buffer.from('Email body').toString('base64') },
          },
          labelIds: ['UNREAD', 'IMPORTANT'],
        },
      };

      (gmail.users.messages.list as any).mockResolvedValueOnce(mockListResponse);
      (gmail.users.messages.get as any).mockResolvedValueOnce(mockMessageResponse);

      const emails = await provider.fetchEmails();

      expect(emails[0].from).toBe('sender@example.com');
      expect(emails[0].to).toContain('recipient@example.com');
      expect(emails[0].cc).toHaveLength(2);
      expect(emails[0].subject).toBe('Important Email');
      expect(emails[0].isRead).toBe(false);
    });

    it('should handle multipart email bodies', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      const mockMessageResponse = {
        data: {
          id: 'msg-1',
          threadId: 'thread-1',
          payload: {
            headers: [
              { name: 'From', value: 'sender@example.com' },
              { name: 'To', value: 'recipient@example.com' },
              { name: 'Subject', value: 'Test' },
              { name: 'Date', value: new Date().toUTCString() },
            ],
            mimeType: 'multipart/alternative',
            parts: [
              {
                mimeType: 'text/plain',
                body: { data: Buffer.from('Plain text body').toString('base64') },
              },
              {
                mimeType: 'text/html',
                body: { data: Buffer.from('<p>HTML body</p>').toString('base64') },
              },
            ],
          },
        },
      };

      (gmail.users.messages.list as any).mockResolvedValueOnce({
        data: { messages: [{ id: 'msg-1' }] },
      });
      (gmail.users.messages.get as any).mockResolvedValueOnce(mockMessageResponse);

      const emails = await provider.fetchEmails();

      expect(emails[0].body).toBe('Plain text body');
    });

    it('should extract attachments', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      const mockMessageResponse = {
        data: {
          id: 'msg-1',
          threadId: 'thread-1',
          payload: {
            headers: [
              { name: 'From', value: 'sender@example.com' },
              { name: 'To', value: 'recipient@example.com' },
              { name: 'Subject', value: 'Email with Attachment' },
              { name: 'Date', value: new Date().toUTCString() },
            ],
            parts: [
              {
                filename: 'document.pdf',
                mimeType: 'application/pdf',
                body: {
                  attachmentId: 'att-123',
                  size: 12345,
                },
              },
            ],
          },
        },
      };

      (gmail.users.messages.list as any).mockResolvedValueOnce({
        data: { messages: [{ id: 'msg-1' }] },
      });
      (gmail.users.messages.get as any).mockResolvedValueOnce(mockMessageResponse);

      const emails = await provider.fetchEmails();

      expect(emails[0].hasAttachments).toBe(true);
      expect(emails[0].attachments).toHaveLength(1);
      expect(emails[0].attachments![0].filename).toBe('document.pdf');
      expect(emails[0].attachments![0].mimeType).toBe('application/pdf');
      expect(emails[0].attachments![0].size).toBe(12345);
    });
  });

  describe('sendEmail', () => {
    beforeEach(async () => {
      await provider.initialize(userId, mockTokens);
    });

    it('should send email successfully', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      const mockSendResponse = {
        data: {
          id: 'sent-msg-123',
        },
      };

      (gmail.users.messages.send as any).mockResolvedValueOnce(mockSendResponse);

      const draft = {
        subject: 'Test Email',
        body: 'This is a test email',
      };

      await expect(provider.sendEmail(draft, ['recipient@example.com'])).resolves.not.toThrow();

      expect(gmail.users.messages.send).toHaveBeenCalled();
    });

    it('should handle send failures', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      (gmail.users.messages.send as any).mockRejectedValueOnce(
        new Error('Failed to send email')
      );

      const draft = {
        subject: 'Test',
        body: 'Body',
      };

      await expect(provider.sendEmail(draft, ['invalid@'])).rejects.toThrow();
    });
  });

  describe('modifyLabels', () => {
    beforeEach(async () => {
      await provider.initialize(userId, mockTokens);
    });

    it('should add and remove labels', async () => {
      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      (gmail.users.messages.modify as any).mockResolvedValueOnce({ data: {} });

      await provider.modifyLabels('msg-123', ['STARRED'], ['UNREAD']);

      expect(gmail.users.messages.modify).toHaveBeenCalledWith({
        userId: 'me',
        id: 'msg-123',
        requestBody: {
          addLabelIds: ['STARRED'],
          removeLabelIds: ['UNREAD'],
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle API quota errors', async () => {
      await provider.initialize(userId, mockTokens);

      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      const quotaError = new Error('Quota exceeded');
      (quotaError as any).code = 429;

      (gmail.users.messages.list as any).mockRejectedValueOnce(quotaError);

      await expect(provider.fetchEmails()).rejects.toThrow('Quota exceeded');
    });

    it('should handle network errors', async () => {
      await provider.initialize(userId, mockTokens);

      const { google } = await import('googleapis');
      const gmail = google.gmail('v1');

      (gmail.users.messages.list as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(provider.fetchEmails()).rejects.toThrow('Network error');
    });
  });
});

