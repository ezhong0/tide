import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';
import { thresholds } from '@tide/config';
import type {
  Email,
  TriageResult,
  EmailUrgency,
  EmailCategory,
  EmailAction,
  EmailSentiment,
  RelationshipContext,
  TriageStrategy,
} from '../types/index.js';

/**
 * Email triage engine that analyzes emails and determines handling strategy
 */
export class EmailTriageEngine {
  /**
   * Analyze email and generate triage result
   */
  async analyze(email: Email): Promise<TriageResult> {
    logger.info({ emailId: email.id, userId: email.userId }, 'Analyzing email for triage');

    try {
      // Run all analysis in parallel
      const [
        importance,
        urgency,
        category,
        sentiment,
        actionRequired,
        relationships,
      ] = await Promise.all([
        this.analyzeImportance(email),
        this.analyzeUrgency(email),
        this.categorizeEmail(email),
        this.analyzeSentiment(email),
        this.detectActionRequired(email),
        this.analyzeRelationships(email),
      ]);

      // Determine handling strategy
      const strategy = this.determineStrategy({
        importance,
        urgency,
        category,
        actionRequired,
        sentiment,
      });

      // Calculate confidence
      const confidence = this.calculateConfidence({
        importance,
        urgency,
        category,
        actionRequired,
      });

      const result: TriageResult = {
        importance,
        urgency,
        category,
        sentiment,
        actionRequired,
        relationships,
        strategy,
        confidence,
        canAutoHandle: strategy.auto && confidence > thresholds.email.triageAutoHandleConfidence,
      };

      logger.info(
        {
          emailId: email.id,
          importance,
          urgency,
          category,
          canAutoHandle: result.canAutoHandle,
        },
        'Email triage completed'
      );

      return result;
    } catch (error) {
      logger.error({ emailId: email.id, error }, 'Failed to analyze email');
      throw error;
    }
  }

  /**
   * Analyze email importance (0-1 score)
   */
  private async analyzeImportance(email: Email): Promise<number> {
    const factors: Record<string, number> = {};

    // Sender importance (would query relationship database)
    factors.senderImportance = 0.5; // Default, would be from relationship intelligence

    // Direct addressing
    factors.directAddress = email.to.length === 1 ? 0.3 : 0.1;

    // CC presence
    factors.ccPresence = email.cc && email.cc.length > 0 ? 0.1 : 0;

    // Subject keywords indicating importance
    const importantKeywords = [
      /urgent/i,
      /important/i,
      /critical/i,
      /asap/i,
      /priority/i,
      /board/i,
      /executive/i,
      /ceo/i,
    ];
    factors.subjectKeywords = importantKeywords.some((regex) =>
      regex.test(email.subject)
    )
      ? 0.3
      : 0;

    // Money mentioned
    factors.moneyMentioned = /\$\d+|£\d+|€\d+|\d+k|\d+m/i.test(email.body) ? 0.3 : 0;

    // Deadline mentioned
    factors.deadlineMentioned = this.hasDeadline(email.body) ? 0.4 : 0;

    // Thread length (longer threads often more important)
    const threadLength = email.threadLength || 1;
    factors.threadLength = Math.min(threadLength * 0.05, 0.3);

    // Calculate weighted importance
    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
    return Math.min(totalScore, 1.0);
  }

  /**
   * Analyze email urgency
   */
  private async analyzeUrgency(email: Email): Promise<EmailUrgency> {
    const urgentMarkers = [
      /urgent/i,
      /asap/i,
      /immediately/i,
      /right away/i,
      /critical/i,
      /emergency/i,
    ];

    // Check for explicit urgency markers
    const hasUrgentMarker = urgentMarkers.some(
      (regex) => regex.test(email.subject) || regex.test(email.body)
    );

    if (hasUrgentMarker) {
      return 'immediate';
    }

    // Check for time-sensitive content
    const deadline = this.extractDeadline(email.body);

    if (deadline) {
      const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);

      if (hoursUntilDeadline <= 24) {
        return 'immediate';
      } else if (hoursUntilDeadline <= 72) {
        return 'today';
      } else if (hoursUntilDeadline <= 168) {
        return 'this_week';
      }
    }

    // Check for "today" or "EOD" mentions
    if (/today|eod|end of (the )?day/i.test(email.body)) {
      return 'today';
    }

    // Check for "this week" mentions
    if (/this week|by friday/i.test(email.body)) {
      return 'this_week';
    }

    return 'whenever';
  }

  /**
   * Categorize email
   */
  private async categorizeEmail(email: Email): Promise<EmailCategory> {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    // Meeting patterns
    if (
      /meeting|call|discuss|sync|catch up|1:1|one.on.one/i.test(subject + body) ||
      /calendar|schedule|availability/i.test(body)
    ) {
      return 'meeting';
    }

    // Request patterns
    if (
      /can you|could you|please|need|require|request/i.test(subject + body) ||
      /\?/.test(subject)
    ) {
      return 'request';
    }

    // Newsletter patterns
    if (
      /newsletter|digest|roundup|weekly|monthly/i.test(subject) ||
      email.from.includes('noreply') ||
      email.from.includes('no-reply')
    ) {
      return 'newsletter';
    }

    // Social patterns
    if (
      email.from.includes('@facebook') ||
      email.from.includes('@twitter') ||
      email.from.includes('@linkedin') ||
      /mentioned you|tagged you|sent you a message/i.test(subject)
    ) {
      return 'social';
    }

    // Promotional patterns
    if (
      /sale|discount|offer|promotion|deal|limited time/i.test(subject) ||
      /unsubscribe|opt.out/i.test(body)
    ) {
      return 'promotional';
    }

    // Important patterns
    if (/urgent|important|critical|action required/i.test(subject)) {
      return 'important';
    }

    // Default to FYI
    return 'fyi';
  }

  /**
   * Analyze email sentiment
   */
  private async analyzeSentiment(email: Email): Promise<EmailSentiment> {
    const text = (email.subject + ' ' + email.body).toLowerCase();

    // Urgent sentiment
    if (/urgent|critical|asap|immediately|emergency/i.test(text)) {
      return 'urgent';
    }

    // Negative sentiment
    const negativeWords = [
      'angry',
      'frustrated',
      'disappointed',
      'unacceptable',
      'issue',
      'problem',
      'concern',
      'worried',
    ];
    if (negativeWords.some((word) => text.includes(word))) {
      return 'negative';
    }

    // Positive sentiment
    const positiveWords = [
      'thanks',
      'thank you',
      'great',
      'excellent',
      'wonderful',
      'appreciate',
      'congratulations',
    ];
    if (positiveWords.some((word) => text.includes(word))) {
      return 'positive';
    }

    return 'neutral';
  }

  /**
   * Detect action required
   */
  private async detectActionRequired(email: Email): Promise<EmailAction> {
    const text = (email.subject + ' ' + email.body).toLowerCase();

    // Schedule action
    if (
      /schedule|calendar|meeting|availability|when (are|can) you/i.test(text) ||
      /book (a )?time/i.test(text)
    ) {
      return 'schedule';
    }

    // Reply action
    if (
      /\?/.test(email.subject + email.body) ||
      /reply|respond|let me know|thoughts|feedback/i.test(text) ||
      /can you|could you|would you/i.test(text)
    ) {
      return 'reply';
    }

    // Delegate action
    if (/forward|share with|cc|loop in/i.test(text)) {
      return 'delegate';
    }

    // File action (FYI emails)
    if (
      /fyi|for your information|just wanted to|keeping you informed/i.test(text) ||
      email.from.includes('noreply')
    ) {
      return 'file';
    }

    return 'none';
  }

  /**
   * Analyze relationship context
   */
  private async analyzeRelationships(email: Email): Promise<RelationshipContext> {
    // In a real implementation, this would query a relationship database
    // For now, return basic context
    return {
      senderImportance: 0.5,
      interactionCount: 10,
      lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      averageResponseTime: 60 * 60 * 1000, // 1 hour in ms
      isVIP: false,
      tags: [],
    };
  }

  /**
   * Determine handling strategy
   */
  private determineStrategy(context: {
    importance: number;
    urgency: EmailUrgency;
    category: EmailCategory;
    actionRequired: EmailAction;
    sentiment: EmailSentiment;
  }): {
    type: TriageStrategy;
    auto: boolean;
    reasoning: string;
  } {
    // High importance, urgent emails should be escalated
    if (context.importance > 0.8 && context.urgency === 'immediate') {
      return {
        type: 'escalate',
        auto: false,
        reasoning: 'High importance and urgent - requires immediate attention',
      };
    }

    // Newsletter and promotional emails can be auto-archived
    if (
      context.category === 'newsletter' ||
      context.category === 'promotional'
    ) {
      return {
        type: 'archive',
        auto: true,
        reasoning: 'Low priority newsletter or promotional content',
      };
    }

    // Meeting requests with scheduling action
    if (
      context.category === 'meeting' &&
      context.actionRequired === 'schedule'
    ) {
      return {
        type: 'auto_schedule',
        auto: true,
        reasoning: 'Meeting request detected - can auto-schedule',
      };
    }

    // Simple acknowledgments
    if (context.category === 'fyi' && context.actionRequired === 'file') {
      return {
        type: 'auto_acknowledge',
        auto: true,
        reasoning: 'FYI email - can send auto-acknowledgment',
      };
    }

    // Requests requiring reply
    if (context.actionRequired === 'reply' && context.importance < 0.7) {
      return {
        type: 'smart_draft',
        auto: false,
        reasoning: 'Requires reply - generate draft for review',
      };
    }

    // Default: create draft
    return {
      type: 'smart_draft',
      auto: false,
      reasoning: 'Generate draft for manual review',
    };
  }

  /**
   * Calculate confidence in triage decision
   */
  private calculateConfidence(context: {
    importance: number;
    urgency: EmailUrgency;
    category: EmailCategory;
    actionRequired: EmailAction;
  }): number {
    let confidence = 0.5; // Base confidence

    // Clear category increases confidence
    if (
      context.category === 'newsletter' ||
      context.category === 'promotional' ||
      context.category === 'meeting'
    ) {
      confidence += 0.2;
    }

    // Clear action increases confidence
    if (
      context.actionRequired === 'schedule' ||
      context.actionRequired === 'file'
    ) {
      confidence += 0.2;
    }

    // High importance decreases confidence in auto-handling
    if (context.importance > 0.8) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Check if email body contains deadline
   */
  private hasDeadline(text: string): boolean {
    const deadlinePatterns = [
      /deadline/i,
      /due (by|on)/i,
      /by (eod|end of day)/i,
      /no later than/i,
      /by \d{1,2}\/\d{1,2}/,
      /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    ];

    return deadlinePatterns.some((regex) => regex.test(text));
  }

  /**
   * Extract deadline date from text
   */
  private extractDeadline(text: string): Date | null {
    // Simple extraction - would use more sophisticated NLP in production
    const eodMatch = /by (eod|end of day)/i.test(text);
    if (eodMatch) {
      const today = new Date();
      today.setHours(17, 0, 0, 0); // 5 PM
      return today;
    }

    const todayMatch = /today/i.test(text);
    if (todayMatch) {
      const today = new Date();
      today.setHours(17, 0, 0, 0);
      return today;
    }

    const tomorrowMatch = /tomorrow/i.test(text);
    if (tomorrowMatch) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);
      return tomorrow;
    }

    return null;
  }
}
