import { logger } from '@tide/logger';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';
import type { WritingStyle } from '../types/index.js';

/**
 * Analyzes user's writing style from sent emails
 */
export class StyleAnalyzer {
  private supabase = SupabaseConnectionManager.getInstance();

  /**
   * Analyze user's writing style from their sent emails
   */
  async analyzeUserStyle(userId: UserId): Promise<WritingStyle> {
    logger.info({ userId }, 'Analyzing user writing style');

    try {
      // Fetch user's sent emails (last 50 for analysis)
      const { data: sentEmails, error } = await this.supabase
        .from('emails')
        .select('subject, body, to_addresses, sent_at')
        .eq('user_id', userId)
        .eq('is_sent', true) // Only analyze sent emails
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error || !sentEmails || sentEmails.length === 0) {
        logger.warn({ userId, error }, 'No sent emails found, using default style');
        return this.getDefaultStyle();
      }

      logger.info({ userId, emailCount: sentEmails.length }, 'Analyzing sent emails');

      // Extract greetings
      const greetings = this.extractGreetings(sentEmails.map((e) => e.body));

      // Extract closings
      const closings = this.extractClosings(sentEmails.map((e) => e.body));

      // Calculate average sentence length
      const avgSentenceLength = this.calculateAverageSentenceLength(
        sentEmails.map((e) => e.body)
      );

      // Determine formality level
      const formalityLevel = this.calculateFormalityLevel(sentEmails.map((e) => e.body));

      // Extract common phrases
      const commonPhrases = this.extractCommonPhrases(sentEmails.map((e) => e.body));

      // Analyze tone profile
      const toneProfile = this.analyzeToneProfile(sentEmails.map((e) => e.body));

      const style: WritingStyle = {
        preferredGreetings: greetings.slice(0, 5),
        preferredClosings: closings.slice(0, 5),
        averageSentenceLength: avgSentenceLength,
        formalityLevel,
        commonPhrases: commonPhrases.slice(0, 10),
        toneProfile,
      };

      logger.info({ userId, style }, 'Writing style analyzed');

      return style;
    } catch (error) {
      logger.error({ userId, error }, 'Error analyzing writing style');
      return this.getDefaultStyle();
    }
  }

  /**
   * Extract common greetings from emails
   */
  private extractGreetings(bodies: string[]): string[] {
    const greetingPatterns = [
      /^(hi|hello|hey|dear|good morning|good afternoon|good evening)\s+([^,\n]+)[,:]?/i,
    ];

    const greetingCounts: Map<string, number> = new Map();

    for (const body of bodies) {
      const firstLine = body.split('\n')[0] || '';

      for (const pattern of greetingPatterns) {
        const match = firstLine.match(pattern);
        if (match) {
          const greeting = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
          greetingCounts.set(greeting, (greetingCounts.get(greeting) || 0) + 1);
          break;
        }
      }
    }

    // Sort by frequency and return templates
    return Array.from(greetingCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([greeting]) => `${greeting} {name},`);
  }

  /**
   * Extract common closings from emails
   */
  private extractClosings(bodies: string[]): string[] {
    const closingPatterns = [
      'best regards',
      'sincerely',
      'best',
      'thanks',
      'thank you',
      'regards',
      'cheers',
      'warm regards',
      'kind regards',
      'yours truly',
      'take care',
      'all the best',
    ];

    const closingCounts: Map<string, number> = new Map();

    for (const body of bodies) {
      const lastLines = body.split('\n').slice(-5).join(' ').toLowerCase();

      for (const closing of closingPatterns) {
        if (lastLines.includes(closing)) {
          // Capitalize first letter
          const formatted =
            closing.charAt(0).toUpperCase() + closing.slice(1).toLowerCase();
          closingCounts.set(formatted, (closingCounts.get(formatted) || 0) + 1);
          break;
        }
      }
    }

    // Sort by frequency
    return Array.from(closingCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([closing]) => `${closing},`);
  }

  /**
   * Calculate average sentence length in words
   */
  private calculateAverageSentenceLength(bodies: string[]): number {
    let totalWords = 0;
    let totalSentences = 0;

    for (const body of bodies) {
      // Split into sentences
      const sentences = body.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      totalSentences += sentences.length;

      // Count words
      for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/).filter((w) => w.length > 0);
        totalWords += words.length;
      }
    }

    if (totalSentences === 0) return 15; // Default

    return Math.round(totalWords / totalSentences);
  }

  /**
   * Calculate formality level (0 = very casual, 1 = very formal)
   */
  private calculateFormalityLevel(bodies: string[]): number {
    const formalIndicators = [
      'sincerely',
      'respectfully',
      'kindly',
      'furthermore',
      'therefore',
      'however',
      'consequently',
      'regarding',
      'pursuant',
      'hereby',
    ];

    const casualIndicators = [
      'hey',
      '!',
      'yeah',
      'cool',
      'awesome',
      'great',
      'thanks!',
      'cheers',
      'btw',
      'fyi',
    ];

    let formalScore = 0;
    let casualScore = 0;

    for (const body of bodies) {
      const lowerBody = body.toLowerCase();

      formalScore += formalIndicators.filter((indicator) =>
        lowerBody.includes(indicator)
      ).length;
      casualScore += casualIndicators.filter((indicator) =>
        lowerBody.includes(indicator)
      ).length;
    }

    const totalIndicators = formalScore + casualScore;
    if (totalIndicators === 0) return 0.6; // Default: slightly professional

    // Normalize to 0-1 range
    const formalityLevel = formalScore / totalIndicators;

    // Smooth the range (0.3-0.9 instead of 0-1)
    return 0.3 + formalityLevel * 0.6;
  }

  /**
   * Extract common phrases used by the user
   */
  private extractCommonPhrases(bodies: string[]): string[] {
    const phrasePattern = /\b\w+\s+\w+\s+\w+\b/g; // 3-word phrases

    const phraseCounts: Map<string, number> = new Map();

    for (const body of bodies) {
      const phrases = body.toLowerCase().match(phrasePattern) || [];

      for (const phrase of phrases) {
        // Skip very common phrases
        if (this.isCommonPhrase(phrase)) continue;

        phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
      }
    }

    // Return phrases used at least twice, sorted by frequency
    return Array.from(phraseCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([phrase]) => phrase);
  }

  /**
   * Check if phrase is too common to be meaningful
   */
  private isCommonPhrase(phrase: string): boolean {
    const common = [
      'i would like',
      'let me know',
      'thank you for',
      'please let me',
      'if you have',
      'i am writing',
      'in order to',
      'as well as',
    ];

    return common.includes(phrase.toLowerCase());
  }

  /**
   * Analyze tone profile across emails
   */
  private analyzeToneProfile(bodies: string[]): {
    professional: number;
    casual: number;
    formal: number;
  } {
    let professionalCount = 0;
    let casualCount = 0;
    let formalCount = 0;

    for (const body of bodies) {
      const lowerBody = body.toLowerCase();

      // Professional indicators
      if (
        lowerBody.includes('best regards') ||
        lowerBody.includes('thank you') ||
        lowerBody.includes('please')
      ) {
        professionalCount++;
      }

      // Casual indicators
      if (
        lowerBody.includes('!') ||
        lowerBody.includes('thanks') ||
        lowerBody.includes('cheers')
      ) {
        casualCount++;
      }

      // Formal indicators
      if (
        lowerBody.includes('sincerely') ||
        lowerBody.includes('respectfully') ||
        lowerBody.includes('regards,')
      ) {
        formalCount++;
      }
    }

    const total = bodies.length || 1;

    return {
      professional: professionalCount / total,
      casual: casualCount / total,
      formal: formalCount / total,
    };
  }

  /**
   * Get default writing style when no emails are available
   */
  private getDefaultStyle(): WritingStyle {
    return {
      preferredGreetings: ['Hi {name},', 'Hello {name},'],
      preferredClosings: ['Best,', 'Thanks,', 'Best regards,'],
      averageSentenceLength: 15,
      formalityLevel: 0.6,
      commonPhrases: [],
      toneProfile: {
        professional: 0.7,
        casual: 0.2,
        formal: 0.1,
      },
    };
  }

  /**
   * Cache user style for performance
   * (In production, this would be cached in Redis)
   */
  private styleCache: Map<UserId, { style: WritingStyle; timestamp: number }> = new Map();
  private CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async getUserStyleCached(userId: UserId): Promise<WritingStyle> {
    const cached = this.styleCache.get(userId);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.debug({ userId }, 'Using cached writing style');
      return cached.style;
    }

    const style = await this.analyzeUserStyle(userId);

    this.styleCache.set(userId, {
      style,
      timestamp: Date.now(),
    });

    return style;
  }
}

/**
 * Export singleton instance
 */
export const styleAnalyzer = new StyleAnalyzer();
