import { logger } from '@tide/logger';
import type { EmailDraft } from '../types/index.js';

/**
 * Validation result for email drafts
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-1
}

/**
 * Email draft validation utilities
 */
export class DraftValidator {
  /**
   * Validate email draft for required elements and quality
   */
  validate(draft: EmailDraft): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 1.0;

    // Check for required elements
    if (!this.hasGreeting(draft.body)) {
      warnings.push('Missing greeting');
      score -= 0.1;
    }

    if (!this.hasClosing(draft.body)) {
      warnings.push('Missing closing');
      score -= 0.1;
    }

    // Check for empty content
    if (draft.body.trim().length < 10) {
      errors.push('Email body is too short');
      score = 0;
    }

    // Check for placeholder text
    if (this.hasPlaceholders(draft.body)) {
      errors.push('Email contains placeholder text that needs to be filled in');
      score -= 0.3;
    }

    // Check for proper formatting
    if (!this.hasProperFormatting(draft.body)) {
      warnings.push('Email formatting could be improved');
      score -= 0.05;
    }

    // Check subject line
    if (!draft.subject || draft.subject.trim().length === 0) {
      errors.push('Missing subject line');
      score -= 0.2;
    }

    // Check for tone consistency
    if (!this.hasToneConsistency(draft.body, draft.tone)) {
      warnings.push('Tone may not match intended style');
      score -= 0.1;
    }

    // Check for spelling/grammar issues (basic check)
    const spellIssues = this.checkBasicSpelling(draft.body);
    if (spellIssues.length > 0) {
      warnings.push(...spellIssues);
      score -= 0.05 * spellIssues.length;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, Math.min(1, score));

    const isValid = errors.length === 0 && score >= 0.6;

    return {
      isValid,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Check if draft has a greeting
   */
  private hasGreeting(body: string): boolean {
    const greetings = [
      /^hi\s+\w+/i,
      /^hello\s+\w+/i,
      /^dear\s+\w+/i,
      /^hey\s+\w+/i,
      /^good\s+(morning|afternoon|evening)/i,
    ];

    const firstLine = body.split('\n')[0]?.toLowerCase() || '';
    return greetings.some((pattern) => pattern.test(firstLine));
  }

  /**
   * Check if draft has a closing
   */
  private hasClosing(body: string): boolean {
    const closings = [
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
    ];

    const lastLines = body.split('\n').slice(-3).join(' ').toLowerCase();
    return closings.some((closing) => lastLines.includes(closing));
  }

  /**
   * Check for placeholder text
   */
  private hasPlaceholders(body: string): boolean {
    const placeholders = [
      /\[.*?\]/,
      /\{.*?\}/,
      /<.*?>/,
      /\(insert.*?\)/i,
      /\(your.*?\)/i,
      /xxx+/i,
      /todo/i,
    ];

    return placeholders.some((pattern) => pattern.test(body));
  }

  /**
   * Check for proper formatting
   */
  private hasProperFormatting(body: string): boolean {
    // Check for reasonable paragraph breaks
    const lines = body.split('\n');
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

    // Should have at least 2 paragraphs for most emails
    const paragraphBreaks = lines.filter((line) => line.trim().length === 0).length;

    // Check for overly long lines
    const hasLongLines = lines.some((line) => line.length > 120);

    return paragraphBreaks >= 1 && !hasLongLines;
  }

  /**
   * Check tone consistency
   */
  private hasToneConsistency(body: string, expectedTone?: string): boolean {
    if (!expectedTone) return true;

    const lowerBody = body.toLowerCase();

    const toneIndicators = {
      formal: ['sincerely', 'respectfully', 'kindly', 'furthermore', 'therefore'],
      professional: ['regards', 'best', 'thank you', 'please', 'would appreciate'],
      friendly: ['thanks', 'hope', 'cheers', '!', 'great', 'wonderful'],
      casual: ['hey', 'cool', 'awesome', 'yeah', 'sure thing'],
    };

    const indicators = toneIndicators[expectedTone as keyof typeof toneIndicators] || [];
    const matchCount = indicators.filter((indicator) => lowerBody.includes(indicator)).length;

    // Should have at least one tone indicator
    return matchCount > 0;
  }

  /**
   * Basic spelling check (very simple)
   */
  private checkBasicSpelling(body: string): string[] {
    const issues: string[] = [];

    // Common typos
    const commonTypos: Record<string, string> = {
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definately': 'definitely',
      'accomodate': 'accommodate',
      'untill': 'until',
    };

    const lowerBody = body.toLowerCase();
    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (lowerBody.includes(typo)) {
        issues.push(`Possible typo: "${typo}" should be "${correct}"`);
      }
    }

    // Check for repeated words
    const words = body.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].toLowerCase() === words[i + 1].toLowerCase() && words[i].length > 2) {
        issues.push(`Repeated word: "${words[i]}"`);
      }
    }

    return issues;
  }

  /**
   * Compare drafts to ensure they are distinct
   */
  compareDrafts(draft1: EmailDraft, draft2: EmailDraft): { similarity: number; isDistinct: boolean } {
    // Calculate similarity based on word overlap
    const words1 = new Set(draft1.body.toLowerCase().split(/\s+/));
    const words2 = new Set(draft2.body.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((word) => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    const similarity = intersection.size / union.size;

    // Drafts should be less than 70% similar to be considered distinct
    const isDistinct = similarity < 0.7;

    return { similarity, isDistinct };
  }

  /**
   * Validate that a set of drafts are sufficiently different
   */
  validateDistinctness(drafts: EmailDraft[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 1.0;

    if (drafts.length < 2) {
      return { isValid: true, errors, warnings, score };
    }

    // Compare all pairs of drafts
    for (let i = 0; i < drafts.length; i++) {
      for (let j = i + 1; j < drafts.length; j++) {
        const comparison = this.compareDrafts(drafts[i], drafts[j]);

        if (!comparison.isDistinct) {
          errors.push(
            `Drafts ${i + 1} and ${j + 1} are too similar (${Math.round(comparison.similarity * 100)}% overlap)`
          );
          score -= 0.3;
        } else if (comparison.similarity > 0.5) {
          warnings.push(
            `Drafts ${i + 1} and ${j + 1} have moderate similarity (${Math.round(comparison.similarity * 100)}%)`
          );
          score -= 0.1;
        }
      }
    }

    // Check that length varies
    const lengths = drafts.map((d) => d.length || d.body.length);
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);

    if (maxLength / minLength < 1.3) {
      warnings.push('Drafts do not vary significantly in length');
      score -= 0.1;
    }

    score = Math.max(0, Math.min(1, score));
    const isValid = errors.length === 0;

    return { isValid, errors, warnings, score };
  }

  /**
   * Validate email metadata
   */
  validateMetadata(draft: EmailDraft): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 1.0;

    // Check confidence score
    if (draft.confidence === undefined || draft.confidence < 0 || draft.confidence > 1) {
      errors.push('Invalid confidence score');
      score -= 0.2;
    } else if (draft.confidence < 0.5) {
      warnings.push('Low confidence score suggests draft quality may be poor');
      score -= 0.1;
    }

    // Check tone is valid
    const validTones = ['professional', 'friendly', 'formal', 'casual'];
    if (draft.tone && !validTones.includes(draft.tone)) {
      errors.push(`Invalid tone: ${draft.tone}`);
      score -= 0.1;
    }

    // Check length consistency
    const actualLength = draft.body.length;
    const reportedLength = draft.length || 0;

    if (Math.abs(actualLength - reportedLength) > 10) {
      warnings.push('Reported length does not match actual body length');
      score -= 0.05;
    }

    score = Math.max(0, Math.min(1, score));
    const isValid = errors.length === 0;

    return { isValid, errors, warnings, score };
  }
}

/**
 * Export singleton validator instance
 */
export const draftValidator = new DraftValidator();
