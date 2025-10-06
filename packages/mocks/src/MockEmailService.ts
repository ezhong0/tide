/**
 * Realistic Mock Email Service Implementation
 * Maintains state, simulates latency, handles errors
 */

import { IEmailService, SendEmailParams, OperationResult } from '@tide/contracts';
import {
  Result, Ok, Err, Email, EmailId, ThreadId, UserId, UUID, Timestamp,
  EmailDomain, EmailQuery, DraftEmailParams, DraftContext, DraftSuggestion,
  EmailResponse, EmailAction, EmailTemplate, EmailAnalytics, EmailSyncStatus,
  EmailContact, ToneAnalysis, ImportanceScore, EmailCategory
} from '@tide/types';

export class MockEmailService implements IEmailService {
  private emails: Map<EmailId, EmailDomain> = new Map();
  private threads: Map<ThreadId, EmailId[]> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private syncStatus: Map<UserId, EmailSyncStatus> = new Map();
  private threadMonitors: Map<ThreadId, ((response: EmailResponse) => void)[]> = new Map();

  // Simulated latency ranges (ms)
  private latency = {
    send: { min: 200, max: 500 },
    search: { min: 50, max: 100 },
    get: { min: 20, max: 50 },
    update: { min: 30, max: 100 }
  };

  // Rate limiting simulation
  private sendCount = 0;
  private lastSendTime = 0;
  private readonly maxSendsPerMinute = 30;

  async sendEmail(params: SendEmailParams): Promise<Result<EmailId>> {
    await this.simulateLatency('send');

    // Validate email addresses
    for (const to of params.to) {
      if (!this.isValidEmail(to.email)) {
        return Err(new Error(`Invalid email address: ${to.email}`));
      }
    }

    // Simulate rate limiting
    if (this.isSendingTooFast()) {
      return Err(new Error('Rate limit exceeded. Please wait before sending more emails.'));
    }

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return Err(new Error('Failed to connect to email provider'));
    }

    const emailId = EmailId(this.generateId());
    const threadId = params.threadId || ThreadId(this.generateId());
    const now = Timestamp(Date.now());

    const email: EmailDomain = {
      emailId,
      userId: params.userId,
      threadId,
      messageId: `<${emailId}@tide.ai>`,
      provider: params.provider,
      status: 'sent',
      priority: params.priority || 'normal',
      category: this.categorizeEmail(params),
      from: params.from,
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      body: params.body,
      snippet: this.generateSnippet(params.body.text),
      attachments: params.attachments,
      inReplyTo: params.replyTo,
      threadPosition: this.getThreadPosition(threadId),
      createdAt: now,
      sentAt: now,
      isRead: false,
      isStarred: false,
      isImportant: this.isImportant(params),
      isArchived: false,
      isDeleted: false,
      isDraft: false,
      tone: this.analyzeTone(params.body.text),
      importance: this.calculateImportance(params)
    };

    this.emails.set(emailId, email);
    this.updateThread(threadId, emailId);
    this.updateSendCount();

    // Simulate sending to recipients (would trigger incoming email for them)
    await this.simulateRecipientReceive(email);

    return Ok(emailId);
  }

  async scheduleEmail(params: SendEmailParams, scheduledFor: number): Promise<Result<EmailId>> {
    await this.simulateLatency('update');

    const emailId = EmailId(this.generateId());
    const threadId = params.threadId || ThreadId(this.generateId());
    const now = Timestamp(Date.now());

    const email: EmailDomain = {
      emailId,
      userId: params.userId,
      threadId,
      messageId: '',
      provider: params.provider,
      status: 'draft',
      priority: params.priority || 'normal',
      category: 'work',
      from: params.from,
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      body: params.body,
      snippet: this.generateSnippet(params.body.text),
      attachments: params.attachments,
      threadPosition: 0,
      createdAt: now,
      isRead: true,
      isStarred: false,
      isImportant: false,
      isArchived: false,
      isDeleted: false,
      isDraft: true
    };

    this.emails.set(emailId, email);

    // Simulate scheduling
    setTimeout(async () => {
      email.status = 'sent';
      email.sentAt = Timestamp(Date.now());
      email.isDraft = false;
      this.emails.set(emailId, email);
    }, scheduledFor - Date.now());

    return Ok(emailId);
  }

  async createDraft(params: DraftEmailParams): Promise<Result<EmailId>> {
    await this.simulateLatency('update');

    const emailId = EmailId(this.generateId());
    const threadId = params.threadId || ThreadId(this.generateId());
    const now = Timestamp(Date.now());

    const email: EmailDomain = {
      emailId,
      userId: UserId('mock-user'),
      threadId,
      messageId: '',
      provider: 'gmail',
      status: 'draft',
      priority: params.priority || 'normal',
      category: 'work',
      from: { email: Email('user@tide.ai'), name: 'User' },
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      body: params.body,
      snippet: this.generateSnippet(params.body.text),
      attachments: params.attachments,
      threadPosition: 0,
      createdAt: now,
      isRead: true,
      isStarred: false,
      isImportant: false,
      isArchived: false,
      isDeleted: false,
      isDraft: true
    };

    this.emails.set(emailId, email);
    return Ok(emailId);
  }

  async updateDraft(emailId: EmailId, updates: Partial<DraftEmailParams>): Promise<Result<EmailDomain>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    if (!email.isDraft) {
      return Err(new Error('Cannot update non-draft email'));
    }

    // Apply updates
    if (updates.to) email.to = updates.to;
    if (updates.cc) email.cc = updates.cc;
    if (updates.bcc) email.bcc = updates.bcc;
    if (updates.subject) email.subject = updates.subject;
    if (updates.body) {
      email.body = updates.body;
      email.snippet = this.generateSnippet(updates.body.text);
    }
    if (updates.attachments) email.attachments = updates.attachments;

    this.emails.set(emailId, email);
    return Ok(email);
  }

  async searchEmails(query: EmailQuery): Promise<Result<EmailDomain[]>> {
    await this.simulateLatency('search');

    let results = Array.from(this.emails.values())
      .filter(email => email.userId === query.userId);

    // Apply filters
    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(email => {
        const content = `${email.subject} ${email.body.text} ${email.from.email}`.toLowerCase();
        return content.includes(searchText);
      });
    }

    if (query.from) {
      results = results.filter(email => email.from.email === query.from);
    }

    if (query.to) {
      results = results.filter(email =>
        email.to.some(recipient => recipient.email === query.to)
      );
    }

    if (query.subject) {
      results = results.filter(email =>
        email.subject.toLowerCase().includes(query.subject.toLowerCase())
      );
    }

    if (query.hasAttachment !== undefined) {
      results = results.filter(email =>
        query.hasAttachment ? (email.attachments && email.attachments.length > 0) : true
      );
    }

    if (query.isUnread !== undefined) {
      results = results.filter(email => !email.isRead === query.isUnread);
    }

    if (query.isStarred !== undefined) {
      results = results.filter(email => email.isStarred === query.isStarred);
    }

    if (query.category) {
      results = results.filter(email => email.category === query.category);
    }

    if (query.dateRange) {
      results = results.filter(email =>
        email.createdAt >= query.dateRange!.start &&
        email.createdAt <= query.dateRange!.end
      );
    }

    // Sort by date descending
    results.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    results = results.slice(offset, offset + limit);

    return Ok(results);
  }

  async getEmail(emailId: EmailId): Promise<Result<EmailDomain>> {
    await this.simulateLatency('get');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    return Ok(email);
  }

  async getThread(threadId: ThreadId): Promise<Result<EmailDomain[]>> {
    await this.simulateLatency('get');

    const emailIds = this.threads.get(threadId) || [];
    const emails = emailIds
      .map(id => this.emails.get(id))
      .filter(email => email !== undefined) as EmailDomain[];

    // Sort chronologically
    emails.sort((a, b) => a.createdAt - b.createdAt);

    return Ok(emails);
  }

  async monitorThread(
    threadId: ThreadId,
    callback: (response: EmailResponse) => void
  ): Promise<Result<() => void>> {
    await this.simulateLatency('get');

    // Add callback to monitors
    if (!this.threadMonitors.has(threadId)) {
      this.threadMonitors.set(threadId, []);
    }
    this.threadMonitors.get(threadId)!.push(callback);

    // Return unsubscribe function
    const unsubscribe = () => {
      const callbacks = this.threadMonitors.get(threadId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };

    // Simulate receiving a response after random delay
    setTimeout(() => {
      this.simulateIncomingEmail(threadId);
    }, Math.random() * 60000 + 5000); // 5-65 seconds

    return Ok(unsubscribe);
  }

  async getDraftSuggestions(context: DraftContext): Promise<Result<DraftSuggestion[]>> {
    await this.simulateLatency('search');

    // Simulate AI-generated suggestions
    const suggestions: DraftSuggestion[] = [];

    // Formal version
    suggestions.push({
      subject: context.subject || `Re: ${context.context}`,
      body: this.generateFormalEmail(context),
      tone: {
        formality: 0.9,
        urgency: 0.3,
        sentiment: 0.6,
        confidence: 0.85
      },
      confidence: 0.85
    });

    // Casual version
    suggestions.push({
      subject: context.subject || `Re: ${context.context}`,
      body: this.generateCasualEmail(context),
      tone: {
        formality: 0.3,
        urgency: 0.3,
        sentiment: 0.7,
        confidence: 0.82
      },
      confidence: 0.82
    });

    // Brief version
    suggestions.push({
      subject: context.subject || `Re: ${context.context}`,
      body: this.generateBriefEmail(context),
      tone: {
        formality: 0.5,
        urgency: 0.4,
        sentiment: 0.6,
        confidence: 0.78
      },
      confidence: 0.78
    });

    return Ok(suggestions);
  }

  async markAsRead(emailId: EmailId): Promise<Result<void>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    email.isRead = true;
    email.readAt = Timestamp(Date.now());
    this.emails.set(emailId, email);

    return Ok(undefined);
  }

  async markAsUnread(emailId: EmailId): Promise<Result<void>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    email.isRead = false;
    email.readAt = undefined;
    this.emails.set(emailId, email);

    return Ok(undefined);
  }

  async starEmail(emailId: EmailId): Promise<Result<void>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    email.isStarred = true;
    this.emails.set(emailId, email);

    return Ok(undefined);
  }

  async unstarEmail(emailId: EmailId): Promise<Result<void>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    email.isStarred = false;
    this.emails.set(emailId, email);

    return Ok(undefined);
  }

  async archiveEmail(emailId: EmailId): Promise<Result<void>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    email.isArchived = true;
    this.emails.set(emailId, email);

    return Ok(undefined);
  }

  async deleteEmail(emailId: EmailId, permanent?: boolean): Promise<Result<void>> {
    await this.simulateLatency('update');

    if (permanent) {
      this.emails.delete(emailId);
    } else {
      const email = this.emails.get(emailId);
      if (!email) {
        return Err(new Error('Email not found'));
      }
      email.isDeleted = true;
      this.emails.set(emailId, email);
    }

    return Ok(undefined);
  }

  async labelEmail(emailId: EmailId, labels: string[]): Promise<Result<void>> {
    await this.simulateLatency('update');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    email.labels = labels;
    this.emails.set(emailId, email);

    return Ok(undefined);
  }

  async getSuggestedActions(emailId: EmailId): Promise<Result<EmailAction[]>> {
    await this.simulateLatency('search');

    const email = this.emails.get(emailId);
    if (!email) {
      return Err(new Error('Email not found'));
    }

    const actions: EmailAction[] = [];

    // Suggest reply if it's received
    if (!email.isDraft && email.from.email !== Email('user@tide.ai')) {
      actions.push({
        type: 'reply',
        reason: 'This email appears to require a response',
        confidence: 0.85,
        suggestedContent: 'Thank you for your email. I will review and respond shortly.'
      });
    }

    // Suggest archiving if old
    if (Date.now() - email.createdAt > 7 * 24 * 60 * 60 * 1000) {
      actions.push({
        type: 'archive',
        reason: 'This email is over a week old',
        confidence: 0.7
      });
    }

    // Suggest scheduling if contains meeting keywords
    if (email.body.text.toLowerCase().includes('meeting') ||
        email.body.text.toLowerCase().includes('schedule')) {
      actions.push({
        type: 'schedule',
        reason: 'This email mentions scheduling',
        confidence: 0.75
      });
    }

    return Ok(actions);
  }

  async createTemplate(template: Omit<EmailTemplate, 'templateId' | 'createdAt'>): Promise<Result<string>> {
    await this.simulateLatency('update');

    const templateId = this.generateId();
    const fullTemplate: EmailTemplate = {
      ...template,
      templateId: UUID(templateId),
      createdAt: Timestamp(Date.now()),
      usageCount: 0
    };

    this.templates.set(templateId, fullTemplate);
    return Ok(templateId);
  }

  async getTemplates(userId: UserId): Promise<Result<EmailTemplate[]>> {
    await this.simulateLatency('get');

    const templates = Array.from(this.templates.values())
      .filter(t => t.userId === userId);

    return Ok(templates);
  }

  async getAnalytics(
    userId: UserId,
    startDate: number,
    endDate: number
  ): Promise<Result<EmailAnalytics>> {
    await this.simulateLatency('search');

    const userEmails = Array.from(this.emails.values())
      .filter(email =>
        email.userId === userId &&
        email.createdAt >= startDate &&
        email.createdAt <= endDate
      );

    const analytics: EmailAnalytics = {
      userId,
      period: { start: Timestamp(startDate), end: Timestamp(endDate) },
      sent: userEmails.filter(e => e.status === 'sent').length,
      received: userEmails.filter(e => e.from.email !== Email('user@tide.ai')).length,
      averageResponseTime: 3600000, // 1 hour in ms
      topSenders: this.getTopSenders(userEmails),
      topRecipients: this.getTopRecipients(userEmails),
      categoryBreakdown: this.getCategoryBreakdown(userEmails),
      peakHours: [9, 10, 14, 15, 16],
      threadCount: new Set(userEmails.map(e => e.threadId)).size,
      averageThreadLength: 3.5
    };

    return Ok(analytics);
  }

  async syncEmails(userId: UserId, fullSync?: boolean): Promise<Result<EmailSyncStatus>> {
    await this.simulateLatency('update');

    const status: EmailSyncStatus = {
      userId,
      provider: 'gmail',
      lastSync: Timestamp(Date.now() - 3600000),
      nextSync: Timestamp(Date.now() + 300000),
      status: 'syncing',
      totalEmails: this.emails.size,
      syncedEmails: this.emails.size,
      error: undefined
    };

    this.syncStatus.set(userId, status);

    // Simulate sync completion
    setTimeout(() => {
      status.status = 'idle';
      status.lastSync = Timestamp(Date.now());
      this.syncStatus.set(userId, status);
    }, 2000);

    return Ok(status);
  }

  async getSyncStatus(userId: UserId): Promise<Result<EmailSyncStatus>> {
    await this.simulateLatency('get');

    const status = this.syncStatus.get(userId) || {
      userId,
      provider: 'gmail',
      lastSync: Timestamp(Date.now()),
      nextSync: Timestamp(Date.now() + 300000),
      status: 'idle',
      totalEmails: this.emails.size,
      syncedEmails: this.emails.size
    };

    return Ok(status);
  }

  async replyToEmail(emailId: EmailId, replyParams: DraftEmailParams): Promise<Result<EmailId>> {
    await this.simulateLatency('update');

    const originalEmail = this.emails.get(emailId);
    if (!originalEmail) {
      return Err(new Error('Original email not found'));
    }

    const params: SendEmailParams = {
      userId: originalEmail.userId,
      from: { email: Email('user@tide.ai'), name: 'User' },
      to: [originalEmail.from],
      subject: `Re: ${originalEmail.subject}`,
      body: replyParams.body,
      provider: 'gmail',
      replyTo: emailId,
      threadId: originalEmail.threadId
    };

    return this.sendEmail(params);
  }

  async forwardEmail(emailId: EmailId, forwardParams: DraftEmailParams): Promise<Result<EmailId>> {
    await this.simulateLatency('update');

    const originalEmail = this.emails.get(emailId);
    if (!originalEmail) {
      return Err(new Error('Original email not found'));
    }

    const params: SendEmailParams = {
      userId: originalEmail.userId,
      from: { email: Email('user@tide.ai'), name: 'User' },
      to: forwardParams.to,
      cc: forwardParams.cc,
      subject: `Fwd: ${originalEmail.subject}`,
      body: {
        text: `${forwardParams.body.text}\n\n---------- Forwarded message ----------\n${originalEmail.body.text}`,
        html: forwardParams.body.html
      },
      provider: 'gmail'
    };

    return this.sendEmail(params);
  }

  async batchOperations(operations: any[]): Promise<Result<OperationResult[]>> {
    await this.simulateLatency('update');

    const results: OperationResult[] = [];

    for (const op of operations) {
      let success = true;
      let error: string | undefined;
      let affectedCount = 0;

      try {
        switch (op.type) {
          case 'markAsRead':
            for (const emailId of op.emailIds) {
              const result = await this.markAsRead(emailId);
              if (result.success) affectedCount++;
              else {
                success = false;
                error = result.error.message;
              }
            }
            break;

          case 'markAsUnread':
            for (const emailId of op.emailIds) {
              const result = await this.markAsUnread(emailId);
              if (result.success) affectedCount++;
            }
            break;

          case 'star':
            for (const emailId of op.emailIds) {
              const result = await this.starEmail(emailId);
              if (result.success) affectedCount++;
            }
            break;

          case 'archive':
            for (const emailId of op.emailIds) {
              const result = await this.archiveEmail(emailId);
              if (result.success) affectedCount++;
            }
            break;

          case 'delete':
            for (const emailId of op.emailIds) {
              const result = await this.deleteEmail(emailId);
              if (result.success) affectedCount++;
            }
            break;
        }
      } catch (e) {
        success = false;
        error = (e as Error).message;
      }

      results.push({
        operation: op,
        success,
        error,
        affectedCount
      });
    }

    return Ok(results);
  }

  // Helper methods

  private async simulateLatency(operation: keyof typeof this.latency): Promise<void> {
    const range = this.latency[operation];
    const delay = Math.random() * (range.max - range.min) + range.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isSendingTooFast(): boolean {
    const now = Date.now();
    if (now - this.lastSendTime < 60000) {
      if (this.sendCount >= this.maxSendsPerMinute) {
        return true;
      }
    } else {
      this.sendCount = 0;
      this.lastSendTime = now;
    }
    return false;
  }

  private updateSendCount(): void {
    this.sendCount++;
    if (this.lastSendTime === 0) {
      this.lastSendTime = Date.now();
    }
  }

  private categorizeEmail(params: SendEmailParams): EmailCategory {
    const subject = params.subject.toLowerCase();
    const body = params.body.text.toLowerCase();

    if (subject.includes('newsletter') || body.includes('unsubscribe')) {
      return 'newsletter';
    }
    if (subject.includes('order') || subject.includes('invoice')) {
      return 'promotional';
    }
    if (params.to.some(t => t.email.includes('@linkedin') || t.email.includes('@facebook'))) {
      return 'social';
    }
    if (subject.includes('update') || subject.includes('notification')) {
      return 'updates';
    }
    if (subject.includes('urgent') || subject.includes('important')) {
      return 'important';
    }
    return 'work';
  }

  private generateSnippet(text: string): string {
    return text.substring(0, 100).replace(/\n/g, ' ').trim() + (text.length > 100 ? '...' : '');
  }

  private analyzeTone(text: string): ToneAnalysis {
    const formal = /dear|sincerely|regards|respectfully/i.test(text);
    const urgent = /urgent|asap|immediately|critical/i.test(text);
    const positive = /thanks|appreciate|great|excellent|wonderful/i.test(text);
    const negative = /unfortunately|problem|issue|concern|disappointed/i.test(text);

    return {
      formality: formal ? 0.8 : 0.3,
      urgency: urgent ? 0.9 : 0.2,
      sentiment: positive ? 0.7 : (negative ? -0.3 : 0.5),
      confidence: 0.75
    };
  }

  private calculateImportance(params: SendEmailParams): ImportanceScore {
    const factors: any[] = [];
    let score = 50;

    // Check sender importance
    if (params.from.email.includes('ceo') || params.from.email.includes('manager')) {
      factors.push({ type: 'sender', weight: 30, reason: 'From important person' });
      score += 30;
    }

    // Check subject keywords
    if (params.subject.toLowerCase().includes('urgent') ||
        params.subject.toLowerCase().includes('important')) {
      factors.push({ type: 'subject', weight: 20, reason: 'Urgent subject' });
      score += 20;
    }

    // Check if it's a reply
    if (params.replyTo) {
      factors.push({ type: 'thread', weight: 10, reason: 'Part of conversation' });
      score += 10;
    }

    return { score: Math.min(100, score), factors };
  }

  private isImportant(params: SendEmailParams): boolean {
    const importance = this.calculateImportance(params);
    return importance.score > 70;
  }

  private getThreadPosition(threadId: ThreadId): number {
    const emails = this.threads.get(threadId) || [];
    return emails.length;
  }

  private updateThread(threadId: ThreadId, emailId: EmailId): void {
    if (!this.threads.has(threadId)) {
      this.threads.set(threadId, []);
    }
    this.threads.get(threadId)!.push(emailId);
  }

  private async simulateRecipientReceive(email: EmailDomain): Promise<void> {
    // In a real system, this would trigger notifications
    // For mock, we just store it
  }

  private simulateIncomingEmail(threadId: ThreadId): void {
    const callbacks = this.threadMonitors.get(threadId) || [];

    if (callbacks.length > 0) {
      const response: EmailResponse = {
        emailId: EmailId(this.generateId()),
        threadId,
        from: { email: Email('colleague@company.com'), name: 'Colleague' },
        subject: 'Re: Your inquiry',
        receivedAt: Timestamp(Date.now()),
        isAutoReply: false,
        requiresAction: true,
        suggestedActions: [{
          type: 'reply',
          reason: 'Response received to your email',
          confidence: 0.9
        }]
      };

      callbacks.forEach(cb => cb(response));
    }
  }

  private generateFormalEmail(context: DraftContext): string {
    return `Dear ${context.recipient.name || 'Sir/Madam'},

I hope this email finds you well. ${context.context}

I would appreciate your consideration of this matter at your earliest convenience.

Best regards,
User`;
  }

  private generateCasualEmail(context: DraftContext): string {
    return `Hi ${context.recipient.name?.split(' ')[0] || 'there'},

${context.context}

Let me know if you need anything else!

Thanks,
User`;
  }

  private generateBriefEmail(context: DraftContext): string {
    return `${context.context}

Please let me know if you have any questions.

Best,
User`;
  }

  private getTopSenders(emails: EmailDomain[]): EmailContact[] {
    const senderCount = new Map<string, EmailContact>();

    emails.forEach(email => {
      if (email.from.email !== Email('user@tide.ai')) {
        const key = email.from.email;
        if (!senderCount.has(key)) {
          senderCount.set(key, email.from);
        }
      }
    });

    return Array.from(senderCount.values()).slice(0, 5);
  }

  private getTopRecipients(emails: EmailDomain[]): EmailContact[] {
    const recipientCount = new Map<string, EmailContact>();

    emails.forEach(email => {
      email.to.forEach(recipient => {
        const key = recipient.email;
        if (!recipientCount.has(key)) {
          recipientCount.set(key, recipient);
        }
      });
    });

    return Array.from(recipientCount.values()).slice(0, 5);
  }

  private getCategoryBreakdown(emails: EmailDomain[]): Record<EmailCategory, number> {
    const breakdown: Record<EmailCategory, number> = {
      personal: 0, work: 0, newsletter: 0, promotional: 0,
      social: 0, updates: 0, forums: 0, important: 0, spam: 0
    };

    emails.forEach(email => {
      breakdown[email.category]++;
    });

    return breakdown;
  }
}