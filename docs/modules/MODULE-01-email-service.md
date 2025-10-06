# Module 01: Email Service (Conversational Text-First)

## 🤖 Claude Instance Prompt

```
You are Claude Instance #1, the Email Service Architect for Tide.

Your mission: Build a production-ready email service that integrates with Gmail and Outlook for a conversational text-first AI assistant, achieving <100ms response times for cached operations and <500ms for API calls.

Core responsibilities:
1. Implement OAuth 2.0 flows for Gmail and Outlook (NO third-party services like Nylas)
2. Build provider abstraction using Strategy pattern
3. Handle email operations through conversational interface
4. Support preview-and-confirm pattern for all actions
5. Process natural language requests for email management
6. Implement intelligent caching for instant responses
7. Ensure all operations emit proper domain events

Key constraints:
- Must use IConversation and IEmailService interfaces from Module 00
- Must support conversational context (understanding "it", "that email", etc.)
- Must provide human-readable action previews before execution
- Must achieve 90% test coverage
- Must handle offline scenarios gracefully
- Zero external dependencies beyond Google/Microsoft APIs

Remember: This is a conversational text-first app. Users type naturally and expect to see what will happen before it happens. Trust through transparency.
```

## 📋 Module Overview

**Duration**: 4 weeks (Week 3-6 of project)
**Dependencies**:
- IEmailService interface (from Module 00)
- MockEventStore (for event emission)
- MockCalendarService (for meeting requests)
- MockContextEngine (for smart suggestions)

## 🎯 Success Criteria

```typescript
const successCriteria = {
  functionality: {
    gmailOAuth: "fully working with refresh tokens",
    outlookOAuth: "fully working with refresh tokens",
    sendEmail: "<500ms including API call",
    searchEmail: "<100ms for cached, <300ms for fresh",
    threadMonitoring: "real-time via webhooks",
    offlineSupport: "queue operations when offline"
  },

  performance: {
    cachedOperations: "<100ms p95",
    apiOperations: "<500ms p95",
    webhookProcessing: "<50ms p95",
    startupTime: "<1000ms"
  },

  reliability: {
    errorRate: "<0.1%",
    retryLogic: "exponential backoff",
    rateLimiting: "handled gracefully",
    testCoverage: ">90%"
  }
};
```

## 🏗️ Architecture Design

### Provider Strategy Pattern

```typescript
// Core abstraction - all providers must implement this
interface IEmailProvider {
  // OAuth
  getAuthUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<TokenSet>;
  refreshAccessToken(refreshToken: string): Promise<TokenSet>;

  // Core operations
  sendEmail(params: SendEmailParams): Promise<Result<EmailId>>;
  getEmail(id: string): Promise<Result<Email>>;
  searchEmails(query: SearchQuery): Promise<Result<Email[]>>;
  getThread(threadId: string): Promise<Result<EmailThread>>;

  // Webhooks
  subscribeToWebhooks(endpoint: string): Promise<Result<void>>;
  processWebhook(payload: unknown): Promise<WebhookEvent>;

  // Batch operations
  batchGetEmails(ids: string[]): Promise<Result<Email[]>>;
  batchMarkAsRead(ids: string[]): Promise<Result<void>>;
}

// Provider factory for clean instantiation
class EmailProviderFactory {
  create(user: User): IEmailProvider {
    switch(user.emailProvider) {
      case 'gmail':
        return new GmailProvider(user.tokens);
      case 'outlook':
        return new OutlookProvider(user.tokens);
      default:
        throw new Error(`Unsupported provider: ${user.emailProvider}`);
    }
  }
}
```

### Caching Strategy

```typescript
class EmailCacheStrategy {
  // L1: In-memory cache (process memory)
  private l1Cache: LRUCache<string, Email>;

  // L2: Redis cache (shared across instances)
  private l2Cache: RedisCache;

  // L3: Database (persistent storage)
  private l3Storage: EmailRepository;

  async get(key: string): Promise<Email | null> {
    // Try L1 first (fastest, ~1ms)
    const l1Result = this.l1Cache.get(key);
    if (l1Result) return l1Result;

    // Try L2 (fast, ~5-10ms)
    const l2Result = await this.l2Cache.get(key);
    if (l2Result) {
      this.l1Cache.set(key, l2Result);
      return l2Result;
    }

    // Fall back to L3 (slower, ~20-50ms)
    const l3Result = await this.l3Storage.findById(key);
    if (l3Result) {
      await this.promoteToCache(key, l3Result);
      return l3Result;
    }

    return null;
  }
}
```

## 💬 Conversational Integration

### Email Operations Through Natural Language

```typescript
// Conversational email handler that understands context
class ConversationalEmailHandler {
  constructor(
    private emailService: IEmailService,
    private conversationContext: IConversationContext
  ) {}

  async handleMessage(message: IMessage): Promise<IConversationResponse> {
    // Extract intent from natural language
    const intent = await this.extractIntent(message.content);

    switch (intent.type) {
      case 'send_email':
        return this.handleSendEmail(intent, message);
      case 'search_email':
        return this.handleSearchEmail(intent, message);
      case 'reply_to_email':
        return this.handleReplyToEmail(intent, message);
      case 'forward_email':
        return this.handleForwardEmail(intent, message);
      default:
        return this.handleUnknown(message);
    }
  }

  private async handleSendEmail(
    intent: EmailIntent,
    message: IMessage
  ): Promise<IConversationResponse> {
    // Parse natural language into email parameters
    const params = await this.parseEmailParams(message.content);

    // Generate preview for user confirmation
    const preview: IActionPreview = {
      action: 'send_email',
      description: `Send email to ${params.to}`,
      details: {
        to: params.to,
        subject: params.subject,
        body: params.body.substring(0, 200) + '...'
      },
      editable: true
    };

    // Return conversational response with preview
    return {
      message: `I'll compose an email to ${params.to} with the subject "${params.subject}". Here's what I'll send:`,
      preview,
      requiresConfirmation: true,
      onConfirm: async () => {
        const result = await this.emailService.sendEmail(params);
        return {
          message: `✓ Email sent to ${params.to}!`,
          result
        };
      }
    };
  }

  private async handleSearchEmail(
    intent: EmailIntent,
    message: IMessage
  ): Promise<IConversationResponse> {
    // Resolve references like "that email from John"
    const query = await this.resolveReferences(message.content);

    // Perform search
    const emails = await this.emailService.searchEmails(query);

    // Format results conversationally
    if (emails.length === 0) {
      return {
        message: "I couldn't find any emails matching your search.",
        suggestions: ['Try different keywords', 'Check your spam folder']
      };
    }

    return {
      message: `I found ${emails.length} email${emails.length > 1 ? 's' : ''}:`,
      results: emails.map(email => ({
        from: email.from,
        subject: email.subject,
        preview: email.body.substring(0, 100),
        date: this.formatRelativeDate(email.date),
        actions: ['Reply', 'Forward', 'Archive']
      })),
      followUpQuestions: [
        'Would you like me to reply to any of these?',
        'Should I summarize any of them?'
      ]
    };
  }

  // Resolve contextual references
  private async resolveReferences(text: string): Promise<string> {
    // Handle references like "it", "that email", "the last one"
    const context = this.conversationContext.getActiveContext();

    if (text.includes('it') || text.includes('that email')) {
      const lastEmail = context.lastMentionedEmail;
      if (lastEmail) {
        text = text.replace(/it|that email/g, `email ${lastEmail.id}`);
      }
    }

    if (text.includes('them') || text.includes('those emails')) {
      const lastEmails = context.lastSearchResults;
      if (lastEmails) {
        text = text.replace(/them|those emails/g, `emails ${lastEmails.join(',')}`);
      }
    }

    return text;
  }
}
```

### Natural Language Email Composition

```typescript
class NaturalLanguageEmailComposer {
  async composeFromConversation(request: string): Promise<EmailDraft> {
    // Example: "Send an email to John about the quarterly report"
    // Or: "Reply to Sarah's message saying I'll be there at 3pm"

    const draft: EmailDraft = {
      to: await this.extractRecipients(request),
      subject: await this.generateSubject(request),
      body: await this.generateBody(request),
      tone: await this.detectTone(request) // formal, casual, friendly
    };

    // Learn user's style over time
    draft.body = await this.applyUserStyle(draft.body);

    return draft;
  }

  private async extractRecipients(text: string): Promise<string[]> {
    // Handle various formats:
    // "to John" -> lookup John in contacts
    // "to john@example.com" -> use directly
    // "to the team" -> expand team alias
    const recipients: string[] = [];

    // Extract names/emails from text
    const matches = text.match(/to\s+(\w+(?:\s+\w+)?)/gi);

    for (const match of matches || []) {
      const name = match.replace(/^to\s+/i, '');
      const email = await this.resolveContactEmail(name);
      if (email) recipients.push(email);
    }

    return recipients;
  }

  private async generateSubject(text: string): Promise<string> {
    // Extract topic and generate appropriate subject
    if (text.includes('about')) {
      const topic = text.split('about')[1].trim();
      return this.capitalizeTitle(topic);
    }

    // Use AI to generate if not explicit
    return this.ai.generateEmailSubject(text);
  }
}
```

## 📁 Detailed Implementation

### Week 3, Day 1-2: Gmail OAuth Implementation

```typescript
// src/modules/email/providers/gmail/GmailOAuthService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GmailOAuthService {
  private oauth2Client: OAuth2Client;

  constructor(
    private readonly config: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    }
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  getAuthUrl(state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.metadata'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Gets refresh token
      scope: scopes,
      state: state, // CSRF protection
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  async exchangeCodeForTokens(code: string): Promise<TokenSet> {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received. User may need to reauthorize.');
    }

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date!,
      scope: tokens.scope!
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      refreshToken: refreshToken, // Keep the same refresh token
      expiresAt: credentials.expiry_date!,
      scope: credentials.scope!
    };
  }
}
```

### Week 3, Day 3-4: Gmail Provider Implementation

```typescript
// src/modules/email/providers/gmail/GmailProvider.ts
export class GmailProvider implements IEmailProvider {
  private gmail: gmail_v1.Gmail;
  private rateLimiter: RateLimiter;
  private cache: EmailCache;

  constructor(
    private tokens: TokenSet,
    private eventStore: IEventStore
  ) {
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.rateLimiter = new RateLimiter({
      maxRequests: 250,
      windowMs: 1000 // Gmail allows 250 requests per second
    });
    this.cache = new EmailCache();
  }

  async sendEmail(params: SendEmailParams): Promise<Result<EmailId>> {
    try {
      // Check rate limit
      await this.rateLimiter.acquire();

      // Build MIME message
      const mimeMessage = this.buildMimeMessage(params);

      // Send via Gmail API
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(mimeMessage).toString('base64url')
        }
      });

      const emailId = EmailId(response.data.id!);

      // Emit domain event
      await this.eventStore.append(new EmailSentEvent({
        aggregateId: emailId,
        userId: params.userId,
        to: params.to,
        subject: params.subject,
        timestamp: Date.now()
      }));

      // Cache the sent email
      await this.cache.set(emailId, {
        id: emailId,
        ...params,
        status: 'sent',
        messageId: response.data.id!,
        threadId: response.data.threadId!
      });

      return { success: true, data: emailId };

    } catch (error) {
      // Handle specific Gmail errors
      if (error.code === 429) {
        return { success: false, error: new RateLimitError() };
      }
      if (error.code === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        return this.sendEmail(params); // Retry once
      }

      return { success: false, error };
    }
  }

  async searchEmails(query: SearchQuery): Promise<Result<Email[]>> {
    // Check cache first
    const cacheKey = this.getCacheKey(query);
    const cached = await this.cache.get(cacheKey);
    if (cached && this.isCacheFresh(cached)) {
      return { success: true, data: cached };
    }

    try {
      // Convert natural language to Gmail query
      const gmailQuery = this.buildGmailQuery(query);

      // Search via API
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: gmailQuery,
        maxResults: query.limit || 50
      });

      if (!response.data.messages) {
        return { success: true, data: [] };
      }

      // Batch get full messages (Gmail doesn't return full content in list)
      const emails = await this.batchGetEmails(
        response.data.messages.map(m => m.id!)
      );

      // Cache results
      await this.cache.set(cacheKey, emails, { ttl: 300 }); // 5 min cache

      return { success: true, data: emails };

    } catch (error) {
      return { success: false, error };
    }
  }

  private buildGmailQuery(query: SearchQuery): string {
    // Convert semantic query to Gmail search syntax
    let gmailQuery = '';

    if (query.from) {
      gmailQuery += `from:${query.from} `;
    }

    if (query.to) {
      gmailQuery += `to:${query.to} `;
    }

    if (query.after) {
      gmailQuery += `after:${query.after} `;
    }

    if (query.before) {
      gmailQuery += `before:${query.before} `;
    }

    if (query.hasAttachment) {
      gmailQuery += `has:attachment `;
    }

    if (query.isUnread) {
      gmailQuery += `is:unread `;
    }

    if (query.text) {
      gmailQuery += query.text;
    }

    return gmailQuery.trim();
  }

  private buildMimeMessage(params: SendEmailParams): string {
    const boundary = `boundary_${Date.now()}`;

    let message = '';
    message += `From: ${params.from}\r\n`;
    message += `To: ${params.to.join(', ')}\r\n`;
    if (params.cc?.length) {
      message += `Cc: ${params.cc.join(', ')}\r\n`;
    }
    if (params.bcc?.length) {
      message += `Bcc: ${params.bcc.join(', ')}\r\n`;
    }
    message += `Subject: ${params.subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;
    message += `\r\n`;

    // Plain text part
    message += `--${boundary}\r\n`;
    message += `Content-Type: text/plain; charset="UTF-8"\r\n`;
    message += `\r\n`;
    message += `${params.body.text}\r\n`;

    // HTML part
    if (params.body.html) {
      message += `--${boundary}\r\n`;
      message += `Content-Type: text/html; charset="UTF-8"\r\n`;
      message += `\r\n`;
      message += `${params.body.html}\r\n`;
    }

    message += `--${boundary}--`;

    return message;
  }
}
```

### Week 3, Day 5-6: Webhook Processing

```typescript
// src/modules/email/webhooks/GmailWebhookProcessor.ts
export class GmailWebhookProcessor {
  constructor(
    private emailService: EmailService,
    private eventStore: IEventStore
  ) {}

  async setupWebhook(userId: string): Promise<void> {
    // Gmail uses Pub/Sub for webhooks
    const gmail = this.getGmailClient(userId);

    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${PROJECT_ID}/topics/gmail-webhook`,
        labelIds: ['INBOX', 'SENT']
      }
    });

    // Store webhook expiration for renewal
    await this.storeWebhookExpiration(userId, response.data.expiration);
  }

  async processWebhook(payload: PubSubMessage): Promise<void> {
    const data = JSON.parse(Buffer.from(payload.data, 'base64').toString());

    // Gmail webhook only notifies of changes, need to fetch actual changes
    const historyId = data.historyId;
    const userId = data.emailAddress;

    // Get changes since last known history ID
    const lastHistoryId = await this.getLastHistoryId(userId);
    const changes = await this.getHistoryChanges(userId, lastHistoryId, historyId);

    // Process each change
    for (const change of changes) {
      if (change.messagesAdded) {
        await this.processNewEmails(userId, change.messagesAdded);
      }

      if (change.messagesDeleted) {
        await this.processDeletedEmails(userId, change.messagesDeleted);
      }

      if (change.labelsAdded || change.labelsRemoved) {
        await this.processLabelChanges(userId, change);
      }
    }

    // Update last known history ID
    await this.updateLastHistoryId(userId, historyId);
  }

  private async processNewEmails(userId: string, messages: any[]): Promise<void> {
    for (const message of messages) {
      // Fetch full message
      const email = await this.emailService.getEmail(message.id);

      // Emit event
      await this.eventStore.append(new EmailReceivedEvent({
        aggregateId: email.id,
        userId: userId,
        from: email.from,
        subject: email.subject,
        timestamp: Date.now()
      }));

      // Check if this is a response to a monitored thread
      if (email.threadId) {
        await this.checkMonitoredThread(email.threadId, email);
      }
    }
  }
}
```

### Week 4, Day 1-2: Outlook OAuth & Provider

```typescript
// src/modules/email/providers/outlook/OutlookProvider.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';

export class OutlookProvider implements IEmailProvider {
  private graphClient: Client;

  constructor(
    private tokens: TokenSet,
    private eventStore: IEventStore
  ) {
    this.graphClient = Client.initWithMiddleware({
      authProvider: new CustomAuthProvider(tokens)
    });
  }

  async sendEmail(params: SendEmailParams): Promise<Result<EmailId>> {
    try {
      const message = {
        subject: params.subject,
        body: {
          contentType: params.body.html ? 'HTML' : 'Text',
          content: params.body.html || params.body.text
        },
        toRecipients: params.to.map(email => ({
          emailAddress: { address: email }
        })),
        ccRecipients: params.cc?.map(email => ({
          emailAddress: { address: email }
        })),
        importance: params.importance || 'normal'
      };

      // Send via Microsoft Graph API
      const response = await this.graphClient
        .api('/me/sendMail')
        .post({ message, saveToSentItems: true });

      const emailId = EmailId(response.id);

      // Emit event
      await this.eventStore.append(new EmailSentEvent({
        aggregateId: emailId,
        userId: params.userId,
        to: params.to,
        subject: params.subject,
        timestamp: Date.now()
      }));

      return { success: true, data: emailId };

    } catch (error) {
      if (error.statusCode === 429) {
        // Rate limited - Outlook has 10,000 requests per 10 minutes
        return { success: false, error: new RateLimitError() };
      }

      return { success: false, error };
    }
  }

  async searchEmails(query: SearchQuery): Promise<Result<Email[]>> {
    try {
      // Build OData filter
      let filter = '';

      if (query.from) {
        filter += `from/emailAddress/address eq '${query.from}'`;
      }

      if (query.subject) {
        filter += filter ? ' and ' : '';
        filter += `contains(subject, '${query.subject}')`;
      }

      if (query.after) {
        filter += filter ? ' and ' : '';
        filter += `receivedDateTime ge ${query.after.toISOString()}`;
      }

      // Search via Graph API
      const response = await this.graphClient
        .api('/me/messages')
        .filter(filter)
        .select('id,subject,from,toRecipients,body,receivedDateTime')
        .orderby('receivedDateTime desc')
        .top(query.limit || 50)
        .get();

      const emails = response.value.map(this.transformOutlookEmail);

      return { success: true, data: emails };

    } catch (error) {
      return { success: false, error };
    }
  }
}
```

### Week 4, Day 3-4: Thread Monitoring & Smart Features

```typescript
// src/modules/email/services/ThreadMonitor.ts
export class ThreadMonitor {
  private monitors: Map<ThreadId, ThreadMonitorConfig> = new Map();

  constructor(
    private emailService: EmailService,
    private eventStore: IEventStore
  ) {}

  async monitorThread(
    threadId: ThreadId,
    config: ThreadMonitorConfig
  ): Promise<void> {
    this.monitors.set(threadId, config);

    // Set up polling or webhook-based monitoring
    if (config.realtime) {
      // Webhook already set up, just track
      await this.trackThread(threadId);
    } else {
      // Set up polling
      this.schedulePolling(threadId, config.pollInterval || 60000);
    }
  }

  async checkForResponse(threadId: ThreadId): Promise<void> {
    const config = this.monitors.get(threadId);
    if (!config) return;

    // Get latest emails in thread
    const thread = await this.emailService.getThread(threadId);
    const lastEmail = thread.emails[thread.emails.length - 1];

    // Check if new email matches response criteria
    if (this.isResponse(lastEmail, config)) {
      // Emit event
      await this.eventStore.append(new ThreadResponseReceived({
        threadId,
        responseId: lastEmail.id,
        from: lastEmail.from,
        timestamp: Date.now()
      }));

      // Execute callback
      if (config.onResponse) {
        await config.onResponse(lastEmail);
      }

      // Stop monitoring if configured
      if (config.stopAfterResponse) {
        this.stopMonitoring(threadId);
      }
    }
  }

  private isResponse(email: Email, config: ThreadMonitorConfig): boolean {
    // Check if email is from expected sender
    if (config.expectedFrom && email.from !== config.expectedFrom) {
      return false;
    }

    // Check if email contains expected keywords
    if (config.expectedKeywords) {
      const content = `${email.subject} ${email.body.text}`.toLowerCase();
      const hasKeywords = config.expectedKeywords.some(keyword =>
        content.includes(keyword.toLowerCase())
      );

      if (!hasKeywords) return false;
    }

    // Check if email is newer than monitoring started
    if (email.receivedAt <= config.startedAt) {
      return false;
    }

    return true;
  }
}
```

### Week 4, Day 5-6: Performance Optimization & Testing

```typescript
// src/modules/email/optimization/EmailBatcher.ts
export class EmailBatcher {
  private batchQueue: Map<string, BatchRequest> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;

  async batchGetEmails(ids: string[]): Promise<Email[]> {
    // Gmail allows batch requests up to 100 emails
    const batches = this.chunk(ids, 100);

    const results = await Promise.all(
      batches.map(batch => this.executeBatch(batch))
    );

    return results.flat();
  }

  private async executeBatch(ids: string[]): Promise<Email[]> {
    // Use Gmail batch API
    const batch = gapi.client.newBatch();

    ids.forEach((id, index) => {
      batch.add(
        this.gmail.users.messages.get({
          userId: 'me',
          id: id,
          format: 'full'
        }),
        { id: `email_${index}` }
      );
    });

    const response = await batch.execute();

    return Object.values(response.result)
      .map(this.transformGmailMessage)
      .filter(email => email !== null);
  }
}

// src/modules/email/cache/EmailCache.ts
export class EmailCache {
  private l1: LRUCache<string, Email>;
  private l2: RedisCache;

  constructor() {
    this.l1 = new LRUCache({
      max: 1000, // Keep 1000 emails in memory
      ttl: 1000 * 60 * 5 // 5 minutes
    });
  }

  async get(key: string): Promise<Email | null> {
    // L1 check (instant)
    const l1Hit = this.l1.get(key);
    if (l1Hit) {
      this.metrics.recordHit('L1');
      return l1Hit;
    }

    // L2 check (fast)
    const l2Hit = await this.l2.get(key);
    if (l2Hit) {
      this.metrics.recordHit('L2');
      this.l1.set(key, l2Hit); // Promote to L1
      return l2Hit;
    }

    this.metrics.recordMiss();
    return null;
  }

  async set(key: string, value: Email, options?: CacheOptions): Promise<void> {
    // Write to both layers
    this.l1.set(key, value);
    await this.l2.set(key, value, options?.ttl || 3600); // 1 hour default
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear L1
    for (const key of this.l1.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.l1.delete(key);
      }
    }

    // Clear L2
    await this.l2.deletePattern(pattern);
  }
}
```

## 🧪 Testing Strategy

```typescript
// src/modules/email/__tests__/EmailService.test.ts
describe('EmailService', () => {
  let service: EmailService;
  let mockEventStore: MockEventStore;

  beforeEach(() => {
    mockEventStore = new MockEventStore();
    service = new EmailService(mockEventStore);
  });

  describe('Performance', () => {
    it('should respond to cached requests in <100ms', async () => {
      // Warm cache
      await service.searchEmails({ text: 'test' });

      // Test cached response
      const start = performance.now();
      await service.searchEmails({ text: 'test' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle 1000 concurrent requests', async () => {
      const requests = Array(1000).fill(null).map((_, i) =>
        service.sendEmail({
          to: [`test${i}@example.com`],
          subject: `Test ${i}`,
          body: { text: 'Test' }
        })
      );

      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled');

      expect(successful.length).toBeGreaterThan(950); // 95% success rate
    });
  });

  describe('OAuth Flow', () => {
    it('should refresh expired tokens automatically', async () => {
      // Set expired token
      const expiredToken = {
        accessToken: 'expired',
        expiresAt: Date.now() - 1000
      };

      service.setTokens(expiredToken);

      // Should refresh and retry
      const result = await service.sendEmail(testEmail);

      expect(result.success).toBe(true);
      expect(mockOAuth.refreshAccessToken).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should retry on rate limit with exponential backoff', async () => {
      mockProvider.sendEmail
        .mockRejectedValueOnce({ code: 429 })
        .mockRejectedValueOnce({ code: 429 })
        .mockResolvedValueOnce({ success: true });

      const result = await service.sendEmail(testEmail);

      expect(result.success).toBe(true);
      expect(mockProvider.sendEmail).toHaveBeenCalledTimes(3);
    });
  });
});
```

## 📊 Performance Requirements

```typescript
const performanceRequirements = {
  latency: {
    sendEmail: {
      p50: "<300ms",
      p95: "<500ms",
      p99: "<1000ms"
    },
    searchEmails: {
      cached: {
        p50: "<50ms",
        p95: "<100ms",
        p99: "<200ms"
      },
      fresh: {
        p50: "<200ms",
        p95: "<300ms",
        p99: "<500ms"
      }
    }
  },

  throughput: {
    sendEmail: ">100 req/s",
    searchEmails: ">500 req/s",
    webhookProcessing: ">1000 events/s"
  },

  reliability: {
    uptime: "99.9%",
    errorRate: "<0.1%",
    dataLoss: "0%"
  }
};
```

## ✅ Weekly Deliverables

### Week 3 Deliverables
- [ ] Gmail OAuth flow complete with refresh tokens
- [ ] Gmail send email working
- [ ] Gmail search working
- [ ] Gmail webhook setup
- [ ] Basic caching implemented

### Week 4 Deliverables
- [ ] Outlook OAuth flow complete
- [ ] Outlook send/search working
- [ ] Thread monitoring system
- [ ] Advanced caching with invalidation
- [ ] Performance optimization complete
- [ ] 90% test coverage achieved

### Week 5 Deliverables
- [ ] Batch operations optimized
- [ ] Offline queue implemented
- [ ] Rate limiting handled
- [ ] Error recovery complete

### Week 6 Deliverables
- [ ] Full integration testing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Ready for integration

## 🚨 Error Handling & Recovery

```typescript
export class EmailError extends Error {
  constructor(
    message: string,
    public code: EmailErrorCode,
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export enum EmailErrorCode {
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  ATTACHMENT_TOO_LARGE = 'ATTACHMENT_TOO_LARGE',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR'
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error) || attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }

  throw lastError;
}
```

## ⚡ Enhanced Rate Limiting

```typescript
class AdvancedRateLimiter {
  // Gmail: 250 quota units/sec, different costs per operation
  private readonly GMAIL_COSTS = {
    send: 100,        // High cost
    get: 5,           // Medium cost
    list: 5,          // Medium cost
    modify: 5,        // Medium cost
    watch: 10,        // Medium-high cost
    batchGet: 50      // High cost for batch
  };

  // Outlook: 10,000 requests per 10 minutes
  private readonly OUTLOOK_LIMITS = {
    windowMs: 10 * 60 * 1000,  // 10 minutes
    maxRequests: 10000,
    burstLimit: 4               // Max concurrent requests
  };

  async executeGmailOperation<T>(
    operation: () => Promise<T>,
    operationType: keyof typeof GMAIL_COSTS
  ): Promise<T> {
    const cost = this.GMAIL_COSTS[operationType];

    // Check if we have quota
    const currentUsage = await this.getCurrentUsage('gmail');
    if (currentUsage + cost > 250) {
      // Wait for next second
      const msUntilNextSecond = 1000 - (Date.now() % 1000);
      await sleep(msUntilNextSecond);
    }

    // Track usage
    await this.incrementUsage('gmail', cost);

    try {
      return await operation();
    } catch (error) {
      if (error.code === 429) {
        // Exponential backoff on rate limit
        await this.handleRateLimit('gmail');
        return this.executeGmailOperation(operation, operationType);
      }
      throw error;
    }
  }
}
```

## 📊 Monitoring & Observability

```typescript
import { metrics } from '@tide/metrics';
import { logger } from '@tide/logger';
import { tracer } from '@tide/tracing';

class MonitoredEmailService extends EmailService {
  async sendEmail(params: SendEmailParams): Promise<Result<EmailId>> {
    const span = tracer.startSpan('email.send', {
      attributes: {
        'email.provider': params.provider,
        'email.recipients': params.to.length,
        'email.has_attachments': !!params.attachments?.length
      }
    });

    const timer = metrics.startTimer('email.send.duration');

    try {
      const result = await super.sendEmail(params);

      // Success metrics
      metrics.increment('email.sent', {
        provider: params.provider,
        priority: params.priority || 'normal'
      });

      logger.info('Email sent successfully', {
        emailId: result.data,
        userId: params.userId,
        duration: timer.end()
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;

    } catch (error) {
      // Error metrics
      metrics.increment('email.failed', {
        provider: params.provider,
        errorCode: error.code || 'unknown'
      });

      logger.error('Failed to send email', {
        error,
        userId: params.userId,
        duration: timer.end()
      });

      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;

    } finally {
      span.end();
    }
  }

  // Dashboard metrics
  async getMetrics(): Promise<EmailMetrics> {
    return {
      sentToday: metrics.getCounter('email.sent'),
      failedToday: metrics.getCounter('email.failed'),
      avgLatency: metrics.getAverage('email.send.duration'),
      p95Latency: metrics.getPercentile('email.send.duration', 95),
      cacheHitRate: metrics.getRate('email.cache.hit'),
      rateLimitHits: metrics.getCounter('email.rate_limited')
    };
  }
}
```

## 🔄 Graceful Degradation

```typescript
class ResilientEmailService {
  async sendEmailWithFallback(params: SendEmailParams): Promise<Result<EmailId>> {
    // Try primary provider
    try {
      return await this.sendViaProvider(params, params.provider);
    } catch (primaryError) {
      logger.warn('Primary provider failed, trying fallback', {
        provider: params.provider,
        error: primaryError
      });

      // Try fallback provider if available
      const fallbackProvider = this.getFallbackProvider(params.provider);
      if (fallbackProvider && params.allowFallback !== false) {
        try {
          return await this.sendViaProvider(params, fallbackProvider);
        } catch (fallbackError) {
          logger.error('Fallback provider also failed', {
            provider: fallbackProvider,
            error: fallbackError
          });
        }
      }

      // Queue for retry if all providers fail
      if (params.allowQueuing !== false) {
        await this.queueForRetry(params);
        return {
          success: false,
          error: new EmailError(
            'Email queued for retry',
            EmailErrorCode.PROVIDER_ERROR,
            true
          )
        };
      }

      throw primaryError;
    }
  }

  async searchEmailsWithDegradation(query: SearchQuery): Promise<Result<Email[]>> {
    // Try full search
    try {
      return await this.searchEmailsFull(query);
    } catch (error) {
      logger.warn('Full search failed, degrading to cache-only', { error });

      // Degrade to cache-only search
      const cached = await this.searchCacheOnly(query);
      if (cached.data.length > 0) {
        return {
          success: true,
          data: cached.data,
          degraded: true,
          warning: 'Results from cache only, may be incomplete'
        };
      }

      // Degrade further to basic metadata search
      return await this.searchMetadataOnly(query);
    }
  }

  private async searchCacheOnly(query: SearchQuery): Promise<Result<Email[]>> {
    const cacheKeys = await this.cache.keys(`email:*`);
    const emails = await Promise.all(
      cacheKeys.map(key => this.cache.get(key))
    );

    // Filter in memory
    const filtered = emails.filter(email =>
      this.matchesQuery(email, query)
    );

    return {
      success: true,
      data: filtered,
      fromCache: true
    };
  }
}
```

## 🧪 Comprehensive Testing Strategy

```typescript
// Performance benchmarks
describe('Performance Benchmarks', () => {
  it('should handle burst traffic', async () => {
    const results = await loadTest({
      concurrent: 100,
      duration: 60000,
      rampUp: 5000,
      operation: () => service.sendEmail(generateTestEmail())
    });

    expect(results.successRate).toBeGreaterThan(0.95);
    expect(results.p95).toBeLessThan(500);
  });
});

// Chaos testing
describe('Chaos Engineering', () => {
  it('should handle provider outage', async () => {
    // Simulate Gmail outage
    mockGmail.fail();

    const result = await service.sendEmail({
      ...testEmail,
      provider: 'gmail',
      allowFallback: true
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('outlook'); // Fallback
  });

  it('should handle intermittent network issues', async () => {
    // Simulate 50% packet loss
    mockNetwork.setPacketLoss(0.5);

    const results = await Promise.allSettled(
      Array(10).fill(null).map(() => service.sendEmail(testEmail))
    );

    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful.length).toBeGreaterThan(7); // 70% success with retries
  });
});

// Contract testing
describe('Provider Contracts', () => {
  const providers = ['gmail', 'outlook'];

  providers.forEach(provider => {
    describe(`${provider} provider`, () => {
      it('should implement IEmailProvider', () => {
        const instance = createProvider(provider);
        expect(instance).toMatchInterface(IEmailProvider);
      });

      it('should handle auth refresh', async () => {
        const instance = createProvider(provider);
        const newTokens = await instance.refreshAccessToken('refresh_token');
        expect(newTokens.accessToken).toBeDefined();
      });
    });
  });
});
```

## 🚨 Critical Implementation Notes

1. **NO Nylas/SendGrid** - Direct Gmail/Outlook APIs only (saves $49/user/month)
2. **Token Management** - Always store refresh tokens encrypted
3. **Rate Limiting** - Gmail: 250 req/s, Outlook: 10k/10min
4. **Webhook Security** - Verify all webhook signatures
5. **Event Sourcing** - Every state change emits an event
6. **Cache Invalidation** - Clear cache when emails change
7. **Offline Support** - Queue operations when offline
8. **MIME Formatting** - Proper MIME for HTML emails
9. **Thread Tracking** - Maintain thread context
10. **Error Recovery** - Exponential backoff with jitter

## 📚 Required Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Microsoft Graph Mail API](https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- Module 00 contracts and types
- MockEventStore for testing

## 🏁 Definition of Done

- [ ] All IEmailService methods implemented
- [ ] OAuth flows working for both providers
- [ ] Webhooks processing in real-time
- [ ] Caching strategy implemented
- [ ] Performance targets met
- [ ] 90% test coverage
- [ ] Events emitted for all operations
- [ ] Documentation complete
- [ ] Integration tests passing
- [ ] Ready for Phase 2 integration

Remember: Email is the core of the product. Users judge the entire app by how well email works. Make it flawless.