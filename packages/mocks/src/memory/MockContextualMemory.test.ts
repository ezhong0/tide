/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MockContextualMemory } from './MockContextualMemory';
import {
  UserId,
  ConversationId,
  SessionId,
  IConversationContext,
  ISessionMemory,
  ILearnedPattern,
  Timestamp,
  UUID
} from '@tide/types';
import crypto from 'crypto';

describe('MockContextualMemory', () => {
  let memory: MockContextualMemory;
  let userId: UserId;
  let conversationId: ConversationId;
  let sessionId: SessionId;
  let testContext: IConversationContext;

  beforeEach(() => {
    memory = new MockContextualMemory();
    userId = crypto.randomUUID() as UserId;
    conversationId = UUID(crypto.randomUUID());
    sessionId = UUID(crypto.randomUUID()) as SessionId;

    testContext = {
      mentionedPeople: [],
      mentionedDates: [],
      mentionedProjects: [],
      upcomingMeetings: [],
      unreadEmails: 0
    };
  });

  // ============================================================================
  // storeContext / retrieveContext
  // ============================================================================

  describe('storeContext / retrieveContext', () => {
    it('should store and retrieve context', async () => {
      const storeResult = await memory.storeContext(conversationId, testContext);
      expect(storeResult.success).toBe(true);

      const retrieveResult = await memory.retrieveContext(conversationId);
      expect(retrieveResult.success).toBe(true);
      if (retrieveResult.success) {
        expect(retrieveResult.data).toEqual(testContext);
      }
    });

    it('should return error for non-existent context', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await memory.retrieveContext(fakeId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should update existing context', async () => {
      await memory.storeContext(conversationId, testContext);

      const updatedContext = {
        ...testContext,
        topic: 'email',
        unreadEmails: 5
      };

      await memory.storeContext(conversationId, updatedContext);

      const result = await memory.retrieveContext(conversationId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.topic).toBe('email');
        expect(result.data.unreadEmails).toBe(5);
      }
    });

    it('should store within 50ms', async () => {
      const start = Date.now();
      await memory.storeContext(conversationId, testContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should retrieve within 100ms', async () => {
      await memory.storeContext(conversationId, testContext);

      const start = Date.now();
      await memory.retrieveContext(conversationId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // storeSession / retrieveSession
  // ============================================================================

  describe('storeSession / retrieveSession', () => {
    it('should store and retrieve session', async () => {
      const session: ISessionMemory = {
        sessionId,
        startTime: Date.now() as Timestamp,
        messages: [],
        context: testContext,
        activeTopics: ['email']
      };

      const storeResult = await memory.storeSession(sessionId, session);
      expect(storeResult.success).toBe(true);

      const retrieveResult = await memory.retrieveSession(sessionId);
      expect(retrieveResult.success).toBe(true);
      if (retrieveResult.success) {
        expect(retrieveResult.data.sessionId).toBe(sessionId);
        expect(retrieveResult.data.activeTopics).toEqual(['email']);
      }
    });

    it('should return error for non-existent session', async () => {
      const fakeId = UUID(crypto.randomUUID()) as SessionId;
      const result = await memory.retrieveSession(fakeId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should store within 50ms', async () => {
      const session: ISessionMemory = {
        sessionId,
        startTime: Date.now() as Timestamp,
        messages: [],
        context: testContext,
        activeTopics: []
      };

      const start = Date.now();
      await memory.storeSession(sessionId, session);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should retrieve within 100ms', async () => {
      const session: ISessionMemory = {
        sessionId,
        startTime: Date.now() as Timestamp,
        messages: [],
        context: testContext,
        activeTopics: []
      };

      await memory.storeSession(sessionId, session);

      const start = Date.now();
      await memory.retrieveSession(sessionId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // getRelationshipMap / updateRelationshipMap
  // ============================================================================

  describe('getRelationshipMap / updateRelationshipMap', () => {
    it('should return empty map for new user', async () => {
      const result = await memory.getRelationshipMap(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.people).toEqual({});
        expect(result.data.connections).toEqual([]);
      }
    });

    it('should update relationship map', async () => {
      const updates = {
        people: {
          'john@example.com': {
            email: 'john@example.com' as any,
            name: 'John Doe'
          }
        },
        connections: [
          {
            from: userId,
            to: 'john-id' as UserId,
            relationship: 'colleague',
            strength: 0.8
          }
        ]
      };

      const updateResult = await memory.updateRelationshipMap(userId, updates);
      expect(updateResult.success).toBe(true);

      const getResult = await memory.getRelationshipMap(userId);
      expect(getResult.success).toBe(true);
      if (getResult.success) {
        expect(Object.keys(getResult.data.people).length).toBe(1);
        expect(getResult.data.connections.length).toBe(1);
      }
    });

    it('should merge with existing relationships', async () => {
      await memory.updateRelationshipMap(userId, {
        people: {
          'john@example.com': {
            email: 'john@example.com' as any,
            name: 'John'
          }
        }
      });

      await memory.updateRelationshipMap(userId, {
        people: {
          'jane@example.com': {
            email: 'jane@example.com' as any,
            name: 'Jane'
          }
        }
      });

      const result = await memory.getRelationshipMap(userId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data.people).length).toBe(2);
      }
    });

    it('should complete within 100ms', async () => {
      const start = Date.now();
      await memory.updateRelationshipMap(userId, {});
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // searchMemory
  // ============================================================================

  describe('searchMemory', () => {
    it('should return empty for no memories', async () => {
      const result = await memory.searchMemory(userId, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should search memories by pattern', async () => {
      const pattern: ILearnedPattern = {
        pattern: 'send_email_pattern',
        confidence: 0.9,
        examples: [
          {
            description: 'Sends emails every morning',
            timestamp: Date.now() as Timestamp,
            context: '{}'
          }
        ],
        firstSeen: Date.now() as Timestamp,
        lastUsed: Date.now() as Timestamp,
        usageCount: 5
      };

      await memory.addMemory(userId, pattern);

      const result = await memory.searchMemory(userId, 'email');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].pattern).toContain('email');
      }
    });

    it('should search memories by description', async () => {
      const pattern: ILearnedPattern = {
        pattern: 'morning_routine',
        confidence: 0.8,
        examples: [
          {
            description: 'Checks calendar every morning',
            timestamp: Date.now() as Timestamp,
            context: '{}'
          }
        ],
        firstSeen: Date.now() as Timestamp,
        lastUsed: Date.now() as Timestamp,
        usageCount: 3
      };

      await memory.addMemory(userId, pattern);

      const result = await memory.searchMemory(userId, 'calendar');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
      }
    });

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await memory.addMemory(userId, {
          pattern: `pattern_${i}`,
          confidence: 0.7,
          examples: [],
          firstSeen: Date.now() as Timestamp,
          lastUsed: Date.now() as Timestamp,
          usageCount: 1
        });
      }

      const result = await memory.searchMemory(userId, 'pattern', 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(5);
      }
    });

    it('should return all when query is empty', async () => {
      await memory.addMemory(userId, {
        pattern: 'test_pattern',
        confidence: 0.8,
        examples: [],
        firstSeen: Date.now() as Timestamp,
        lastUsed: Date.now() as Timestamp,
        usageCount: 1
      });

      const result = await memory.searchMemory(userId, '');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
      }
    });

    it('should complete within 200ms', async () => {
      const start = Date.now();
      await memory.searchMemory(userId, 'test');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  // ============================================================================
  // mergeContexts
  // ============================================================================

  describe('mergeContexts', () => {
    it('should merge multiple contexts', async () => {
      const context1: IConversationContext = {
        ...testContext,
        topic: 'email',
        mentionedPeople: [{ email: 'john@example.com' as any, name: 'John' }],
        unreadEmails: 3
      };

      const context2: IConversationContext = {
        ...testContext,
        mentionedPeople: [{ email: 'jane@example.com' as any, name: 'Jane' }],
        mentionedProjects: ['Project A'],
        unreadEmails: 2
      };

      const conv1 = UUID(crypto.randomUUID());
      const conv2 = UUID(crypto.randomUUID());

      await memory.storeContext(conv1, context1);
      await memory.storeContext(conv2, context2);

      const result = await memory.mergeContexts([conv1, conv2]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mentionedPeople.length).toBe(2);
        expect(result.data.mentionedProjects).toContain('Project A');
        expect(result.data.unreadEmails).toBe(5); // Sum of both
        expect(result.data.topic).toBe('email'); // From first context
      }
    });

    it('should deduplicate people by email', async () => {
      const context1: IConversationContext = {
        ...testContext,
        mentionedPeople: [{ email: 'john@example.com' as any, name: 'John Doe' }]
      };

      const context2: IConversationContext = {
        ...testContext,
        mentionedPeople: [{ email: 'john@example.com' as any, name: 'John' }]
      };

      const conv1 = UUID(crypto.randomUUID());
      const conv2 = UUID(crypto.randomUUID());

      await memory.storeContext(conv1, context1);
      await memory.storeContext(conv2, context2);

      const result = await memory.mergeContexts([conv1, conv2]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mentionedPeople.length).toBe(1);
      }
    });

    it('should return error for no conversations', async () => {
      const result = await memory.mergeContexts([]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('No conversations');
      }
    });

    it('should handle missing contexts gracefully', async () => {
      const context1: IConversationContext = {
        ...testContext,
        mentionedProjects: ['Project A']
      };

      const conv1 = UUID(crypto.randomUUID());
      const conv2 = UUID(crypto.randomUUID()); // Not stored

      await memory.storeContext(conv1, context1);

      const result = await memory.mergeContexts([conv1, conv2]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mentionedProjects).toContain('Project A');
      }
    });

    it('should complete within 200ms', async () => {
      const conv1 = UUID(crypto.randomUUID());
      await memory.storeContext(conv1, testContext);

      const start = Date.now();
      await memory.mergeContexts([conv1]);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  // ============================================================================
  // clearOldContext
  // ============================================================================

  describe('clearOldContext', () => {
    it('should clear old contexts', async () => {
      await memory.storeContext(conversationId, testContext);

      const threshold = Date.now() + 1000; // Clear everything older than 1 second from now
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

      const result = await memory.clearOldContext(threshold);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1);
      }

      const retrieveResult = await memory.retrieveContext(conversationId);
      expect(retrieveResult.success).toBe(false);
    });

    it('should not clear recent contexts', async () => {
      await memory.storeContext(conversationId, testContext);

      const threshold = Date.now() - 1000; // 1 second ago

      const result = await memory.clearOldContext(threshold);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }

      const retrieveResult = await memory.retrieveContext(conversationId);
      expect(retrieveResult.success).toBe(true);
    });

    it('should return count of cleared items', async () => {
      await memory.storeContext(UUID(crypto.randomUUID()), testContext);
      await memory.storeContext(UUID(crypto.randomUUID()), testContext);

      const session: ISessionMemory = {
        sessionId,
        startTime: Date.now() as Timestamp,
        messages: [],
        context: testContext,
        activeTopics: []
      };
      await memory.storeSession(sessionId, session);

      const threshold = Date.now() + 1000;
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await memory.clearOldContext(threshold);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(3); // 2 contexts + 1 session
      }
    });

    it('should complete within 500ms', async () => {
      const threshold = Date.now();

      const start = Date.now();
      await memory.clearOldContext(threshold);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
