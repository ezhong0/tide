/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MockPersonalizationEngine } from './MockPersonalizationEngine';
import { UserId, IInteraction, IConversationContext, Timestamp } from '@tide/types';
import crypto from 'crypto';

describe('MockPersonalizationEngine', () => {
  let engine: MockPersonalizationEngine;
  let userId: UserId;
  let emptyContext: IConversationContext;

  beforeEach(() => {
    engine = new MockPersonalizationEngine();
    userId = crypto.randomUUID() as UserId;
    emptyContext = {
      mentionedPeople: [],
      mentionedDates: [],
      mentionedProjects: [],
      upcomingMeetings: [],
      unreadEmails: 0
    };
  });

  // ============================================================================
  // observeInteraction
  // ============================================================================

  describe('observeInteraction', () => {
    it('should observe interaction', async () => {
      const interaction: IInteraction = {
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'message',
        data: { content: 'Hello' },
        outcome: 'success'
      };

      const result = await engine.observeInteraction(interaction);

      expect(result.success).toBe(true);
    });

    it('should learn from successful interactions', async () => {
      const interaction: IInteraction = {
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'action',
        data: { actionType: 'send_email' },
        outcome: 'success'
      };

      await engine.observeInteraction(interaction);

      const patterns = await engine.getLearnedPatterns(userId);
      expect(patterns.success).toBe(true);
      if (patterns.success) {
        expect(patterns.data.length).toBeGreaterThan(0);
      }
    });

    it('should not learn from failed interactions', async () => {
      const interaction: IInteraction = {
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'action',
        data: { actionType: 'send_email' },
        outcome: 'failure'
      };

      await engine.observeInteraction(interaction);

      const patterns = await engine.getLearnedPatterns(userId);
      expect(patterns.success).toBe(true);
      if (patterns.success) {
        expect(patterns.data.length).toBe(0);
      }
    });

    it('should complete within 50ms', async () => {
      const interaction: IInteraction = {
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'message',
        data: {},
        outcome: 'success'
      };

      const start = Date.now();
      await engine.observeInteraction(interaction);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  // ============================================================================
  // getUserPreferences
  // ============================================================================

  describe('getUserPreferences', () => {
    it('should return default preferences for new user', async () => {
      const result = await engine.getUserPreferences(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.communicationStyle).toBe('concise');
        expect(result.data.workingHours).toBeDefined();
        expect(result.data.notificationSettings).toBeDefined();
      }
    });

    it('should return updated preferences after update', async () => {
      await engine.updatePreferences(userId, {
        communicationStyle: 'detailed'
      });

      const result = await engine.getUserPreferences(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.communicationStyle).toBe('detailed');
      }
    });

    it('should complete within 50ms', async () => {
      const start = Date.now();
      await engine.getUserPreferences(userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  // ============================================================================
  // updatePreferences
  // ============================================================================

  describe('updatePreferences', () => {
    it('should update communication style', async () => {
      const result = await engine.updatePreferences(userId, {
        communicationStyle: 'bullet_points'
      });

      expect(result.success).toBe(true);

      const prefs = await engine.getUserPreferences(userId);
      if (prefs.success) {
        expect(prefs.data.communicationStyle).toBe('bullet_points');
      }
    });

    it('should update meeting preferences', async () => {
      const result = await engine.updatePreferences(userId, {
        meetingPreferences: {
          defaultDuration: 45,
          preferredTimes: ['14:00', '15:00']
        }
      });

      expect(result.success).toBe(true);

      const prefs = await engine.getUserPreferences(userId);
      if (prefs.success) {
        expect(prefs.data.meetingPreferences?.defaultDuration).toBe(45);
      }
    });

    it('should merge with existing preferences', async () => {
      await engine.updatePreferences(userId, {
        communicationStyle: 'detailed'
      });

      await engine.updatePreferences(userId, {
        meetingPreferences: {
          defaultDuration: 30
        }
      });

      const prefs = await engine.getUserPreferences(userId);
      if (prefs.success) {
        expect(prefs.data.communicationStyle).toBe('detailed');
        expect(prefs.data.meetingPreferences?.defaultDuration).toBe(30);
      }
    });

    it('should complete within 100ms', async () => {
      const start = Date.now();
      await engine.updatePreferences(userId, {
        communicationStyle: 'concise'
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // getLearnedPatterns
  // ============================================================================

  describe('getLearnedPatterns', () => {
    it('should return empty for new user', async () => {
      const result = await engine.getLearnedPatterns(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should return patterns after observations', async () => {
      // Observe multiple interactions
      for (let i = 0; i < 3; i++) {
        await engine.observeInteraction({
          userId,
          timestamp: Date.now() as Timestamp,
          type: 'action',
          data: { actionType: 'send_email' },
          outcome: 'success'
        });
      }

      const result = await engine.getLearnedPatterns(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0].usageCount).toBeGreaterThan(1);
      }
    });

    it('should filter by minimum confidence', async () => {
      await engine.observeInteraction({
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'action',
        data: { actionType: 'send_email' },
        outcome: 'success'
      });

      const lowConfResult = await engine.getLearnedPatterns(userId, 0.5);
      const highConfResult = await engine.getLearnedPatterns(userId, 0.95);

      expect(lowConfResult.success).toBe(true);
      expect(highConfResult.success).toBe(true);

      if (lowConfResult.success && highConfResult.success) {
        expect(lowConfResult.data.length).toBeGreaterThanOrEqual(highConfResult.data.length);
      }
    });

    it('should increase confidence with repeated use', async () => {
      // First interaction
      await engine.observeInteraction({
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'action',
        data: { actionType: 'send_email' },
        outcome: 'success'
      });

      const result1 = await engine.getLearnedPatterns(userId);
      const confidence1 = result1.success ? result1.data[0]?.confidence : 0;

      // Multiple more interactions
      for (let i = 0; i < 5; i++) {
        await engine.observeInteraction({
          userId,
          timestamp: Date.now() as Timestamp,
          type: 'action',
          data: { actionType: 'send_email' },
          outcome: 'success'
        });
      }

      const result2 = await engine.getLearnedPatterns(userId);
      const confidence2 = result2.success ? result2.data[0]?.confidence : 0;

      expect(confidence2).toBeGreaterThan(confidence1);
    });

    it('should complete within 100ms', async () => {
      const start = Date.now();
      await engine.getLearnedPatterns(userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // personalizeResponse
  // ============================================================================

  describe('personalizeResponse', () => {
    it('should return base response for new user', async () => {
      const base = 'This is a test response.';
      const result = await engine.personalizeResponse(base, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });

    it('should make response concise for concise style', async () => {
      await engine.updatePreferences(userId, {
        communicationStyle: 'concise'
      });

      const base = 'I would like to please help you with this task.';
      const result = await engine.personalizeResponse(base, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeLessThanOrEqual(base.length);
        expect(result.data).not.toContain('would like to');
      }
    });

    it('should convert to bullet points for bullet_points style', async () => {
      await engine.updatePreferences(userId, {
        communicationStyle: 'bullet_points'
      });

      const base =
        'First point is important. Second point is also good. Third point completes the set.';
      const result = await engine.personalizeResponse(base, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('•');
      }
    });

    it('should keep detailed style unchanged', async () => {
      await engine.updatePreferences(userId, {
        communicationStyle: 'detailed'
      });

      const base = 'This is a detailed response with lots of information.';
      const result = await engine.personalizeResponse(base, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(base);
      }
    });

    it('should complete within 100ms', async () => {
      const base = 'Test response';

      const start = Date.now();
      await engine.personalizeResponse(base, userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // getProactiveSuggestions
  // ============================================================================

  describe('getProactiveSuggestions', () => {
    it('should return suggestions based on context', async () => {
      const context: IConversationContext = {
        ...emptyContext,
        unreadEmails: 5
      };

      const result = await engine.getProactiveSuggestions(userId, context);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it('should suggest meeting reminders for upcoming meetings', async () => {
      const soonMeeting = Date.now() + 15 * 60 * 1000; // 15 minutes from now

      const context: IConversationContext = {
        ...emptyContext,
        upcomingMeetings: [
          {
            id: crypto.randomUUID() as any,
            title: 'Team Standup',
            startTime: soonMeeting as Timestamp,
            endTime: (soonMeeting + 30 * 60 * 1000) as Timestamp,
            attendees: []
          }
        ]
      };

      const result = await engine.getProactiveSuggestions(userId, context);

      expect(result.success).toBe(true);
      if (result.success) {
        const meetingReminder = result.data.find(s => s.id === 'meeting-reminder');
        expect(meetingReminder).toBeDefined();
      }
    });

    it('should include learned pattern suggestions', async () => {
      // Learn a pattern
      await engine.observeInteraction({
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'action',
        data: { actionType: 'send_email' },
        outcome: 'success'
      });

      // Increase confidence
      for (let i = 0; i < 5; i++) {
        await engine.observeInteraction({
          userId,
          timestamp: Date.now() as Timestamp,
          type: 'action',
          data: { actionType: 'send_email' },
          outcome: 'success'
        });
      }

      const result = await engine.getProactiveSuggestions(userId, emptyContext);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should have pattern-based suggestions
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it('should complete within 200ms', async () => {
      const start = Date.now();
      await engine.getProactiveSuggestions(userId, emptyContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  // ============================================================================
  // matchesPattern
  // ============================================================================

  describe('matchesPattern', () => {
    it('should return 0 for no patterns', async () => {
      const result = await engine.matchesPattern(userId, 'send_email', {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('should return confidence for matching pattern', async () => {
      // Learn pattern
      await engine.observeInteraction({
        userId,
        timestamp: Date.now() as Timestamp,
        type: 'action',
        data: { actionType: 'send_email' },
        outcome: 'success'
      });

      const result = await engine.matchesPattern(userId, 'send_email', {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeGreaterThan(0);
      }
    });

    it('should return higher confidence for frequent patterns', async () => {
      // Learn pattern multiple times
      for (let i = 0; i < 10; i++) {
        await engine.observeInteraction({
          userId,
          timestamp: Date.now() as Timestamp,
          type: 'action',
          data: { actionType: 'send_email' },
          outcome: 'success'
        });
      }

      const result = await engine.matchesPattern(userId, 'send_email', {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeGreaterThan(0.7);
      }
    });

    it('should complete within 50ms', async () => {
      const start = Date.now();
      await engine.matchesPattern(userId, 'send_email', {});
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
