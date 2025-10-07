/**
 * Intent Detection System
 * Analyzes user requests to detect intents and entities
 */

import { createLogger } from '@tide/logger';
import type {
  AIRequest,
  Intent,
  IntentCategory,
  EntityExtraction,
  EntityType,
} from '@tide/contracts';
import type { ModelClient } from '../types';

const logger = createLogger({ component: 'IntentDetector' });

export class IntentDetector {
  /**
   * Detect intents from user request
   */
  async detect(request: AIRequest, modelClient: ModelClient): Promise<Intent[]> {
    const content = request.content.toLowerCase();

    // Fast path: rule-based detection for common patterns
    const ruleBasedIntents = this.detectWithRules(content);
    if (ruleBasedIntents.length > 0 && ruleBasedIntents[0].confidence > 0.9) {
      logger.debug('Intent detected with rules', { intents: ruleBasedIntents });
      return ruleBasedIntents;
    }

    // ML path: use model for complex intent detection
    const mlIntents = await this.detectWithModel(request, modelClient);

    // Merge results
    const combined = this.mergeIntents([...ruleBasedIntents, ...mlIntents]);

    logger.info('Intents detected', {
      count: combined.length,
      categories: combined.map(i => i.category),
    });

    return combined;
  }

  /**
   * Rule-based intent detection (fast)
   */
  private detectWithRules(content: string): Intent[] {
    const intents: Intent[] = [];

    // Email intents
    if (/triage|prioritize.*email|check.*email|inbox/i.test(content)) {
      intents.push({
        category: 'email_triage',
        action: 'triage_emails',
        confidence: 0.95,
        entities: [],
      });
    }

    if (/write.*email|compose.*email|draft.*email|send.*email/i.test(content)) {
      intents.push({
        category: 'email_compose',
        action: 'compose_email',
        confidence: 0.92,
        entities: this.extractEmailEntities(content),
      });
    }

    if (/reply|respond/i.test(content)) {
      intents.push({
        category: 'email_reply',
        action: 'reply_to_email',
        confidence: 0.90,
        entities: this.extractEmailEntities(content),
      });
    }

    // Calendar intents
    if (/schedule|meeting|book|calendar|appointment/i.test(content)) {
      intents.push({
        category: 'calendar_schedule',
        action: 'schedule_event',
        confidence: 0.93,
        entities: this.extractDateTimeEntities(content),
      });
    }

    if (/optimize.*schedule|clear.*calendar|free.*time|focus.*time/i.test(content)) {
      intents.push({
        category: 'calendar_optimize',
        action: 'optimize_calendar',
        confidence: 0.91,
        entities: [],
      });
    }

    // Task intents
    if (/create.*task|add.*task|new.*task|todo/i.test(content)) {
      intents.push({
        category: 'task_create',
        action: 'create_task',
        confidence: 0.94,
        entities: this.extractTaskEntities(content),
      });
    }

    if (/prioritize.*task|important.*task|urgent/i.test(content)) {
      intents.push({
        category: 'task_prioritize',
        action: 'prioritize_tasks',
        confidence: 0.92,
        entities: [],
      });
    }

    // Workflow intents
    if (/workflow|automate|process/i.test(content)) {
      intents.push({
        category: 'workflow_execute',
        action: 'execute_workflow',
        confidence: 0.88,
        entities: [],
      });
    }

    // Question intents (fallback)
    if (/what|when|where|who|why|how/i.test(content) && intents.length === 0) {
      intents.push({
        category: 'question_answer',
        action: 'answer_question',
        confidence: 0.75,
        entities: [],
      });
    }

    return intents;
  }

  /**
   * Model-based intent detection (accurate)
   */
  private async detectWithModel(
    request: AIRequest,
    modelClient: ModelClient
  ): Promise<Intent[]> {
    const prompt = `Analyze this user request and identify the intents.

Available intent categories:
- email_triage: Triaging/organizing emails
- email_compose: Writing new emails
- email_reply: Replying to emails
- calendar_schedule: Scheduling meetings/events
- calendar_optimize: Optimizing calendar/schedule
- task_create: Creating tasks
- task_prioritize: Prioritizing tasks
- workflow_execute: Executing workflows
- question_answer: Answering questions
- decision_support: Supporting decisions

Return a JSON array of intents with: category, action, confidence (0-1)

User request: ${request.content}`;

    try {
      const result = await modelClient.complete(prompt, {
        temperature: 0.2,
        maxTokens: 300,
      });

      const intents = JSON.parse(result.content);
      return Array.isArray(intents) ? intents.map(i => ({
        ...i,
        entities: [],
      })) : [];
    } catch (error) {
      logger.warn('Model-based intent detection failed', { error });
      return [];
    }
  }

  /**
   * Extract email entities
   */
  private extractEmailEntities(content: string): EntityExtraction[] {
    const entities: EntityExtraction[] = [];

    // Extract email addresses
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = content.match(emailRegex) || [];
    emails.forEach(email => {
      const index = content.indexOf(email);
      entities.push({
        type: 'email',
        value: email,
        confidence: 1.0,
        span: [index, index + email.length],
      });
    });

    return entities;
  }

  /**
   * Extract date/time entities
   */
  private extractDateTimeEntities(content: string): EntityExtraction[] {
    const entities: EntityExtraction[] = [];

    // Common time patterns
    const timePatterns = [
      /\d{1,2}:\d{2}\s*(am|pm)?/gi,
      /\d{1,2}\s*(am|pm)/gi,
    ];

    timePatterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            type: 'time',
            value: match[0],
            confidence: 0.9,
            span: [match.index, match.index + match[0].length],
          });
        }
      }
    });

    // Common date patterns
    const datePatterns = [
      /today|tomorrow|yesterday/gi,
      /next\s+(week|month|monday|tuesday|wednesday|thursday|friday)/gi,
      /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
    ];

    datePatterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            type: 'date',
            value: match[0],
            confidence: 0.85,
            span: [match.index, match.index + match[0].length],
          });
        }
      }
    });

    return entities;
  }

  /**
   * Extract task entities
   */
  private extractTaskEntities(content: string): EntityExtraction[] {
    const entities: EntityExtraction[] = [];

    // Priority indicators
    if (/urgent|asap|critical|high.priority/i.test(content)) {
      entities.push({
        type: 'priority',
        value: 'high',
        confidence: 0.9,
        span: [0, 0],
      });
    }

    return entities;
  }

  /**
   * Merge and deduplicate intents
   */
  private mergeIntents(intents: Intent[]): Intent[] {
    const merged = new Map<IntentCategory, Intent>();

    for (const intent of intents) {
      const existing = merged.get(intent.category);
      if (!existing || intent.confidence > existing.confidence) {
        merged.set(intent.category, intent);
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Top 3 intents
  }
}
