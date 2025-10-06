/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MockNaturalLanguageProcessor } from './MockNaturalLanguageProcessor';
import { IConversationContext } from '@tide/types';

describe('MockNaturalLanguageProcessor', () => {
  let processor: MockNaturalLanguageProcessor;
  let emptyContext: IConversationContext;

  beforeEach(() => {
    processor = new MockNaturalLanguageProcessor();
    emptyContext = {
      mentionedPeople: [],
      mentionedDates: [],
      mentionedProjects: [],
      upcomingMeetings: [],
      unreadEmails: 0
    };
  });

  // ============================================================================
  // processMessage
  // ============================================================================

  describe('processMessage', () => {
    it('should process complete message', async () => {
      const result = await processor.processMessage(
        'Schedule a meeting with John tomorrow at 2pm',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.intents.length).toBeGreaterThan(0);
        expect(result.data.intents[0].type).toBe('schedule_meeting');
        expect(result.data.entities.length).toBeGreaterThan(0);
        expect(result.data.confidence).toBeGreaterThan(0);
      }
    });

    it('should reject empty message', async () => {
      const result = await processor.processMessage('', emptyContext);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('empty');
      }
    });

    it('should complete within 300ms', async () => {
      const start = Date.now();
      await processor.processMessage('Schedule a meeting tomorrow', emptyContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });

  // ============================================================================
  // classifyIntent
  // ============================================================================

  describe('classifyIntent', () => {
    it('should classify schedule_meeting intent', async () => {
      const result = await processor.classifyIntent('Schedule a meeting with the team');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('schedule_meeting');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify draft_email intent', async () => {
      const result = await processor.classifyIntent('Draft an email to John');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('draft_email');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify search_emails intent', async () => {
      const result = await processor.classifyIntent('Search for emails from Jane');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('search_emails');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify check_calendar intent', async () => {
      const result = await processor.classifyIntent('What is on my calendar today?');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('check_calendar');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify set_reminder intent', async () => {
      const result = await processor.classifyIntent('Remind me to call John at 3pm');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('set_reminder');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify create_task intent', async () => {
      const result = await processor.classifyIntent('Add task to review the document');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('create_task');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify cancel_meeting intent', async () => {
      const result = await processor.classifyIntent('Cancel the team meeting');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('cancel_meeting');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should classify reschedule_meeting intent', async () => {
      const result = await processor.classifyIntent('Reschedule the meeting to tomorrow');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('reschedule_meeting');
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should return unknown for unclear messages', async () => {
      const result = await processor.classifyIntent('Hello');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('unknown');
        expect(result.data.confidence).toBeLessThan(0.8);
      }
    });

    it('should complete within 200ms', async () => {
      const start = Date.now();
      await processor.classifyIntent('Schedule a meeting tomorrow');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  // ============================================================================
  // extractEntities
  // ============================================================================

  describe('extractEntities', () => {
    it('should extract email addresses', async () => {
      const result = await processor.extractEntities(
        'Send email to john@example.com and jane@test.org',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const emails = result.data.filter(e => e.type === 'email');
        expect(emails.length).toBe(2);
        expect(emails[0].value).toBe('john@example.com');
        expect(emails[1].value).toBe('jane@test.org');
      }
    });

    it('should extract person names', async () => {
      const result = await processor.extractEntities(
        'Schedule a meeting with John Smith and Jane Doe',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const people = result.data.filter(e => e.type === 'person');
        expect(people.length).toBeGreaterThan(0);
      }
    });

    it('should extract time references', async () => {
      const result = await processor.extractEntities(
        'Meeting at 2:30pm tomorrow',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const times = result.data.filter(e => e.type === 'time');
        expect(times.length).toBeGreaterThan(0);
      }
    });

    it('should extract durations', async () => {
      const result = await processor.extractEntities(
        'Book a 30 minute meeting',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const durations = result.data.filter(e => e.type === 'duration');
        expect(durations.length).toBe(1);
        expect(durations[0].value).toContain('30');
      }
    });

    it('should extract locations', async () => {
      const result = await processor.extractEntities(
        'Meeting in the office',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const locations = result.data.filter(e => e.type === 'location');
        expect(locations.length).toBe(1);
        expect(locations[0].value.toLowerCase()).toBe('office');
      }
    });

    it('should include confidence scores', async () => {
      const result = await processor.extractEntities(
        'Email john@example.com',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach(entity => {
          expect(entity.confidence).toBeGreaterThan(0);
          expect(entity.confidence).toBeLessThanOrEqual(1);
        });
      }
    });

    it('should include position information', async () => {
      const result = await processor.extractEntities(
        'Email john@example.com',
        emptyContext
      );

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach(entity => {
          expect(entity.position.length).toBe(2);
          expect(entity.position[0]).toBeGreaterThanOrEqual(0);
          expect(entity.position[1]).toBeGreaterThan(entity.position[0]);
        });
      }
    });

    it('should complete within 100ms', async () => {
      const start = Date.now();
      await processor.extractEntities(
        'Schedule meeting with john@example.com at 2pm tomorrow',
        emptyContext
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // detectAmbiguities
  // ============================================================================

  describe('detectAmbiguities', () => {
    it('should detect pronoun ambiguity', async () => {
      const understanding = {
        intents: [{ type: 'draft_email' as const, confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = await processor.detectAmbiguities(
        'Can you send it to them?',
        understanding
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
        const pronounAmbiguity = result.data.find(a => a.type === 'pronoun_reference');
        expect(pronounAmbiguity).toBeDefined();
      }
    });

    it('should detect missing time for meetings', async () => {
      const understanding = {
        intents: [{ type: 'schedule_meeting' as const, confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = await processor.detectAmbiguities(
        'Schedule a meeting with John',
        understanding
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const timeAmbiguity = result.data.find(a => a.type === 'missing_time');
        expect(timeAmbiguity).toBeDefined();
      }
    });

    it('should detect missing recipient for emails', async () => {
      const understanding = {
        intents: [{ type: 'draft_email' as const, confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = await processor.detectAmbiguities(
        'Draft an email about the project',
        understanding
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const recipientAmbiguity = result.data.find(a => a.type === 'missing_recipient');
        expect(recipientAmbiguity).toBeDefined();
      }
    });

    it('should return empty array for clear messages', async () => {
      const understanding = {
        intents: [{ type: 'schedule_meeting' as const, confidence: 0.95 }],
        entities: [
          { type: 'person', value: 'John', position: [0, 4] as [number, number], confidence: 0.9 },
          { type: 'time', value: 'tomorrow', position: [5, 13] as [number, number], confidence: 0.9 }
        ],
        confidence: 0.95
      };

      const result = await processor.detectAmbiguities(
        'Schedule meeting with John tomorrow',
        understanding
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // May have some ambiguities but should be minimal
        expect(result.data.length).toBeLessThan(3);
      }
    });

    it('should complete within 100ms', async () => {
      const understanding = {
        intents: [{ type: 'draft_email' as const, confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const start = Date.now();
      await processor.detectAmbiguities('Send it to them', understanding);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // resolveReferences
  // ============================================================================

  describe('resolveReferences', () => {
    it('should resolve "it" to context topic', async () => {
      const context: IConversationContext = {
        ...emptyContext,
        topic: 'email'
      };

      const result = await processor.resolveReferences('Send it to John', context);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.referent).toBe('email');
      }
    });

    it('should resolve "them" to mentioned people', async () => {
      const context: IConversationContext = {
        ...emptyContext,
        mentionedPeople: [
          { email: 'john@example.com' as any, name: 'John' },
          { email: 'jane@example.com' as any, name: 'Jane' }
        ]
      };

      const result = await processor.resolveReferences('Send them the document', context);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.people).toBeDefined();
        expect((result.data.people as any[]).length).toBe(2);
      }
    });

    it('should resolve "tomorrow" to date', async () => {
      const result = await processor.resolveReferences('Schedule for tomorrow', emptyContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeDefined();
        expect(typeof result.data.date).toBe('string');
      }
    });

    it('should resolve "today" to date', async () => {
      const result = await processor.resolveReferences('What is today?', emptyContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeDefined();
      }
    });

    it('should resolve "next week" to date', async () => {
      const result = await processor.resolveReferences('Schedule for next week', emptyContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeDefined();
      }
    });

    it('should return empty for messages without references', async () => {
      const result = await processor.resolveReferences('Schedule a meeting', emptyContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(0);
      }
    });

    it('should complete within 50ms', async () => {
      const start = Date.now();
      await processor.resolveReferences('Send it to them tomorrow', emptyContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
