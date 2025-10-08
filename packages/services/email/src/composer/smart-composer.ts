import { logger } from '@tide/logger';
import { serviceUrls } from '@tide/config';
import type { UserId } from '@tide/types';
import type {
  Email,
  EmailDraft,
  ComposeRequest,
  DraftApproach,
  WritingStyle,
} from '../types/index.js';
import { styleAnalyzer } from './style-analyzer.js';
import { draftValidator } from './validation.js';

/**
 * Smart email composer that generates multiple draft options
 */
export class SmartComposer {
  /**
   * Compose email drafts with different approaches
   */
  async compose(request: ComposeRequest): Promise<EmailDraft[]> {
    logger.info(
      {
        userId: request.userId,
        recipient: request.recipient,
        subject: request.subject,
      },
      'Composing email drafts'
    );

    try {
      // Get user's writing style (now analyzes actual sent emails)
      const style = await styleAnalyzer.getUserStyleCached(request.userId);

      // Generate three different drafts in parallel
      const [detailedDraft, conciseDraft, friendlyDraft] = await Promise.all([
        this.generateDraft('detailed', request, style),
        this.generateDraft('concise', request, style),
        this.generateDraft('friendly', request, style),
      ]);

      let drafts = [detailedDraft, conciseDraft, friendlyDraft];

      // Validate each draft
      for (const draft of drafts) {
        const validation = draftValidator.validate(draft);
        if (!validation.isValid) {
          logger.warn(
            { userId: request.userId, approach: draft.approach, errors: validation.errors },
            'Draft validation failed'
          );
        }

        // Update confidence based on validation score
        draft.confidence = draft.confidence * validation.score;
      }

      // Validate distinctness
      const distinctnessCheck = draftValidator.validateDistinctness(drafts);
      if (!distinctnessCheck.isValid) {
        logger.warn(
          { userId: request.userId, errors: distinctnessCheck.errors },
          'Drafts are too similar, regenerating'
        );

        // Regenerate with more variation
        drafts = await this.regenerateWithVariation(request, style);
      }

      logger.info(
        { userId: request.userId, draftCount: drafts.length },
        'Email drafts generated and validated'
      );

      return drafts;
    } catch (error) {
      logger.error({ userId: request.userId, error }, 'Failed to compose email');
      throw error;
    }
  }

  /**
   * Regenerate drafts with more variation
   */
  private async regenerateWithVariation(
    request: ComposeRequest,
    style: WritingStyle
  ): Promise<EmailDraft[]> {
    // Generate with more distinct approaches
    const [detailedDraft, conciseDraft, casualDraft] = await Promise.all([
      this.generateDraft('detailed', request, style, 'very thorough and comprehensive'),
      this.generateDraft('concise', request, style, 'extremely brief and direct'),
      this.generateDraft('friendly', request, style, 'warm and personal'),
    ]);

    return [detailedDraft, conciseDraft, casualDraft];
  }

  /**
   * Generate a single draft with specific approach
   */
  private async generateDraft(
    approach: DraftApproach,
    request: ComposeRequest,
    style: WritingStyle,
    variation?: string
  ): Promise<EmailDraft> {
    // Build enhanced context from thread
    const context = this.buildEnhancedContext(request);

    // Generate subject if not provided
    const subject = request.subject || this.generateSubject(request, approach);

    // Try AI-enhanced generation first
    try {
      const aiDraft = await this.generateWithAI(
        this.buildImprovedAIPrompt(request, context, style, approach, variation),
        request
      );

      const parsedResponse = this.parseAIResponse(aiDraft, request);

      // Validate the generated draft
      const body = parsedResponse.body;
      const validation = draftValidator.validate({
        approach,
        subject: parsedResponse.subject,
        body,
        tone: this.analyzeTone(body, approach),
        length: body.length,
        confidence: 0.85,
      });

      return {
        approach,
        subject: parsedResponse.subject,
        body,
        tone: this.analyzeTone(body, approach),
        length: body.length,
        confidence: this.calculateDraftConfidence(approach, request) * validation.score,
      };
    } catch (error) {
      logger.warn(
        { error, approach, userId: request.userId },
        'AI draft generation failed, using template fallback'
      );

      // Fallback to template-based generation
      const body = this.generateBody(approach, request, style, context);
      const tone = this.analyzeTone(body, approach);

      return {
        approach,
        subject,
        body,
        tone,
        length: body.length,
        confidence: this.calculateDraftConfidence(approach, request) * 0.7, // Lower confidence for templates
      };
    }
  }

  /**
   * Generate email subject
   */
  private generateSubject(
    request: ComposeRequest,
    approach: DraftApproach
  ): string {
    // If replying to thread, use Re: prefix
    if (request.thread && request.thread.length > 0) {
      const originalSubject = request.thread[0].subject;
      if (!originalSubject.toLowerCase().startsWith('re:')) {
        return `Re: ${originalSubject}`;
      }
      return originalSubject;
    }

    // Generate based on context
    if (request.context) {
      const contextLower = request.context.toLowerCase();

      if (contextLower.includes('meeting')) {
        return 'Meeting Request';
      }
      if (contextLower.includes('follow up')) {
        return 'Following Up';
      }
      if (contextLower.includes('question')) {
        return 'Quick Question';
      }
    }

    return 'Hello';
  }

  /**
   * Generate email body with AI enhancement
   */
  private generateBody(
    approach: DraftApproach,
    request: ComposeRequest,
    style: WritingStyle,
    context: string
  ): string {
    const parts: string[] = [];

    // Greeting
    const greeting = this.generateGreeting(approach, style, request.recipient);
    parts.push(greeting);
    parts.push('');

    // Main content with AI enhancement
    const mainContent = this.generateMainContent(approach, request, context);
    parts.push(mainContent);
    parts.push('');

    // Closing
    const closing = this.generateClosing(approach, style);
    parts.push(closing);

    return parts.join('\n');
  }

  /**
   * Generate AI-enhanced email draft using AI Service
   * This integrates with the AI Service for intelligent composition
   */
  async generateAIDraft(request: ComposeRequest): Promise<EmailDraft> {
    logger.info({ userId: request.userId }, 'Generating AI-enhanced draft');

    try {
      // Build context from thread and user history
      const context = this.buildEnhancedContext(request);
      const style = await styleAnalyzer.getUserStyleCached(request.userId);

      // Prepare AI prompt for email composition
      const prompt = this.buildAIPrompt(request, context, style);

      // Call AI Service for draft generation
      const aiGeneratedContent = await this.generateWithAI(prompt, request);

      // Extract subject and body from AI response
      const { subject, body } = this.parseAIResponse(aiGeneratedContent, request);

      return {
        approach: 'ai-enhanced',
        subject,
        body,
        tone: this.analyzeTone(body, 'detailed'),
        length: body.length,
        confidence: 0.85, // Higher confidence for AI-generated content
      };
    } catch (error) {
      logger.error({ userId: request.userId, error }, 'AI draft generation failed');
      // Fallback to standard generation
      const style = await styleAnalyzer.getUserStyleCached(request.userId);
      return this.generateDraft('detailed', request, style);
    }
  }

  /**
   * Build enhanced context including thread history and user preferences
   */
  private buildEnhancedContext(request: ComposeRequest): string {
    const contextParts: string[] = [];

    // Add thread context
    if (request.thread && request.thread.length > 0) {
      const threadSummary = this.summarizeThread(request.thread);
      contextParts.push(`Thread context: ${threadSummary}`);
    }

    // Add user-provided context
    if (request.context) {
      contextParts.push(`User intent: ${request.context}`);
    }

    // Add recipient context (if available from relationship intelligence)
    const recipientName = this.extractName(request.recipient);
    contextParts.push(`Recipient: ${recipientName} (${request.recipient})`);

    return contextParts.join('\n');
  }

  /**
   * Build improved AI prompt with more context
   */
  private buildImprovedAIPrompt(
    request: ComposeRequest,
    context: string,
    style: WritingStyle,
    approach: DraftApproach,
    variation?: string
  ): string {
    const approachGuidelines: Record<DraftApproach, string> = {
      detailed:
        '400-500 words with comprehensive explanations, multiple paragraphs, and thorough context',
      concise: '75-100 words, direct and to the point, single paragraph preferred',
      friendly: '150-200 words with warm tone, personal touch, and engaging language',
      formal: '200-300 words with formal language, respectful tone, and proper structure',
      'ai-enhanced': '250-350 words with balanced detail and clarity',
    };

    const threadContext =
      request.thread && request.thread.length > 0
        ? `\nThis is a reply in an ongoing thread about: ${request.thread[0].subject}\nPrevious emails: ${request.thread.length}`
        : '\nThis is a new email thread.';

    const formalityLabel = style.formalityLevel > 0.7 ? 'formal' : style.formalityLevel > 0.5 ? 'professional' : 'casual';

    return `You are an expert email composer creating a ${approach} email response.

CONTEXT:
${context}${threadContext}

USER'S WRITING STYLE (learned from their sent emails):
- Formality level: ${Math.round(style.formalityLevel * 100)}% (${formalityLabel})
- Average sentence length: ${style.averageSentenceLength} words
- Preferred greetings: ${style.preferredGreetings.slice(0, 3).join(' OR ')}
- Preferred closings: ${style.preferredClosings.slice(0, 3).join(' OR ')}
- Tone profile: ${Math.round(style.toneProfile.professional * 100)}% professional, ${Math.round(style.toneProfile.casual * 100)}% casual

DRAFT REQUIREMENTS (${approach} approach):
- Length: ${approachGuidelines[approach] || 'flexible based on context'}
${variation ? `- Variation emphasis: ${variation}` : ''}
- Match the user's natural writing style EXACTLY
- Use their preferred greetings and closings
- Maintain their typical sentence structure and formality
- Address all points from the context
- Include appropriate call-to-action if needed
- Be authentic and sound like the user wrote it

IMPORTANT:
- Start with greeting (using user's preferred style)
- End with closing (using user's preferred style)
- NO placeholders like [Your Name] - assume user will add signature
- NO markdown formatting
- Make it sound natural and conversational

Generate the email in this exact format:
Subject: [subject line without "Re:" prefix]
Body: [complete email body with greeting and closing]`;
  }

  /**
   * Build AI prompt for email composition (legacy method)
   */
  private buildAIPrompt(request: ComposeRequest, context: string, style: WritingStyle): string {
    return this.buildImprovedAIPrompt(request, context, style, 'detailed');
  }

  /**
   * Generate content using AI (integration with AI Service)
   */
  private async generateWithAI(prompt: string, request: ComposeRequest): Promise<string> {
    try {
      logger.debug({ userId: request.userId }, 'Calling AI service for email composition');

      const response = await fetch(`${serviceUrls.ai}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.userId,
          type: 'email_compose',
          input: {
            prompt,
            maxTokens: 800,
            temperature: 0.7,
          },
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const result = (await response.json()) as { content?: string; output?: { content?: string } };

      // Extract content from response
      const content = result.content || result.output?.content;

      if (!content) {
        throw new Error('AI service returned empty content');
      }

      logger.debug({ userId: request.userId, contentLength: content.length }, 'AI draft generated');

      return content;
    } catch (error) {
      logger.warn({ userId: request.userId, error }, 'AI service call failed, using fallback');

      // Fallback to enhanced template
      return this.generateEnhancedTemplate(prompt, request);
    }
  }

  /**
   * Enhanced template generation with better context awareness
   */
  private generateEnhancedTemplate(prompt: string, request: ComposeRequest): string {
    const hasThread = request.thread && request.thread.length > 0;
    const contextLower = (request.context || '').toLowerCase();

    // Detect email intent
    const isQuestion = contextLower.includes('question') || contextLower.includes('clarif');
    const isFollowUp = contextLower.includes('follow') || hasThread;
    const isRequest = contextLower.includes('request') || contextLower.includes('need');
    const isMeeting = contextLower.includes('meeting') || contextLower.includes('schedule');

    let subject = request.subject || '';
    let body = '';

    if (!subject) {
      if (isMeeting) {
        subject = 'Meeting Request - Let\'s Connect';
      } else if (isQuestion) {
        subject = 'Quick Question';
      } else if (isFollowUp) {
        subject = hasThread ? `Re: ${request.thread![0].subject}` : 'Following Up';
      } else {
        subject = 'Reaching Out';
      }
    }

    // Generate contextually appropriate body
    if (isMeeting) {
      body = `Subject: ${subject}\nBody: I wanted to reach out to schedule some time to connect. Based on our recent discussions, I think it would be valuable to meet and discuss next steps.\n\nWould you be available for a 30-minute call sometime this week or next? I'm flexible with timing and happy to work around your schedule.\n\nLooking forward to connecting.`;
    } else if (isFollowUp && hasThread) {
      body = `Subject: ${subject}\nBody: Thank you for your previous email. I wanted to follow up on our discussion and provide some additional thoughts.\n\n${request.context || 'I\'ve had a chance to review the information, and I believe we can move forward with the proposed approach.'}\n\nPlease let me know if you have any questions or if there's anything else I can help clarify.`;
    } else if (isRequest) {
      body = `Subject: ${subject}\nBody: I hope this email finds you well. I wanted to reach out regarding ${request.context || 'a matter that requires your attention'}.\n\nIf possible, it would be helpful to get your thoughts on this by end of week. Please let me know if you need any additional information from my end.\n\nThank you for your time and assistance.`;
    } else {
      body = `Subject: ${subject}\nBody: ${request.context || 'I wanted to touch base and see how things are progressing. It would be great to connect and discuss any updates.'}\n\nPlease feel free to reach out if you have any questions or if there's anything I can assist with.\n\nBest regards`;
    }

    return body;
  }

  /**
   * Parse AI-generated response
   */
  private parseAIResponse(aiResponse: string, request: ComposeRequest): { subject: string; body: string } {
    const lines = aiResponse.split('\n');
    let subject = request.subject || 'Hello';
    let bodyLines: string[] = [];
    let inBody = false;

    for (const line of lines) {
      if (line.startsWith('Subject:')) {
        subject = line.replace('Subject:', '').trim();
      } else if (line.startsWith('Body:')) {
        inBody = true;
        const bodyStart = line.replace('Body:', '').trim();
        if (bodyStart) {
          bodyLines.push(bodyStart);
        }
      } else if (inBody) {
        bodyLines.push(line);
      }
    }

    // Sanitize generated body to prevent injection attacks
    const sanitizeEmailContent = (content: string): string => {
      return content
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim();
    };

    const body = bodyLines.join('\n').trim() ||
      this.generateBody('detailed', request, {
        preferredGreetings: [],
        preferredClosings: [],
        averageSentenceLength: 15,
        formalityLevel: 0.6,
        commonPhrases: [],
        toneProfile: { professional: 0.7, casual: 0.2, formal: 0.1 }
      }, '');

    return {
      subject,
      body: sanitizeEmailContent(body),
    };
  }

  /**
   * Summarize email thread for context
   */
  private summarizeThread(thread: Email[]): string {
    // Null check on thread before accessing length
    if (!thread || thread.length === 0) return '';
    if (thread.length === 1) return `Single email about: ${thread[0].subject}`;

    const subjects = new Set(thread.map(e => e.subject.replace(/^Re: /i, '').trim()));
    const uniqueSubjects = Array.from(subjects);

    return `Thread of ${thread.length} emails discussing: ${uniqueSubjects.join(', ')}`;
  }

  /**
   * Generate greeting based on approach
   */
  private generateGreeting(
    approach: DraftApproach,
    style: WritingStyle,
    recipient: string
  ): string {
    const name = this.extractName(recipient);

    switch (approach) {
      case 'formal':
        return `Dear ${name},`;

      case 'friendly':
        return `Hi ${name}!`;

      case 'concise':
        return `Hi ${name},`;

      case 'detailed':
        return `Hello ${name},`;

      default:
        // Use preferred greeting from style
        if (style.preferredGreetings && style.preferredGreetings.length > 0) {
          return style.preferredGreetings[0].replace('{name}', name);
        }
        return `Hi ${name},`;
    }
  }

  /**
   * Generate main email content
   */
  private generateMainContent(
    approach: DraftApproach,
    request: ComposeRequest,
    context: string
  ): string {
    const contextSummary = request.context || context || '';

    switch (approach) {
      case 'detailed':
        return this.generateDetailedContent(request, contextSummary);

      case 'concise':
        return this.generateConciseContent(request, contextSummary);

      case 'friendly':
        return this.generateFriendlyContent(request, contextSummary);

      case 'formal':
        return this.generateFormalContent(request, contextSummary);

      default:
        return this.generateConciseContent(request, contextSummary);
    }
  }

  /**
   * Generate detailed content
   */
  private generateDetailedContent(
    request: ComposeRequest,
    context: string
  ): string {
    const parts: string[] = [];

    // Opening context
    if (request.thread && request.thread.length > 0) {
      parts.push(
        'Thank you for your email. I wanted to provide a comprehensive response to your inquiry.'
      );
      parts.push('');
    }

    // Main points
    if (context) {
      parts.push(context);
      parts.push('');
    } else {
      parts.push(
        'I wanted to reach out regarding our recent discussions. After careful consideration, I believe we should move forward with the following approach:'
      );
      parts.push('');
      parts.push('1. Review the current status and identify key priorities');
      parts.push('2. Schedule a follow-up meeting to discuss next steps');
      parts.push('3. Ensure all stakeholders are aligned on the timeline');
      parts.push('');
    }

    // Call to action
    parts.push(
      'Please let me know if you have any questions or if you would like to discuss this further. I am happy to schedule a call at your convenience.'
    );

    return parts.join('\n');
  }

  /**
   * Generate concise content
   */
  private generateConciseContent(
    request: ComposeRequest,
    context: string
  ): string {
    if (context) {
      return `${context}\n\nLet me know if you have any questions.`;
    }

    if (request.thread && request.thread.length > 0) {
      return 'Thanks for reaching out. I will review this and get back to you shortly.';
    }

    return 'I wanted to follow up on our previous discussion. Can we schedule some time to connect?';
  }

  /**
   * Generate friendly content
   */
  private generateFriendlyContent(
    request: ComposeRequest,
    context: string
  ): string {
    const parts: string[] = [];

    if (request.thread && request.thread.length > 0) {
      parts.push(
        'Thanks so much for your email! I really appreciate you reaching out.'
      );
      parts.push('');
    } else {
      parts.push('Hope you are doing well!');
      parts.push('');
    }

    if (context) {
      parts.push(context);
    } else {
      parts.push(
        'I wanted to touch base and see if we could find some time to connect. Would love to hear your thoughts on this!'
      );
    }

    parts.push('');
    parts.push('Looking forward to hearing from you!');

    return parts.join('\n');
  }

  /**
   * Generate formal content
   */
  private generateFormalContent(
    request: ComposeRequest,
    context: string
  ): string {
    const parts: string[] = [];

    parts.push(
      'I am writing to follow up on our previous correspondence regarding this matter.'
    );
    parts.push('');

    if (context) {
      parts.push(context);
    } else {
      parts.push(
        'I would appreciate the opportunity to discuss this further at your earliest convenience.'
      );
    }

    parts.push('');
    parts.push('Thank you for your time and consideration.');

    return parts.join('\n');
  }

  /**
   * Generate closing
   */
  private generateClosing(approach: DraftApproach, style: WritingStyle): string {
    switch (approach) {
      case 'formal':
        return 'Sincerely,\n[Your Name]';

      case 'friendly':
        return 'Best,\n[Your Name]';

      case 'concise':
        return 'Thanks,\n[Your Name]';

      case 'detailed':
        return 'Best regards,\n[Your Name]';

      default:
        // Use preferred closing from style
        if (style.preferredClosings && style.preferredClosings.length > 0) {
          return `${style.preferredClosings[0]}\n[Your Name]`;
        }
        return 'Best,\n[Your Name]';
    }
  }

  /**
   * Build context from email thread
   */
  private buildContext(request: ComposeRequest): string {
    if (!request.thread || request.thread.length === 0) {
      return '';
    }

    // Summarize thread context
    const latestEmail = request.thread[0];
    const summary = `Regarding: ${latestEmail.subject}`;

    return summary;
  }

  /**
   * Analyze tone of generated draft
   */
  private analyzeTone(body: string, approach: DraftApproach): string {
    const lowerBody = body.toLowerCase();

    if (
      lowerBody.includes('sincerely') ||
      lowerBody.includes('respectfully')
    ) {
      return 'Formal';
    }

    if (
      lowerBody.includes('hope you') ||
      lowerBody.includes('looking forward')
    ) {
      return 'Friendly';
    }

    if (lowerBody.length < 200) {
      return 'Concise';
    }

    return 'Professional';
  }

  /**
   * Calculate confidence in draft quality
   */
  private calculateDraftConfidence(
    approach: DraftApproach,
    request: ComposeRequest
  ): number {
    let confidence = 0.7; // Base confidence

    // More context increases confidence
    if (request.thread && request.thread.length > 0) {
      confidence += 0.1;
    }

    if (request.context) {
      confidence += 0.1;
    }

    // Specific approaches have different confidence levels
    if (approach === 'concise') {
      confidence += 0.05; // Concise is easier to get right
    }

    return Math.min(confidence, 0.95);
  }

  /**
   * Extract name from email address
   */
  private extractName(email: string): string {
    // Handle "Name <email@domain.com>" format
    const displayNameMatch = email.match(/^(.+?)\s*<.*>$/);
    if (displayNameMatch) {
      const displayName = displayNameMatch[1].trim().replace(/['"]/g, '');
      // Return first name if multiple words
      const names = displayName.split(/\s+/);
      return names[0];
    }

    // Fall back to extracting from email local part
    const localPart = email.split('@')[0];

    // Split by dots or underscores
    const parts = localPart.split(/[._]/);

    // Capitalize first part
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    return 'there';
  }

}
