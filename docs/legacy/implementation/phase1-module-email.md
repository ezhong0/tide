# Email Module - Detailed Implementation Guide

## Timeline: Week 3-6 (Days 15-42)

## Team: Backend Engineer #1 + #2

## Dependencies: Phase 0 complete (contracts, mocks, infrastructure)

---

## Module Overview

**Responsibility**: Handle all email operations (Gmail + Outlook)

- OAuth authentication
- Send/read/search emails
- Real-time notifications (webhooks)
- Email synchronization

**Module Boundary**: This module ONLY handles email operations. It does NOT:

- Make AI decisions (that's AI Module)
- Analyze contacts (that's Context Module)
- Manage calendar (that's Calendar Module)

**Interfaces**:

- IN: API requests (send email, search, etc.)
- OUT: Email operations completed, webhooks received

---

## Week 3: Gmail Integration (Engineer #1)

### Day 15-16: Gmail OAuth Setup

#### 1. Google Cloud Project Setup

```bash
# Manual steps:
# 1. Go to https://console.cloud.google.com
# 2. Create new project: "Tide-Production"
# 3. Enable Gmail API
# 4. Enable Google People API (for user info)
# 5. Configure OAuth consent screen
# 6. Create OAuth 2.0 credentials
# 7. Add authorized redirect URIs:
#    - http://localhost:3000/api/email/oauth/callback (dev)
#    - https://api-staging.tide.app/api/email/oauth/callback
#    - https://api.tide.app/api/email/oauth/callback
# 8. Save client ID and secret to .env
```

#### 2. Install Dependencies

```bash
cd apps/api
pnpm add googleapis @google-cloud/pubsub
pnpm add -D @types/googleapis
```

#### 3. Gmail OAuth Implementation

```typescript
// apps/api/src/services/email/gmail/gmail-oauth.service.ts
import { google, Auth } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { encryptCredentials, decryptCredentials } from '../../../utils/encryption';
import { db } from '../../../db';
import { logger } from '../../../utils/logger';

export class GmailOAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );
  }

  /**
   * Generate OAuth URL for user to authorize
   */
  getAuthUrl(userId: string): string {
    // Generate secure state token
    const state = this.generateStateToken(userId);

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: [
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
      prompt: 'consent', // Force consent to ensure refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    state: string
  ): Promise<{ userId: string; tokens: OAuthTokens }> {
    // Verify state token
    const userId = this.verifyStateToken(state);

    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Incomplete tokens received');
      }

      const oauthTokens: OAuthTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date!),
        scope: tokens.scope!.split(' '),
      };

      // Store encrypted in database
      await db.user.update({
        where: { id: userId },
        data: {
          email_provider: 'gmail',
          email_credentials: encryptCredentials(oauthTokens),
        },
      });

      logger.info({ userId }, 'Gmail OAuth completed successfully');

      return { userId, tokens: oauthTokens };
    } catch (error) {
      logger.error({ userId, error }, 'Gmail OAuth exchange failed');
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(userId: string): Promise<OAuthTokens> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email_credentials: true },
    });

    if (!user || !user.email_credentials) {
      throw new Error('User credentials not found');
    }

    const credentials = decryptCredentials(user.email_credentials);

    this.oauth2Client.setCredentials({
      refresh_token: credentials.refreshToken,
    });

    try {
      const { credentials: newCredentials } = await this.oauth2Client.refreshAccessToken();

      const newTokens: OAuthTokens = {
        accessToken: newCredentials.access_token!,
        refreshToken: newCredentials.refresh_token || credentials.refreshToken,
        expiresAt: new Date(newCredentials.expiry_date!),
        scope: newCredentials.scope!.split(' '),
      };

      // Update in database
      await db.user.update({
        where: { id: userId },
        data: {
          email_credentials: encryptCredentials(newTokens),
        },
      });

      logger.info({ userId }, 'Gmail token refreshed');

      return newTokens;
    } catch (error) {
      logger.error({ userId, error }, 'Token refresh failed');
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Check if token is expired or expiring soon
   */
  async ensureValidToken(userId: string): Promise<OAuthTokens> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email_credentials: true },
    });

    if (!user || !user.email_credentials) {
      throw new Error('User credentials not found');
    }

    const credentials = decryptCredentials(user.email_credentials);

    // Refresh if expires in less than 5 minutes
    const expiresInMs = credentials.expiresAt.getTime() - Date.now();
    if (expiresInMs < 5 * 60 * 1000) {
      logger.info({ userId }, 'Token expiring soon, refreshing');
      return this.refreshAccessToken(userId);
    }

    return credentials;
  }

  private generateStateToken(userId: string): string {
    // In production, use proper signed token (JWT)
    const crypto = require('crypto');
    const data = JSON.stringify({ userId, timestamp: Date.now() });
    return Buffer.from(data).toString('base64url');
  }

  private verifyStateToken(state: string): string {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());

      // Check timestamp (state valid for 10 minutes)
      const age = Date.now() - decoded.timestamp;
      if (age > 10 * 60 * 1000) {
        throw new Error('State token expired');
      }

      return decoded.userId;
    } catch (error) {
      throw new Error('Invalid state token');
    }
  }
}

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
}
```

#### 4. OAuth API Endpoints

```typescript
// apps/api/src/routes/email-oauth.routes.ts
import { Router } from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { GmailOAuthService } from '../../services/email/gmail/gmail-oauth.service';

const router = Router();
const gmailOAuth = new GmailOAuthService();

/**
 * Step 1: Get OAuth URL
 * User clicks "Connect Gmail" in app
 */
router.post('/gmail/connect', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const authUrl = gmailOAuth.getAuthUrl(userId);

    res.json({
      auth_url: authUrl,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Step 2: OAuth callback
 * Google redirects here after user authorizes
 */
router.get('/gmail/callback', async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/auth/callback?error=${error}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    const { userId, tokens } = await gmailOAuth.exchangeCodeForTokens(
      code as string,
      state as string
    );

    // Redirect to success page
    res.redirect(`/auth/callback?success=true&user_id=${userId}`);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Testing OAuth Flow**:

```typescript
// apps/api/src/services/email/gmail/__tests__/gmail-oauth.test.ts
import { GmailOAuthService } from '../gmail-oauth.service';

describe('GmailOAuthService', () => {
  let service: GmailOAuthService;

  beforeEach(() => {
    service = new GmailOAuthService();
  });

  describe('getAuthUrl', () => {
    it('should generate valid OAuth URL', () => {
      const url = service.getAuthUrl('user-123');

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('scope=');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('state=');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange code for tokens', async () => {
      // Mock Google API response
      jest.spyOn(service['oauth2Client'], 'getToken').mockResolvedValue({
        tokens: {
          access_token: 'mock_access',
          refresh_token: 'mock_refresh',
          expiry_date: Date.now() + 3600000,
          scope: 'https://www.googleapis.com/auth/gmail.modify',
        },
      });

      const state = service['generateStateToken']('user-123');
      const result = await service.exchangeCodeForTokens('mock_code', state);

      expect(result.userId).toBe('user-123');
      expect(result.tokens.accessToken).toBe('mock_access');
      expect(result.tokens.refreshToken).toBe('mock_refresh');
    });
  });
});
```

**Deliverables Day 15-16**:

- [ ] Gmail OAuth service implemented
- [ ] OAuth endpoints working
- [ ] Token refresh automatic
- [ ] Encrypted storage of tokens
- [ ] Unit tests passing
- [ ] Manual OAuth flow tested

---

### Day 17-19: Gmail API Integration

```typescript
// apps/api/src/services/email/gmail/gmail-provider.service.ts
import { gmail_v1, google } from 'googleapis';
import { GmailOAuthService } from './gmail-oauth.service';
import type { IEmailProvider } from '../email-provider.interface';
import { logger } from '../../../utils/logger';
import { db } from '../../../db';

export class GmailProviderService implements IEmailProvider {
  private gmail: gmail_v1.Gmail;
  private oauthService: GmailOAuthService;

  constructor(private userId: string) {
    this.oauthService = new GmailOAuthService();
  }

  /**
   * Initialize Gmail client with user's credentials
   */
  private async initializeClient(): Promise<void> {
    const credentials = await this.oauthService.ensureValidToken(this.userId);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth });
  }

  /**
   * Send email via Gmail API
   */
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    await this.initializeClient();

    try {
      // Create MIME message
      const message = this.createMimeMessage(params);

      // Base64url encode
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send via Gmail API
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: params.replyToThreadId, // If replying
        },
      });

      // Store in database
      await this.storeEmailInDB({
        externalId: result.data.id!,
        threadId: result.data.threadId!,
        direction: 'sent',
        from: params.from,
        to: params.to,
        subject: params.subject,
        body: params.body,
        date: new Date(),
      });

      logger.info({ userId: this.userId, messageId: result.data.id }, 'Email sent');

      return {
        success: true,
        messageId: result.data.id!,
        threadId: result.data.threadId!,
      };
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Failed to send email');
      throw new EmailSendError('Failed to send email', params.to, error as Error);
    }
  }

  /**
   * Search emails
   */
  async searchEmails(query: SearchEmailParams): Promise<Email[]> {
    await this.initializeClient();

    try {
      // Build Gmail query string
      const q = this.buildGmailQuery(query);

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q,
        maxResults: query.limit || 50,
      });

      const messages = response.data.messages || [];

      // Fetch full message data in parallel
      const emails = await Promise.all(messages.map((msg) => this.getEmailById(msg.id!)));

      return emails;
    } catch (error) {
      logger.error({ userId: this.userId, error }, 'Search failed');
      throw new Error('Failed to search emails');
    }
  }

  /**
   * Get single email by ID
   */
  async getEmailById(messageId: string): Promise<Email> {
    await this.initializeClient();

    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return this.parseGmailMessage(response.data);
    } catch (error) {
      logger.error({ userId: this.userId, messageId, error }, 'Failed to get email');
      throw new Error('Failed to fetch email');
    }
  }

  /**
   * Get email thread
   */
  async getThread(threadId: string): Promise<EmailThread> {
    await this.initializeClient();

    try {
      const response = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      const messages = response.data.messages || [];
      const emails = messages.map((msg) => this.parseGmailMessage(msg));

      return {
        threadId,
        messages: emails,
        subject: emails[0]?.subject || '',
        participants: this.extractParticipants(emails),
      };
    } catch (error) {
      logger.error({ userId: this.userId, threadId, error }, 'Failed to get thread');
      throw new Error('Failed to fetch thread');
    }
  }

  // ========== HELPER METHODS ==========

  private createMimeMessage(params: SendEmailParams): string {
    const boundary = 'tide_boundary_' + Date.now();
    const nl = '\r\n';

    let message = '';

    // Headers
    message += `To: ${params.to.join(', ')}${nl}`;
    if (params.cc && params.cc.length > 0) {
      message += `Cc: ${params.cc.join(', ')}${nl}`;
    }
    message += `From: ${params.from}${nl}`;
    message += `Subject: ${params.subject}${nl}`;
    message += `MIME-Version: 1.0${nl}`;
    message += `Content-Type: multipart/alternative; boundary="${boundary}"${nl}`;
    message += nl;

    // Plain text part
    message += `--${boundary}${nl}`;
    message += `Content-Type: text/plain; charset=UTF-8${nl}`;
    message += nl;
    message += this.stripHtml(params.body);
    message += nl;

    // HTML part
    message += `--${boundary}${nl}`;
    message += `Content-Type: text/html; charset=UTF-8${nl}`;
    message += nl;
    message += params.body;
    message += nl;

    message += `--${boundary}--`;

    return message;
  }

  private buildGmailQuery(params: SearchEmailParams): string {
    const parts: string[] = [];

    if (params.query) parts.push(params.query);
    if (params.from) parts.push(`from:${params.from}`);
    if (params.to) parts.push(`to:${params.to}`);
    if (params.dateAfter) parts.push(`after:${this.formatDateForGmail(params.dateAfter)}`);
    if (params.dateBefore) parts.push(`before:${this.formatDateForGmail(params.dateBefore)}`);

    return parts.join(' ');
  }

  private parseGmailMessage(msg: gmail_v1.Schema$Message): Email {
    const headers = msg.payload?.headers || [];

    const getHeader = (name: string): string => {
      return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
    };

    return {
      id: msg.id!,
      threadId: msg.threadId!,
      from: getHeader('from'),
      to: this.parseEmailList(getHeader('to')),
      cc: this.parseEmailList(getHeader('cc')),
      subject: getHeader('subject'),
      body: this.extractBody(msg.payload!),
      snippet: msg.snippet || '',
      date: new Date(parseInt(msg.internalDate!)),
      labels: msg.labelIds || [],
      isRead: !msg.labelIds?.includes('UNREAD'),
    };
  }

  private extractBody(payload: gmail_v1.Schema$MessagePart): string {
    // Try to find HTML part first
    if (payload.mimeType === 'text/html' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    // Try plain text
    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    // Recurse into parts
    if (payload.parts) {
      for (const part of payload.parts) {
        const body = this.extractBody(part);
        if (body) return body;
      }
    }

    return '';
  }

  private parseEmailList(str: string): string[] {
    if (!str) return [];
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private formatDateForGmail(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  }

  private extractParticipants(emails: Email[]): string[] {
    const participants = new Set<string>();
    emails.forEach((email) => {
      participants.add(email.from);
      email.to.forEach((addr) => participants.add(addr));
      email.cc?.forEach((addr) => participants.add(addr));
    });
    return Array.from(participants);
  }

  private async storeEmailInDB(data: Partial<EmailRow>): Promise<void> {
    await db.email.create({
      data: {
        user_id: this.userId,
        external_id: data.externalId!,
        thread_id: data.threadId!,
        direction: data.direction!,
        from: data.from!,
        to: data.to!,
        subject: data.subject!,
        body: data.body!,
        snippet: data.body!.substring(0, 200),
        date: data.date!,
        indexed: false,
      },
    });
  }
}
```

**Deliverables Day 17-19**:

- [ ] Gmail provider service implemented
- [ ] Send email working
- [ ] Search emails working
- [ ] Get single email working
- [ ] Get thread working
- [ ] MIME message creation correct
- [ ] HTML/plain text handling
- [ ] Error handling for API failures
- [ ] Unit tests passing
- [ ] Integration test with real Gmail (manual)

---

(Should I continue with the rest of the Gmail module implementation including webhooks and sync, then move to Outlook, or would you like me to create the other module guides first?)
