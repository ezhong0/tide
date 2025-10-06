/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MockConversationService } from './MockConversationService';
import { UserId, UUID } from '@tide/types';
import crypto from 'crypto';

describe('MockConversationService', () => {
  let service: MockConversationService;
  let userId: UserId;

  beforeEach(() => {
    service = new MockConversationService();
    userId = UserId(crypto.randomUUID());
  });

  // ============================================================================
  // createConversation
  // ============================================================================

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const result = await service.createConversation(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(userId);
        expect(result.data.messages).toEqual([]);
        expect(result.data.status).toBe('active');
        expect(result.data.context).toBeDefined();
      }
    });

    it('should create conversation with empty context', async () => {
      const result = await service.createConversation(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        const context = result.data.context;
        expect(context.mentionedPeople).toEqual([]);
        expect(context.mentionedDates).toEqual([]);
        expect(context.mentionedProjects).toEqual([]);
        expect(context.upcomingMeetings).toEqual([]);
        expect(context.unreadEmails).toBe(0);
      }
    });

    it('should create conversation within 100ms', async () => {
      const start = Date.now();
      await service.createConversation(userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should create multiple conversations for same user', async () => {
      const result1 = await service.createConversation(userId);
      const result2 = await service.createConversation(userId);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result1.data.id).not.toBe(result2.data.id);
      }
    });
  });

  // ============================================================================
  // getConversation
  // ============================================================================

  describe('getConversation', () => {
    it('should get existing conversation', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const getResult = await service.getConversation(createResult.data.id);

        expect(getResult.success).toBe(true);
        if (getResult.success) {
          expect(getResult.data.id).toBe(createResult.data.id);
          expect(getResult.data.userId).toBe(userId);
        }
      }
    });

    it('should return error for non-existent conversation', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await service.getConversation(fakeId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should return error for archived conversation', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        await service.archiveConversation(createResult.data.id);
        const getResult = await service.getConversation(createResult.data.id);

        expect(getResult.success).toBe(false);
        if (!getResult.success) {
          expect(getResult.error.message).toContain('archived');
        }
      }
    });

    it('should retrieve conversation within 100ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const start = Date.now();
        await service.getConversation(createResult.data.id);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
      }
    });
  });

  // ============================================================================
  // sendMessage
  // ============================================================================

  describe('sendMessage', () => {
    it('should send message and get response', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.sendMessage(
          createResult.data.id,
          'Hello',
          'typed'
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.content).toBeDefined();
          expect(result.data.role).toBe('assistant');
          expect(result.data.streamingComplete).toBe(true);
        }
      }
    });

    it('should recognize greeting', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.sendMessage(
          createResult.data.id,
          'Hello',
          'typed'
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.content.toLowerCase()).toContain('hello');
          expect(result.data.suggestions).toBeDefined();
          expect(result.data.suggestions!.length).toBeGreaterThan(0);
        }
      }
    });

    it('should recognize email intent', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.sendMessage(
          createResult.data.id,
          'Send an email to John',
          'typed'
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.content.toLowerCase()).toContain('email');
          expect(result.data.actions).toBeDefined();
          expect(result.data.actions!.length).toBeGreaterThan(0);
          expect(result.data.actions![0].type).toBe('send_email');
        }
      }
    });

    it('should recognize meeting intent', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.sendMessage(
          createResult.data.id,
          'Schedule a meeting tomorrow',
          'typed'
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.content.toLowerCase()).toContain('meeting');
          expect(result.data.actions).toBeDefined();
          expect(result.data.actions!.length).toBeGreaterThan(0);
          expect(result.data.actions![0].type).toBe('schedule_meeting');
        }
      }
    });

    it('should recognize calendar check intent', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.sendMessage(
          createResult.data.id,
          'What is on my calendar today?',
          'typed'
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.content.toLowerCase()).toContain('calendar');
        }
      }
    });

    it('should update context with time references', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        await service.sendMessage(
          createResult.data.id,
          'Schedule a meeting tomorrow',
          'typed'
        );

        const contextResult = await service.getContext(createResult.data.id);
        expect(contextResult.success).toBe(true);
        if (contextResult.success) {
          expect(contextResult.data.mentionedDates.length).toBeGreaterThan(0);
          expect(contextResult.data.mentionedDates[0].relative).toBe('tomorrow');
        }
      }
    });

    it('should respond within 800ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const start = Date.now();
        await service.sendMessage(
          createResult.data.id,
          'Hello',
          'typed'
        );
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(800);
      }
    });

    it('should return error for non-existent conversation', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await service.sendMessage(fakeId, 'Hello', 'typed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should return error for archived conversation', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        await service.archiveConversation(createResult.data.id);
        const result = await service.sendMessage(
          createResult.data.id,
          'Hello',
          'typed'
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('archived');
        }
      }
    });

    it('should store messages in conversation', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        await service.sendMessage(createResult.data.id, 'First message', 'typed');
        await service.sendMessage(createResult.data.id, 'Second message', 'typed');

        const getResult = await service.getConversation(createResult.data.id);
        expect(getResult.success).toBe(true);
        if (getResult.success) {
          // Should have 4 messages: 2 user + 2 assistant
          expect(getResult.data.messages.length).toBe(4);
        }
      }
    });
  });

  // ============================================================================
  // streamResponse
  // ============================================================================

  describe('streamResponse', () => {
    it('should stream response in chunks', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const chunks: string[] = [];
        const result = await service.streamResponse(
          createResult.data.id,
          'Hello',
          (chunk) => chunks.push(chunk)
        );

        expect(result.success).toBe(true);
        expect(chunks.length).toBeGreaterThan(0);

        // Verify chunks combine to full response
        const fullContent = chunks.join('');
        if (result.success) {
          expect(fullContent).toBe(result.data.content);
        }
      }
    });

    it('should start streaming within 300ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        let firstChunkTime = 0;
        const start = Date.now();

        await service.streamResponse(
          createResult.data.id,
          'Hello',
          () => {
            if (firstChunkTime === 0) {
              firstChunkTime = Date.now();
            }
          }
        );

        const duration = firstChunkTime - start;
        expect(duration).toBeLessThan(300);
      }
    });
  });

  // ============================================================================
  // getContext
  // ============================================================================

  describe('getContext', () => {
    it('should get conversation context', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.getContext(createResult.data.id);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeDefined();
          expect(result.data.mentionedPeople).toBeDefined();
        }
      }
    });

    it('should return error for non-existent conversation', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await service.getContext(fakeId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should retrieve context within 100ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const start = Date.now();
        await service.getContext(createResult.data.id);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
      }
    });
  });

  // ============================================================================
  // updateContext
  // ============================================================================

  describe('updateContext', () => {
    it('should update conversation context', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.updateContext(createResult.data.id, {
          topic: 'email',
          unreadEmails: 5
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.context.topic).toBe('email');
          expect(result.data.context.unreadEmails).toBe(5);
        }
      }
    });

    it('should merge context without overwriting arrays', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // First update with mentioned people
        await service.updateContext(createResult.data.id, {
          mentionedPeople: [{
            email: 'john@example.com' as any,
            name: 'John'
          }]
        });

        // Second update with topic (should preserve mentionedPeople)
        const result = await service.updateContext(createResult.data.id, {
          topic: 'calendar'
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.context.topic).toBe('calendar');
          expect(result.data.context.mentionedPeople.length).toBe(1);
        }
      }
    });

    it('should update within 100ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const start = Date.now();
        await service.updateContext(createResult.data.id, { topic: 'email' });
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
      }
    });

    it('should return error for non-existent conversation', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await service.updateContext(fakeId, { topic: 'email' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });
  });

  // ============================================================================
  // listConversations
  // ============================================================================

  describe('listConversations', () => {
    it('should list user conversations', async () => {
      await service.createConversation(userId);
      await service.createConversation(userId);

      const result = await service.listConversations(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
        expect(result.data[0].userId).toBe(userId);
      }
    });

    it('should not list archived conversations', async () => {
      const createResult1 = await service.createConversation(userId);
      await service.createConversation(userId);

      if (createResult1.success) {
        await service.archiveConversation(createResult1.data.id);
      }

      const result = await service.listConversations(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
      }
    });

    it('should sort by lastActiveAt descending', async () => {
      const result1 = await service.createConversation(userId);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const result2 = await service.createConversation(userId);

      const listResult = await service.listConversations(userId);

      expect(listResult.success).toBe(true);
      if (listResult.success && result1.success && result2.success) {
        expect(listResult.data[0].id).toBe(result2.data.id);
        expect(listResult.data[1].id).toBe(result1.data.id);
      }
    });

    it('should support pagination with limit', async () => {
      await service.createConversation(userId);
      await service.createConversation(userId);
      await service.createConversation(userId);

      const result = await service.listConversations(userId, 2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
      }
    });

    it('should support pagination with offset', async () => {
      await service.createConversation(userId);
      await service.createConversation(userId);
      await service.createConversation(userId);

      const result = await service.listConversations(userId, 2, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
      }
    });

    it('should list within 200ms', async () => {
      await service.createConversation(userId);
      await service.createConversation(userId);

      const start = Date.now();
      await service.listConversations(userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('should return empty array for user with no conversations', async () => {
      const result = await service.listConversations(userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  // ============================================================================
  // archiveConversation
  // ============================================================================

  describe('archiveConversation', () => {
    it('should archive conversation', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = await service.archiveConversation(createResult.data.id);

        expect(result.success).toBe(true);

        // Verify conversation is archived
        const getResult = await service.getConversation(createResult.data.id);
        expect(getResult.success).toBe(false);
      }
    });

    it('should return error for non-existent conversation', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await service.archiveConversation(fakeId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should archive within 100ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const start = Date.now();
        await service.archiveConversation(createResult.data.id);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
      }
    });
  });

  // ============================================================================
  // provideFeedback
  // ============================================================================

  describe('provideFeedback', () => {
    it('should provide feedback on message', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const messageResult = await service.sendMessage(
          createResult.data.id,
          'Hello',
          'typed'
        );

        expect(messageResult.success).toBe(true);
        if (messageResult.success) {
          const result = await service.provideFeedback(
            messageResult.data.messageId,
            'helpful'
          );

          expect(result.success).toBe(true);
        }
      }
    });

    it('should return error for non-existent message', async () => {
      const fakeId = UUID(crypto.randomUUID());
      const result = await service.provideFeedback(fakeId, 'helpful');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should provide feedback within 50ms', async () => {
      const createResult = await service.createConversation(userId);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const messageResult = await service.sendMessage(
          createResult.data.id,
          'Hello',
          'typed'
        );

        if (messageResult.success) {
          const start = Date.now();
          await service.provideFeedback(messageResult.data.messageId, 'helpful');
          const duration = Date.now() - start;

          expect(duration).toBeLessThan(50);
        }
      }
    });
  });
});
