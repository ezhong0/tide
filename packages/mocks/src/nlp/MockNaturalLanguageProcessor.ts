/**
 * Mock Natural Language Processor (Module 00 - Day 3)
 * Pattern-based NLP for testing and development
 */

import { INaturalLanguageProcessor } from '@tide/contracts';
import {
  Result,
  ok,
  err,
  IUnderstanding,
  IConversationContext,
  IIntent,
  IEntity,
  IAmbiguity,
  IntentType
} from '@tide/types';

export class MockNaturalLanguageProcessor implements INaturalLanguageProcessor {
  /**
   * Process message and understand intent
   * @performance <300ms
   */
  async processMessage(
    message: string,
    context: IConversationContext
  ): Promise<Result<IUnderstanding>> {
    if (!message || message.trim() === '') {
      return err(new Error('Message cannot be empty'));
    }

    // Get intent
    const intentResult = await this.classifyIntent(message);
    if (!intentResult.success) {
      return intentResult as Result<IUnderstanding>;
    }

    // Extract entities
    const entitiesResult = await this.extractEntities(message, context);
    if (!entitiesResult.success) {
      return entitiesResult as Result<IUnderstanding>;
    }

    const understanding: IUnderstanding = {
      intents: [intentResult.data],
      entities: entitiesResult.data,
      confidence: intentResult.data.confidence
    };

    // Detect ambiguities
    const ambiguitiesResult = await this.detectAmbiguities(message, understanding);
    if (ambiguitiesResult.success && ambiguitiesResult.data.length > 0) {
      understanding.ambiguities = ambiguitiesResult.data;
      understanding.confidence *= 0.8; // Reduce confidence if ambiguous
    }

    return ok(understanding);
  }

  /**
   * Classify intent from message
   * @performance <200ms
   */
  async classifyIntent(message: string): Promise<Result<IIntent>> {
    const lowerMessage = message.toLowerCase();

    // Intent patterns (keyword-based matching)
    // Order matters - more specific patterns first
    const patterns: Array<{ type: IntentType; keywords: string[]; confidence: number }> = [
      {
        type: 'reschedule_meeting',
        keywords: ['reschedule', 'move', 'change'],
        confidence: 0.95
      },
      {
        type: 'cancel_meeting',
        keywords: ['cancel', 'delete', 'remove'],
        confidence: 0.95
      },
      {
        type: 'set_reminder',
        keywords: ['remind', 'reminder', 'alert', 'notify'],
        confidence: 0.9
      },
      {
        type: 'schedule_meeting',
        keywords: ['schedule', 'book', 'set up', 'arrange', 'meeting', 'call'],
        confidence: 0.9
      },
      {
        type: 'draft_email',
        keywords: ['draft', 'compose', 'write', 'email'],
        confidence: 0.9
      },
      {
        type: 'search_emails',
        keywords: ['search', 'find', 'look for', 'emails', 'messages'],
        confidence: 0.85
      },
      {
        type: 'check_calendar',
        keywords: ['calendar', 'what', 'when', 'today', 'tomorrow', 'free'],
        confidence: 0.85
      },
      {
        type: 'create_task',
        keywords: ['task', 'todo', 'to-do', 'add', 'create'],
        confidence: 0.85
      },
      {
        type: 'find_time',
        keywords: ['find time', 'available', 'free time', 'when can', 'availability'],
        confidence: 0.9
      },
      {
        type: 'reply_email',
        keywords: ['reply', 'respond', 'answer'],
        confidence: 0.9
      },
      {
        type: 'forward_email',
        keywords: ['forward', 'fwd', 'send to'],
        confidence: 0.9
      },
      {
        type: 'summarize_emails',
        keywords: ['summarize', 'summary', 'overview', 'emails'],
        confidence: 0.85
      }
    ];

    // Find matching patterns
    // Patterns are ordered by specificity - check in order and prefer first strong match
    let bestMatch: { type: IntentType; confidence: number } | null = null;
    let maxScore = 0;

    for (const pattern of patterns) {
      let exactMatchScore = 0;
      let substringScore = 0;

      for (const keyword of pattern.keywords) {
        // Escape special regex characters in multi-word keywords
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundaryRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

        if (wordBoundaryRegex.test(message)) {
          exactMatchScore += 1;
        } else if (lowerMessage.includes(keyword)) {
          substringScore += 1;
        }
      }

      // Calculate total score: exact matches worth much more than substring matches
      const totalScore = (exactMatchScore * 10) + substringScore;

      // For patterns early in the list (more specific), give bonus points
      const specificityBonus = (patterns.length - patterns.indexOf(pattern)) * 0.5;
      const adjustedScore = totalScore + (exactMatchScore > 0 ? specificityBonus : 0);

      if (adjustedScore > maxScore) {
        maxScore = adjustedScore;
        bestMatch = { type: pattern.type, confidence: pattern.confidence };
      }
    }

    if (!bestMatch) {
      bestMatch = { type: 'unknown', confidence: 0.5 };
    }

    // Adjust confidence based on message length and clarity
    let confidence = bestMatch.confidence;
    if (message.length < 5) {
      confidence *= 0.7;
    }

    const intent: IIntent = {
      type: bestMatch.type,
      confidence,
      params: this.extractIntentParams(message, bestMatch.type)
    };

    return ok(intent);
  }

  /**
   * Extract entities from message
   * @performance <100ms
   */
  async extractEntities(
    message: string,
    context: IConversationContext
  ): Promise<Result<IEntity[]>> {
    const entities: IEntity[] = [];

    // Email pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailRegex.exec(message)) !== null) {
      entities.push({
        type: 'email',
        value: match[0],
        position: [match.index, match.index + match[0].length],
        confidence: 0.95
      });
    }

    // Name pattern (capitalized words)
    const nameRegex = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g;
    while ((match = nameRegex.exec(message)) !== null) {
      // Filter out common false positives
      const value = match[0];
      if (!['I', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(value)) {
        entities.push({
          type: 'person',
          value,
          position: [match.index, match.index + match[0].length],
          confidence: 0.7
        });
      }
    }

    // Time patterns
    const timePatterns = [
      /\b\d{1,2}:\d{2}\s*(am|pm|AM|PM)?\b/g,
      /\b(tomorrow|today|yesterday)\b/gi,
      /\b(next|last)\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      /\bin\s+\d+\s+(minutes?|hours?|days?|weeks?)\b/gi
    ];

    for (const pattern of timePatterns) {
      while ((match = pattern.exec(message)) !== null) {
        entities.push({
          type: 'time',
          value: match[0],
          position: [match.index, match.index + match[0].length],
          confidence: 0.85
        });
      }
    }

    // Duration patterns
    const durationRegex = /\b(\d+)\s*(minute|min|hour|hr|hours|minutes)s?\b/gi;
    while ((match = durationRegex.exec(message)) !== null) {
      entities.push({
        type: 'duration',
        value: match[0],
        position: [match.index, match.index + match[0].length],
        confidence: 0.9
      });
    }

    // Location/Place patterns
    const locationWords = ['office', 'home', 'room', 'building', 'street', 'avenue'];
    for (const word of locationWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      while ((match = regex.exec(message)) !== null) {
        entities.push({
          type: 'location',
          value: match[0],
          position: [match.index, match.index + match[0].length],
          confidence: 0.7
        });
      }
    }

    return ok(entities);
  }

  /**
   * Detect ambiguities in message
   * @performance <100ms
   */
  async detectAmbiguities(
    message: string,
    understanding: IUnderstanding
  ): Promise<Result<IAmbiguity[]>> {
    const ambiguities: IAmbiguity[] = [];
    const lowerMessage = message.toLowerCase();

    // Check for pronoun references without context
    const pronouns = ['it', 'that', 'this', 'them', 'they', 'he', 'she'];
    for (const pronoun of pronouns) {
      if (lowerMessage.includes(` ${pronoun} `)) {
        ambiguities.push({
          type: 'pronoun_reference',
          question: `What does "${pronoun}" refer to?`,
          options: ['Previous email', 'Previous meeting', 'Previous task']
        });
      }
    }

    // Check for time ambiguity
    const hasTime = understanding.entities.some(e => e.type === 'time');
    if (!hasTime && (lowerMessage.includes('meeting') || lowerMessage.includes('schedule'))) {
      ambiguities.push({
        type: 'missing_time',
        question: 'What time would you like to schedule this?'
      });
    }

    // Check for recipient ambiguity in email context
    const hasEmail = understanding.entities.some(e => e.type === 'email');
    const hasPerson = understanding.entities.some(e => e.type === 'person');
    if (understanding.intents[0]?.type === 'draft_email' && !hasEmail && !hasPerson) {
      ambiguities.push({
        type: 'missing_recipient',
        question: 'Who should receive this email?'
      });
    }

    // Check for multiple possible interpretations
    if (understanding.intents.length > 1 && understanding.intents[0].confidence < 0.8) {
      ambiguities.push({
        type: 'intent_ambiguity',
        question: 'What would you like to do?',
        options: understanding.intents.map(i => i.type)
      });
    }

    return ok(ambiguities);
  }

  /**
   * Resolve references (pronouns, "that meeting", etc.)
   * @performance <50ms per reference
   */
  async resolveReferences(
    text: string,
    context: IConversationContext
  ): Promise<Result<Record<string, unknown>>> {
    const resolutions: Record<string, unknown> = {};
    const lowerText = text.toLowerCase();

    // Resolve "it" / "that" to last mentioned topic
    if (lowerText.includes('it') || lowerText.includes('that')) {
      if (context.topic) {
        resolutions.referent = context.topic;
      }
      if (context.upcomingMeetings.length > 0) {
        resolutions.meeting = context.upcomingMeetings[0];
      }
    }

    // Resolve "them" / "they" to people
    if (lowerText.includes('them') || lowerText.includes('they')) {
      if (context.mentionedPeople.length > 0) {
        resolutions.people = context.mentionedPeople;
      }
    }

    // Resolve time references
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      resolutions.date = tomorrow.toISOString();
    }

    if (lowerText.includes('today')) {
      resolutions.date = new Date().toISOString();
    }

    if (lowerText.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      resolutions.date = nextWeek.toISOString();
    }

    return ok(resolutions);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private extractIntentParams(message: string, intentType: IntentType): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    switch (intentType) {
      case 'search_emails':
        // Extract search query
        const searchMatch = message.match(/search(?:\s+for)?\s+(.+)/i);
        if (searchMatch) {
          params.query = searchMatch[1].trim();
        }
        break;

      case 'set_reminder':
        // Extract reminder message
        const reminderMatch = message.match(/remind(?:\s+me)?\s+(?:to\s+)?(.+)/i);
        if (reminderMatch) {
          params.message = reminderMatch[1].trim();
        }
        break;

      case 'create_task':
        // Extract task description
        const taskMatch = message.match(/(?:task|todo)(?:\s+to)?\s+(.+)/i);
        if (taskMatch) {
          params.description = taskMatch[1].trim();
        }
        break;
    }

    return params;
  }
}
