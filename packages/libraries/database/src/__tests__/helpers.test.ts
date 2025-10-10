/**
 * Database Helpers Unit Tests
 * Tests JSONB intelligence data manipulation functions
 */

import { describe, it, expect } from 'vitest';
import {
  updateEmailIntelligence,
  addAutonomousAction,
  groupEmailsByThread,
  getDefaultEmailIntelligence,
  updateContactIntelligence,
  getDefaultContactIntelligence,
  updateEventIntelligence,
  addEventConflict,
  getDefaultEventIntelligence,
  addSubtask,
  getDefaultTaskStructure,
  buildJSONBContainsQuery,
  validateEmailIntelligence,
  generateId,
} from '../helpers';
import type { EmailIntelligence, ContactIntelligence, EventIntelligence, TaskStructure, Email } from '@tide/types';
import { createUserId } from '@tide/types';

describe('Database Helpers', () => {
  describe('Email Intelligence Helpers', () => {
    it('should get default email intelligence structure', () => {
      const intel = getDefaultEmailIntelligence();

      expect(intel).toHaveProperty('importance');
      expect(intel).toHaveProperty('urgency');
      expect(intel).toHaveProperty('category');
      expect(intel).toHaveProperty('sentiment');
      expect(intel).toHaveProperty('actionRequired');
      expect(intel).toHaveProperty('relationships');
      expect(intel).toHaveProperty('autonomousActions');
      expect(intel).toHaveProperty('strategy');

      expect(intel.importance).toBe(0.5);
      expect(intel.urgency).toBe('normal');
      expect(intel.actionRequired).toBe(false);
      expect(intel.autonomousActions).toEqual([]);
    });

    it('should update email intelligence immutably', () => {
      const original = getDefaultEmailIntelligence();
      const updated = updateEmailIntelligence(original, {
        importance: 0.8,
        urgency: 'high',
      });

      expect(original.importance).toBe(0.5);
      expect(original.urgency).toBe('normal');

      expect(updated.importance).toBe(0.8);
      expect(updated.urgency).toBe('high');

      expect(updated).not.toBe(original);
    });

    it('should merge partial updates correctly', () => {
      const original = getDefaultEmailIntelligence();
      original.category = 'work';
      original.sentiment = 'positive';

      const updated = updateEmailIntelligence(original, {
        importance: 0.9,
      });

      expect(updated.importance).toBe(0.9);
      expect(updated.category).toBe('work');
      expect(updated.sentiment).toBe('positive');
    });

    it('should add autonomous action to intelligence', () => {
      const intel = getDefaultEmailIntelligence();

      const updated = addAutonomousAction(intel, {
        action: 'categorize',
        details: { category: 'newsletter', confidence: 0.95 },
      });

      expect(updated.autonomousActions).toHaveLength(1);
      expect(updated.autonomousActions[0].action).toBe('categorize');
      expect(updated.autonomousActions[0].details.category).toBe('newsletter');
      expect(updated.autonomousActions[0].timestamp).toBeDefined();
    });

    it('should add multiple autonomous actions', () => {
      let intel = getDefaultEmailIntelligence();

      intel = addAutonomousAction(intel, {
        action: 'categorize',
        details: { category: 'work' },
      });

      intel = addAutonomousAction(intel, {
        action: 'archive',
        details: { reason: 'low_importance' },
      });

      expect(intel.autonomousActions).toHaveLength(2);
      expect(intel.autonomousActions[0].action).toBe('categorize');
      expect(intel.autonomousActions[1].action).toBe('archive');
    });

    it('should preserve immutability when adding actions', () => {
      const original = getDefaultEmailIntelligence();
      const updated = addAutonomousAction(original, {
        action: 'test',
        details: {},
      });

      expect(original.autonomousActions).toHaveLength(0);
      expect(updated.autonomousActions).toHaveLength(1);
      expect(updated).not.toBe(original);
    });

    it('should validate email intelligence structure', () => {
      const valid = getDefaultEmailIntelligence();
      expect(validateEmailIntelligence(valid)).toBe(true);

      const invalid = { importance: 'invalid' };
      expect(validateEmailIntelligence(invalid)).toBe(false);

      expect(validateEmailIntelligence(null)).toBe(false);
      expect(validateEmailIntelligence(undefined)).toBe(false);
      expect(validateEmailIntelligence({})).toBe(false);
    });

    it('should validate required fields', () => {
      const incomplete = {
        importance: 0.5,
        urgency: 'normal',
        // missing other required fields
      };

      expect(validateEmailIntelligence(incomplete)).toBe(false);
    });
  });

  describe('Thread Grouping', () => {
    it('should group emails by thread ID', () => {
      const emails: Email[] = [
        {
          id: 'email-1',
          userId: createUserId('user-1'),
          provider: 'gmail',
          messageId: 'msg-1',
          threadId: 'thread-A',
          from: 'sender@example.com',
          to: ['me@example.com'],
          subject: 'Original Message',
          body: 'Body',
          timestamp: new Date('2025-01-01'),
          isRead: true,
        },
        {
          id: 'email-2',
          userId: createUserId('user-1'),
          provider: 'gmail',
          messageId: 'msg-2',
          threadId: 'thread-A',
          from: 'me@example.com',
          to: ['sender@example.com'],
          subject: 'Re: Original Message',
          body: 'Reply',
          timestamp: new Date('2025-01-02'),
          isRead: true,
        },
        {
          id: 'email-3',
          userId: createUserId('user-1'),
          provider: 'gmail',
          messageId: 'msg-3',
          threadId: 'thread-B',
          from: 'other@example.com',
          to: ['me@example.com'],
          subject: 'Different Thread',
          body: 'Body',
          timestamp: new Date('2025-01-03'),
          isRead: false,
        },
      ] as Email[];

      const threads = groupEmailsByThread(emails);

      expect(threads).toHaveLength(2);

      const threadA = threads.find((t) => t.threadId === 'thread-A');
      expect(threadA).toBeDefined();
      expect(threadA!.emails).toHaveLength(2);
      expect(threadA!.messageCount).toBe(2);
      expect(threadA!.hasUnread).toBe(false);

      const threadB = threads.find((t) => t.threadId === 'thread-B');
      expect(threadB).toBeDefined();
      expect(threadB!.emails).toHaveLength(1);
      expect(threadB!.hasUnread).toBe(true);
    });

    it('should sort emails within thread by timestamp', () => {
      const emails: Email[] = [
        {
          id: 'email-2',
          threadId: 'thread-1',
          timestamp: new Date('2025-01-02'),
          isRead: true,
        },
        {
          id: 'email-1',
          threadId: 'thread-1',
          timestamp: new Date('2025-01-01'),
          isRead: true,
        },
        {
          id: 'email-3',
          threadId: 'thread-1',
          timestamp: new Date('2025-01-03'),
          isRead: true,
        },
      ] as Email[];

      const threads = groupEmailsByThread(emails);

      expect(threads).toHaveLength(1);
      expect(threads[0].emails[0].id).toBe('email-1');
      expect(threads[0].emails[1].id).toBe('email-2');
      expect(threads[0].emails[2].id).toBe('email-3');
    });

    it('should use latest timestamp as thread timestamp', () => {
      const emails: Email[] = [
        {
          id: 'email-1',
          threadId: 'thread-1',
          timestamp: new Date('2025-01-01'),
          isRead: true,
        },
        {
          id: 'email-2',
          threadId: 'thread-1',
          timestamp: new Date('2025-01-05'),
          isRead: true,
        },
      ] as Email[];

      const threads = groupEmailsByThread(emails);

      expect(threads[0].lastMessageAt).toEqual(new Date('2025-01-05'));
    });

    it('should handle emails without thread IDs', () => {
      const emails: Email[] = [
        {
          id: 'email-1',
          threadId: undefined,
          timestamp: new Date(),
          isRead: true,
        } as Email,
      ];

      const threads = groupEmailsByThread(emails);

      // Each email without threadId should create its own thread
      expect(threads).toHaveLength(1);
    });

    it('should handle empty email array', () => {
      const threads = groupEmailsByThread([]);
      expect(threads).toEqual([]);
    });
  });

  describe('Contact Intelligence Helpers', () => {
    it('should get default contact intelligence', () => {
      const intel = getDefaultContactIntelligence();

      expect(intel).toHaveProperty('importance');
      expect(intel).toHaveProperty('relationship');
      expect(intel).toHaveProperty('communicationPattern');
      expect(intel).toHaveProperty('topics');

      expect(intel.importance).toBe(0.5);
      expect(intel.topics).toEqual([]);
      expect(intel.communicationPattern).toHaveProperty('frequency');
      expect(intel.communicationPattern).toHaveProperty('lastContact');
    });

    it('should update contact intelligence immutably', () => {
      const original = getDefaultContactIntelligence();
      const updated = updateContactIntelligence(original, {
        importance: 0.9,
        relationship: 'colleague',
      });

      expect(original.importance).toBe(0.5);
      expect(updated.importance).toBe(0.9);
      expect(updated.relationship).toBe('colleague');
    });

    it('should update communication pattern', () => {
      const intel = getDefaultContactIntelligence();
      const now = new Date();

      const updated = updateContactIntelligence(intel, {
        communicationPattern: {
          frequency: 'weekly',
          lastContact: now,
          responseTime: 7200, // 2 hours in seconds
        },
      });

      expect(updated.communicationPattern.frequency).toBe('weekly');
      expect(updated.communicationPattern.lastContact).toBe(now);
      expect(updated.communicationPattern.responseTime).toBe(7200);
    });

    it('should add topics to contact', () => {
      const intel = getDefaultContactIntelligence();

      const updated = updateContactIntelligence(intel, {
        topics: ['machine-learning', 'product-design', 'hiring'],
      });

      expect(updated.topics).toHaveLength(3);
      expect(updated.topics).toContain('machine-learning');
    });
  });

  describe('Event Intelligence Helpers', () => {
    it('should get default event intelligence', () => {
      const intel = getDefaultEventIntelligence();

      expect(intel).toHaveProperty('conflicts');
      expect(intel).toHaveProperty('optimizations');
      expect(intel).toHaveProperty('preparation');

      expect(intel.conflicts).toEqual([]);
      expect(intel.optimizations).toEqual([]);
      expect(intel.preparation).toHaveProperty('estimatedPrepTime');
      expect(intel.preparation).toHaveProperty('suggestedMaterials');
    });

    it('should update event intelligence immutably', () => {
      const original = getDefaultEventIntelligence();
      const updated = updateEventIntelligence(original, {
        preparation: {
          estimatedPrepTime: 3600,
          suggestedMaterials: ['Presentation slides', 'Q3 report'],
          relatedEmails: [],
          relatedTasks: [],
        },
      });

      expect(original.preparation.estimatedPrepTime).toBe(0);
      expect(updated.preparation.estimatedPrepTime).toBe(3600);
      expect(updated.preparation.suggestedMaterials).toHaveLength(2);
    });

    it('should add conflict to event', () => {
      const intel = getDefaultEventIntelligence();

      const updated = addEventConflict(intel, {
        type: 'schedule',
        description: 'Overlaps with team standup',
        suggested_resolution: 'Move meeting to 2pm',
      });

      expect(updated.conflicts).toHaveLength(1);
      expect(updated.conflicts[0].type).toBe('schedule');
      expect(updated.conflicts[0].description).toContain('Overlaps');
    });

    it('should add multiple conflicts', () => {
      let intel = getDefaultEventIntelligence();

      intel = addEventConflict(intel, {
        type: 'schedule',
        description: 'Conflict 1',
        suggested_resolution: 'Resolution 1',
      });

      intel = addEventConflict(intel, {
        type: 'resource',
        description: 'Conflict 2',
        suggested_resolution: 'Resolution 2',
      });

      expect(intel.conflicts).toHaveLength(2);
    });

    it('should add optimizations', () => {
      const intel = getDefaultEventIntelligence();

      const updated = updateEventIntelligence(intel, {
        optimizations: [
          {
            type: 'duration',
            suggestion: 'Reduce meeting from 60min to 30min',
            potential_saving: 1800,
          },
        ],
      });

      expect(updated.optimizations).toHaveLength(1);
      expect(updated.optimizations[0].potential_saving).toBe(1800);
    });
  });

  describe('Task Structure Helpers', () => {
    it('should get default task structure', () => {
      const structure = getDefaultTaskStructure();

      expect(structure).toHaveProperty('subtasks');
      expect(structure).toHaveProperty('dependencies');
      expect(structure).toHaveProperty('estimatedDuration');
      expect(structure).toHaveProperty('actualDuration');

      expect(structure.subtasks).toEqual([]);
      expect(structure.dependencies).toEqual([]);
    });

    it('should add subtask to structure', () => {
      const structure = getDefaultTaskStructure();

      const updated = addSubtask(structure, {
        id: 'subtask-1',
        title: 'Research options',
        order_index: 0,
      });

      expect(updated.subtasks).toHaveLength(1);
      expect(updated.subtasks[0].id).toBe('subtask-1');
      expect(updated.subtasks[0].title).toBe('Research options');
      expect(updated.subtasks[0].status).toBe('pending');
    });

    it('should add multiple subtasks in order', () => {
      let structure = getDefaultTaskStructure();

      structure = addSubtask(structure, {
        id: 'subtask-1',
        title: 'First',
        order_index: 0,
      });

      structure = addSubtask(structure, {
        id: 'subtask-2',
        title: 'Second',
        order_index: 1,
      });

      structure = addSubtask(structure, {
        id: 'subtask-3',
        title: 'Third',
        order_index: 2,
      });

      expect(structure.subtasks).toHaveLength(3);
      expect(structure.subtasks[0].order_index).toBe(0);
      expect(structure.subtasks[1].order_index).toBe(1);
      expect(structure.subtasks[2].order_index).toBe(2);
    });

    it('should add subtask with custom status', () => {
      const structure = getDefaultTaskStructure();

      const updated = addSubtask(structure, {
        id: 'subtask-1',
        title: 'Done task',
        order_index: 0,
        status: 'completed',
      });

      expect(updated.subtasks[0].status).toBe('completed');
    });

    it('should preserve immutability when adding subtasks', () => {
      const original = getDefaultTaskStructure();
      const updated = addSubtask(original, {
        id: 'subtask-1',
        title: 'Test',
        order_index: 0,
      });

      expect(original.subtasks).toHaveLength(0);
      expect(updated.subtasks).toHaveLength(1);
    });
  });

  describe('JSONB Query Builders', () => {
    it('should build JSONB contains query for simple object', () => {
      const query = buildJSONBContainsQuery('intelligence', {
        urgency: 'high',
      });

      expect(query).toContain('intelligence');
      expect(query).toContain('@>');
      expect(query).toContain('urgency');
      expect(query).toContain('high');
    });

    it('should build JSONB contains query for nested object', () => {
      const query = buildJSONBContainsQuery('structure', {
        subtasks: [{ status: 'completed' }],
      });

      expect(query).toContain('structure');
      expect(query).toContain('@>');
      expect(query).toContain('subtasks');
      expect(query).toContain('completed');
    });

    it('should escape special characters', () => {
      const query = buildJSONBContainsQuery('data', {
        text: "O'Reilly",
      });

      // Should escape single quotes
      expect(query).toContain('O\\');
    });

    it('should handle boolean values', () => {
      const query = buildJSONBContainsQuery('intelligence', {
        actionRequired: true,
      });

      expect(query).toContain('true');
    });

    it('should handle numeric values', () => {
      const query = buildJSONBContainsQuery('intelligence', {
        importance: 0.8,
      });

      expect(query).toContain('0.8');
    });

    it('should handle arrays', () => {
      const query = buildJSONBContainsQuery('intelligence', {
        topics: ['ai', 'machine-learning'],
      });

      expect(query).toContain('ai');
      expect(query).toContain('machine-learning');
    });
  });

  describe('Utility Functions', () => {
    it('should generate valid UUID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id1).toMatch(uuidRegex);
      expect(id2).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(generateId());
      }

      expect(ids.size).toBe(count);
    });
  });

  describe('Performance', () => {
    it('should update intelligence quickly (<1ms)', () => {
      const intel = getDefaultEmailIntelligence();

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        updateEmailIntelligence(intel, { importance: Math.random() });
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // 1000 updates in <100ms = <0.1ms each
    });

    it('should add actions efficiently', () => {
      let intel = getDefaultEmailIntelligence();

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        intel = addAutonomousAction(intel, {
          action: `action-${i}`,
          details: { index: i },
        });
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50); // 100 actions in <50ms
      expect(intel.autonomousActions).toHaveLength(100);
    });

    it('should group large thread sets efficiently', () => {
      const emailCount = 1000;
      const threadCount = 100;

      const emails: Email[] = Array.from({ length: emailCount }, (_, i) => ({
        id: `email-${i}`,
        threadId: `thread-${i % threadCount}`,
        timestamp: new Date(Date.now() + i * 1000),
        isRead: i % 2 === 0,
      })) as Email[];

      const start = performance.now();
      const threads = groupEmailsByThread(emails);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // <100ms for 1000 emails
      expect(threads).toHaveLength(threadCount);
    });
  });
});

