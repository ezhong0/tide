/**
 * Email Triage Engine Unit Tests
 * Tests the AI-powered email triage and categorization system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EmailTriageEngine } from '../triage-engine';
import type { Email } from '../../types';
import { createUserId } from '@tide/types';

describe('EmailTriageEngine', () => {
  let engine: EmailTriageEngine;
  let mockEmail: Email;

  beforeEach(() => {
    engine = new EmailTriageEngine();

    mockEmail = {
      id: 'test-email-1',
      userId: createUserId('test-user-1'),
      provider: 'gmail',
      messageId: 'msg-123',
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Email',
      body: 'This is a test email body.',
      timestamp: new Date(),
      isRead: false,
      isStarred: false,
      hasAttachments: false,
    };
  });

  describe('analyze', () => {
    it('should analyze email and return complete triage result', async () => {
      const result = await engine.analyze(mockEmail);

      expect(result).toHaveProperty('importance');
      expect(result).toHaveProperty('urgency');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('actionRequired');
      expect(result).toHaveProperty('relationships');
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('canAutoHandle');
    });

    it('should return importance between 0 and 1', async () => {
      const result = await engine.analyze(mockEmail);

      expect(result.importance).toBeGreaterThanOrEqual(0);
      expect(result.importance).toBeLessThanOrEqual(1);
    });

    it('should identify urgent keywords in subject', async () => {
      const urgentEmail = {
        ...mockEmail,
        subject: 'URGENT: Action Required Immediately',
      };

      const result = await engine.analyze(urgentEmail);

      expect(result.importance).toBeGreaterThan(0.6);
      expect(result.urgency).toMatch(/immediate|critical/i);
    });

    it('should identify important keywords', async () => {
      const importantEmail = {
        ...mockEmail,
        subject: 'IMPORTANT: Board Meeting Tomorrow',
      };

      const result = await engine.analyze(importantEmail);

      expect(result.importance).toBeGreaterThan(0.5);
    });

    it('should detect ASAP requests', async () => {
      const asapEmail = {
        ...mockEmail,
        subject: 'Need this ASAP',
        body: 'Please review this document as soon as possible.',
      };

      const result = await engine.analyze(asapEmail);

      expect(result.urgency).toMatch(/immediate|critical/i);
    });

    it('should handle direct addressing (to one person)', async () => {
      const directEmail = {
        ...mockEmail,
        to: ['only-me@example.com'],
      };

      const result = await engine.analyze(directEmail);

      // Direct emails should have higher importance
      const groupEmail = {
        ...mockEmail,
        to: ['person1@example.com', 'person2@example.com', 'person3@example.com'],
      };

      const groupResult = await engine.analyze(groupEmail);

      expect(result.importance).toBeGreaterThan(groupResult.importance);
    });

    it('should categorize newsletters correctly', async () => {
      const newsletterEmail = {
        ...mockEmail,
        subject: 'Weekly Newsletter - Tech Updates',
        from: 'newsletter@company.com',
        body: 'This week in tech... Unsubscribe here',
      };

      const result = await engine.analyze(newsletterEmail);

      expect(result.category).toMatch(/newsletter|promotional/i);
      expect(result.importance).toBeLessThan(0.5);
    });

    it('should detect promotional emails', async () => {
      const promoEmail = {
        ...mockEmail,
        subject: '50% OFF Sale - Limited Time Only!',
        body: 'Buy now! Special offer! Click here!',
      };

      const result = await engine.analyze(promoEmail);

      expect(result.category).toMatch(/promotional|spam/i);
    });

    it('should identify actionable emails', async () => {
      const actionEmail = {
        ...mockEmail,
        subject: 'Please review and approve',
        body: 'Could you please review the attached document and let me know?',
      };

      const result = await engine.analyze(actionEmail);

      expect(result.actionRequired).toBe(true);
    });

    it('should detect questions requiring response', async () => {
      const questionEmail = {
        ...mockEmail,
        body: 'What time works best for you? Can we schedule a call?',
      };

      const result = await engine.analyze(questionEmail);

      expect(result.actionRequired).toBe(true);
    });

    it('should analyze sentiment', async () => {
      const positiveEmail = {
        ...mockEmail,
        body: 'Great work! I really appreciate your effort. Thank you so much!',
      };

      const result = await engine.analyze(positiveEmail);

      expect(result.sentiment).toMatch(/positive/i);
    });

    it('should detect negative sentiment', async () => {
      const negativeEmail = {
        ...mockEmail,
        subject: 'Issue with your work',
        body: 'This is unacceptable. We need to discuss this problem immediately.',
      };

      const result = await engine.analyze(negativeEmail);

      expect(result.sentiment).toMatch(/negative/i);
    });
  });

  describe('canAutoHandle', () => {
    it('should auto-handle only at high confidence (>0.85)', async () => {
      // Newsletter - high confidence, low importance
      const newsletterEmail = {
        ...mockEmail,
        subject: 'Daily Newsletter - Subscribe/Unsubscribe',
        from: 'noreply@newsletter.com',
        body: 'Your daily digest... Click to unsubscribe',
      };

      const result = await engine.analyze(newsletterEmail);

      // Auto-handle requires: strategy.auto = true AND confidence > 0.85
      if (result.canAutoHandle) {
        expect(result.confidence).toBeGreaterThan(0.85);
        expect(result.strategy.auto).toBe(true);
      }
    });

    it('should NOT auto-handle uncertain emails', async () => {
      const ambiguousEmail = {
        ...mockEmail,
        subject: 'Hi',
        body: 'Hey',
      };

      const result = await engine.analyze(ambiguousEmail);

      // Low content emails should have low confidence
      expect(result.canAutoHandle).toBe(false);
    });

    it('should NOT auto-handle urgent emails', async () => {
      const urgentEmail = {
        ...mockEmail,
        subject: 'CRITICAL: Server Down',
        body: 'Production server is down. Need immediate attention!',
      };

      const result = await engine.analyze(urgentEmail);

      // Urgent emails should not be auto-handled
      expect(result.canAutoHandle).toBe(false);
    });
  });

  describe('strategy', () => {
    it('should provide reasoning for strategy', async () => {
      const result = await engine.analyze(mockEmail);

      expect(result.strategy).toHaveProperty('reasoning');
      expect(result.strategy.reasoning).toBeTruthy();
      expect(typeof result.strategy.reasoning).toBe('string');
    });

    it('should suggest appropriate actions', async () => {
      const result = await engine.analyze(mockEmail);

      expect(result.strategy).toHaveProperty('suggestedAction');
    });

    it('should set priority for followup', async () => {
      const result = await engine.analyze(mockEmail);

      expect(result.strategy).toHaveProperty('priority');
    });
  });

  describe('confidence calculation', () => {
    it('should have high confidence for clear newsletters', async () => {
      const clearNewsletter = {
        ...mockEmail,
        subject: 'Weekly Digest - Unsubscribe',
        from: 'newsletter@company.com',
        to: ['subscriber@example.com'],
        body: 'This is your weekly newsletter. Click here to unsubscribe.',
      };

      const result = await engine.analyze(clearNewsletter);

      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should have low confidence for ambiguous emails', async () => {
      const ambiguousEmail = {
        ...mockEmail,
        subject: '',
        body: 'Thanks',
      };

      const result = await engine.analyze(ambiguousEmail);

      expect(result.confidence).toBeLessThan(0.6);
    });

    it('should have high confidence for clear spam', async () => {
      const spamEmail = {
        ...mockEmail,
        subject: 'You won $1,000,000! Click here NOW!!!',
        body: 'Congratulations! You are a winner! Send your bank details...',
      };

      const result = await engine.analyze(spamEmail);

      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.category).toMatch(/spam|promotional/i);
    });
  });

  describe('edge cases', () => {
    it('should handle emails with no subject', async () => {
      const noSubjectEmail = {
        ...mockEmail,
        subject: '',
      };

      const result = await engine.analyze(noSubjectEmail);

      expect(result).toBeTruthy();
      expect(result.importance).toBeDefined();
    });

    it('should handle emails with no body', async () => {
      const noBodyEmail = {
        ...mockEmail,
        body: '',
      };

      const result = await engine.analyze(noBodyEmail);

      expect(result).toBeTruthy();
      expect(result.importance).toBeDefined();
    });

    it('should handle emails with very long subjects', async () => {
      const longSubjectEmail = {
        ...mockEmail,
        subject: 'A'.repeat(1000),
      };

      const result = await engine.analyze(longSubjectEmail);

      expect(result).toBeTruthy();
    });

    it('should handle emails with very long bodies', async () => {
      const longBodyEmail = {
        ...mockEmail,
        body: 'Lorem ipsum '.repeat(10000),
      };

      const result = await engine.analyze(longBodyEmail);

      expect(result).toBeTruthy();
    });

    it('should handle emails with special characters', async () => {
      const specialCharsEmail = {
        ...mockEmail,
        subject: '🚨 URGENT: Review needed! 💼',
        body: 'Hello! ✨ Can you help? 🙏',
      };

      const result = await engine.analyze(specialCharsEmail);

      expect(result).toBeTruthy();
      expect(result.urgency).toBeTruthy();
    });

    it('should handle emails from unknown senders', async () => {
      const unknownSenderEmail = {
        ...mockEmail,
        from: 'random@random.com',
      };

      const result = await engine.analyze(unknownSenderEmail);

      expect(result).toBeTruthy();
      expect(result.importance).toBeLessThan(0.7);
    });
  });

  describe('performance', () => {
    it('should analyze email in <500ms', async () => {
      const start = Date.now();
      await engine.analyze(mockEmail);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should handle batch analysis efficiently', async () => {
      const emails = Array.from({ length: 10 }, (_, i) => ({
        ...mockEmail,
        id: `email-${i}`,
        subject: `Test Email ${i}`,
      }));

      const start = Date.now();
      await Promise.all(emails.map((email) => engine.analyze(email)));
      const duration = Date.now() - start;

      // 10 emails should complete in <5s (500ms each)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('relationships', () => {
    it('should identify sender relationships', async () => {
      const result = await engine.analyze(mockEmail);

      expect(result.relationships).toBeDefined();
      expect(Array.isArray(result.relationships)).toBe(true);
    });

    it('should prioritize emails from important senders', async () => {
      // This would normally query a relationship database
      // For now, test that the field exists
      const result = await engine.analyze(mockEmail);

      expect(result.relationships).toBeTruthy();
    });
  });
});

