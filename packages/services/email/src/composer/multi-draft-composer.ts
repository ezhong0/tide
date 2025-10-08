import { logger } from '@tide/logger';
import { serviceUrls } from '@tide/config';
import type { UserId } from '@tide/types';

export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  receivedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ComposeContext {
  relationship?: RelationshipContext;
  previousEmails?: Email[];
  userPreferences?: UserPreferences;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  tone?: 'professional' | 'friendly' | 'formal' | 'casual';
}

export interface RelationshipContext {
  contactEmail: string;
  contactName?: string;
  relationshipStrength: number;
  interactionFrequency: string;
  vipStatus: boolean;
}

export interface UserPreferences {
  defaultTone: string;
  signatureEnabled: boolean;
  signature?: string;
  preferredResponseLength: 'brief' | 'balanced' | 'detailed';
}

export interface EmailDraft {
  id?: string;
  version: 'detailed' | 'balanced' | 'brief' | 'custom';
  subject: string;
  body: string;
  wordCount: number;
  confidence: number;
  tone: 'professional' | 'friendly' | 'formal' | 'casual';
  metadata: {
    generatedAt: Date;
    includesSignature: boolean;
    estimatedReadTime: number; // seconds
  };
}

/**
 * Multi-Draft Email Composer
 * Generates 3 versions of email drafts (detailed, balanced, brief) in parallel
 */
export class MultiDraftComposer {
  private aiServiceURL = serviceUrls.ai;

  /**
   * Generate 3 draft versions for an email
   */
  async generateDrafts(
    email: Email,
    context: ComposeContext = {}
  ): Promise<EmailDraft[]> {
    logger.info({ emailId: email.id }, 'Generating multi-draft responses');

    const startTime = Date.now();

    // Generate 3 versions in parallel for performance with graceful degradation
    const results = await Promise.allSettled([
      this.generateDetailed(email, context),
      this.generateBalanced(email, context),
      this.generateBrief(email, context)
    ]);

    // Ensure we always return at least one draft
    const drafts: EmailDraft[] = [];
    if (results[0].status === 'fulfilled') drafts.push(results[0].value);
    if (results[1].status === 'fulfilled') drafts.push(results[1].value);
    if (results[2].status === 'fulfilled') drafts.push(results[2].value);

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const versions = ['detailed', 'balanced', 'brief'];
        logger.warn({ error: result.reason, version: versions[index], emailId: email.id }, 'Failed to generate draft');
      }
    });

    // If all drafts failed, throw error
    if (drafts.length === 0) {
      throw new Error('Failed to generate any email drafts');
    }

    const duration = Date.now() - startTime;
    logger.info({ emailId: email.id, duration, draftCount: drafts.length }, 'Generated drafts');

    return drafts;
  }

  /**
   * Generate detailed response (400-500 words)
   */
  private async generateDetailed(
    email: Email,
    context: ComposeContext
  ): Promise<EmailDraft> {
    const prompt = this.buildPrompt(email, context, 'detailed');

    const response = await this.callAIService(prompt, {
      maxTokens: 600,
      temperature: 0.7,
      targetWordCount: 450
    });

    const body = this.addSignature(response.content, context.userPreferences);

    return {
      version: 'detailed',
      subject: this.generateSubject(email.subject),
      body,
      wordCount: this.countWords(body),
      confidence: response.confidence || 0.9,
      tone: context.tone || 'professional',
      metadata: {
        generatedAt: new Date(),
        includesSignature: !!context.userPreferences?.signatureEnabled,
        estimatedReadTime: Math.ceil(this.countWords(body) / 200 * 60) // 200 wpm
      }
    };
  }

  /**
   * Generate balanced response (150-250 words)
   */
  private async generateBalanced(
    email: Email,
    context: ComposeContext
  ): Promise<EmailDraft> {
    const prompt = this.buildPrompt(email, context, 'balanced');

    const response = await this.callAIService(prompt, {
      maxTokens: 350,
      temperature: 0.7,
      targetWordCount: 200
    });

    const body = this.addSignature(response.content, context.userPreferences);

    return {
      version: 'balanced',
      subject: this.generateSubject(email.subject),
      body,
      wordCount: this.countWords(body),
      confidence: response.confidence || 0.95,
      tone: context.tone || 'professional',
      metadata: {
        generatedAt: new Date(),
        includesSignature: !!context.userPreferences?.signatureEnabled,
        estimatedReadTime: Math.ceil(this.countWords(body) / 200 * 60)
      }
    };
  }

  /**
   * Generate brief response (50-100 words)
   */
  private async generateBrief(
    email: Email,
    context: ComposeContext
  ): Promise<EmailDraft> {
    const prompt = this.buildPrompt(email, context, 'brief');

    const response = await this.callAIService(prompt, {
      maxTokens: 150,
      temperature: 0.6,
      targetWordCount: 75
    });

    const body = this.addSignature(response.content, context.userPreferences);

    return {
      version: 'brief',
      subject: this.generateSubject(email.subject),
      body,
      wordCount: this.countWords(body),
      confidence: response.confidence || 0.85,
      tone: context.tone || 'professional',
      metadata: {
        generatedAt: new Date(),
        includesSignature: !!context.userPreferences?.signatureEnabled,
        estimatedReadTime: Math.ceil(this.countWords(body) / 200 * 60)
      }
    };
  }

  /**
   * Build AI prompt for draft generation
   */
  private buildPrompt(
    email: Email,
    context: ComposeContext,
    version: 'detailed' | 'balanced' | 'brief'
  ): string {
    const wordCountTargets = {
      detailed: '400-500 words',
      balanced: '150-250 words',
      brief: '50-100 words'
    };

    const relationshipContext = context.relationship
      ? `\nRelationship: ${context.relationship.vipStatus ? 'VIP - ' : ''}${context.relationship.interactionFrequency} contact (strength: ${Math.round(context.relationship.relationshipStrength * 100)}%)`
      : '';

    const previousContext = context.previousEmails?.length
      ? `\nPrevious emails in thread: ${context.previousEmails.length}`
      : '';

    return `You are composing a ${version} email response.

Original Email:
From: ${email.from}
Subject: ${email.subject}
Body:
${email.body}
${relationshipContext}${previousContext}

Requirements:
- Length: ${wordCountTargets[version]}
- Tone: ${context.tone || 'professional'}
- Urgency: ${context.urgency || 'medium'}
- Be concise, clear, and actionable
- Address all points from the original email
${version === 'detailed' ? '- Provide thorough explanations and context' : ''}
${version === 'brief' ? '- Use short, direct sentences. Get straight to the point.' : ''}

Generate the email body (do not include subject line):`;
  }

  /**
   * Call AI service for draft generation
   */
  private async callAIService(
    prompt: string,
    options: {
      maxTokens: number;
      temperature: number;
      targetWordCount: number;
    }
  ): Promise<{ content: string; confidence?: number }> {
    try {
      const response = await fetch(`${this.aiServiceURL}/compose/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          max_tokens: options.maxTokens,
          temperature: options.temperature
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = (await response.json()) as { content?: string; draft?: string; confidence?: number };
      return {
        content: result.content || result.draft || '',
        confidence: result.confidence
      };
    } catch (error) {
      logger.warn({ error }, 'AI service unavailable, using fallback');
      return this.generateFallbackDraft(prompt, options);
    }
  }

  /**
   * Fallback draft generation when AI service is unavailable
   */
  private generateFallbackDraft(
    prompt: string,
    options: { targetWordCount: number }
  ): { content: string; confidence: number } {
    // Simple template-based response
    const content = `Thank you for your email. I've reviewed your message and will get back to you with a detailed response shortly.

Best regards`;

    return {
      content,
      confidence: 0.6 // Lower confidence for template responses
    };
  }

  /**
   * Generate reply subject line
   */
  private generateSubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  /**
   * Add user signature if enabled
   */
  private addSignature(
    body: string,
    preferences?: UserPreferences
  ): string {
    if (preferences?.signatureEnabled && preferences.signature) {
      return `${body}\n\n${preferences.signature}`;
    }
    return body;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Create custom draft from user input
   */
  async createCustomDraft(
    content: string,
    subject: string,
    tone: EmailDraft['tone'] = 'professional'
  ): Promise<EmailDraft> {
    return {
      version: 'custom',
      subject,
      body: content,
      wordCount: this.countWords(content),
      confidence: 1.0, // User-created, full confidence
      tone,
      metadata: {
        generatedAt: new Date(),
        includesSignature: false,
        estimatedReadTime: Math.ceil(this.countWords(content) / 200 * 60)
      }
    };
  }

  /**
   * Refine draft based on user feedback
   */
  async refineDraft(
    draft: EmailDraft,
    refinementInstructions: string
  ): Promise<EmailDraft> {
    const prompt = `Refine this email draft based on user feedback:

Original Draft:
${draft.body}

User Feedback: ${refinementInstructions}

Generate the refined email (same approximate length):`;

    const response = await this.callAIService(prompt, {
      maxTokens: 500,
      temperature: 0.7,
      targetWordCount: draft.wordCount
    });

    return {
      ...draft,
      body: response.content,
      wordCount: this.countWords(response.content),
      confidence: response.confidence || draft.confidence * 0.9,
      metadata: {
        ...draft.metadata,
        generatedAt: new Date()
      }
    };
  }
}
