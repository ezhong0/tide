/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect } from '@jest/globals';

import {
  MessageSchema,
  ConversationSchema,
  ConversationContextSchema,
  ActionSchema,
  ActionPreviewSchema,
  IntentSchema,
  EntitySchema,
  SuggestionSchema,
  SendMessageRequestSchema,
  CreateConversationRequestSchema,
  ProcessIntentRequestSchema,
  MessageResponseSchema,
  UnderstandingSchema
} from './conversation.schemas';

describe('Conversation Schemas', () => {
  // ============================================================================
  // Core Schemas
  // ============================================================================

  describe('MessageSchema', () => {
    it('should validate correct message', () => {
      const validMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
        content: 'Hello, can you help me with my calendar?',
        timestamp: Date.now(),
        inputMethod: 'typed'
      };

      const result = MessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
        content: '',
        timestamp: Date.now(),
        inputMethod: 'typed'
      };

      const result = MessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it('should reject content over 10000 chars', () => {
      const invalidMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
        content: 'a'.repeat(10001),
        timestamp: Date.now(),
        inputMethod: 'typed'
      };

      const result = MessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it('should accept valid roles', () => {
      const roles = ['user', 'assistant', 'system'];
      roles.forEach(role => {
        const message = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          role,
          content: 'Test',
          timestamp: Date.now(),
          inputMethod: 'typed'
        };

        const result = MessageSchema.safeParse(message);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid input methods', () => {
      const methods = ['typed', 'voice_to_text', 'button', 'suggestion'];
      methods.forEach(inputMethod => {
        const message = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
          inputMethod
        };

        const result = MessageSchema.safeParse(message);
        expect(result.success).toBe(true);
      });
    });

    it('should accept optional fields', () => {
      const message = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'assistant',
        content: 'I can help with that',
        timestamp: Date.now(),
        inputMethod: 'typed',
        feedback: 'helpful',
        edited: true,
        actions: [],
        suggestions: []
      };

      const result = MessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });
  });

  describe('ConversationContextSchema', () => {
    it('should validate empty context', () => {
      const context = {
        mentionedPeople: [],
        mentionedDates: [],
        mentionedProjects: [],
        upcomingMeetings: [],
        unreadEmails: 0
      };

      const result = ConversationContextSchema.safeParse(context);
      expect(result.success).toBe(true);
    });

    it('should validate context with data', () => {
      const context = {
        topic: 'calendar',
        mentionedPeople: [{
          email: 'john@example.com',
          name: 'John Doe'
        }],
        mentionedDates: [{
          timestamp: Date.now(),
          description: 'tomorrow',
          relative: 'tomorrow'
        }],
        mentionedProjects: ['Q4 Planning'],
        upcomingMeetings: [{
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Team Standup',
          startTime: Date.now(),
          endTime: Date.now() + 3600000,
          attendees: [{
            email: 'team@example.com',
            name: 'Team'
          }]
        }],
        unreadEmails: 5,
        currentLocation: 'office'
      };

      const result = ConversationContextSchema.safeParse(context);
      expect(result.success).toBe(true);
    });

    it('should reject negative unread emails', () => {
      const context = {
        mentionedPeople: [],
        mentionedDates: [],
        mentionedProjects: [],
        upcomingMeetings: [],
        unreadEmails: -1
      };

      const result = ConversationContextSchema.safeParse(context);
      expect(result.success).toBe(false);
    });
  });

  describe('ConversationSchema', () => {
    it('should validate complete conversation', () => {
      const conversation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '456e4567-e89b-12d3-a456-426614174000',
        messages: [{
          id: '789e4567-e89b-12d3-a456-426614174000',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
          inputMethod: 'typed'
        }],
        context: {
          mentionedPeople: [],
          mentionedDates: [],
          mentionedProjects: [],
          upcomingMeetings: [],
          unreadEmails: 0
        },
        status: 'active',
        startedAt: Date.now(),
        lastActiveAt: Date.now()
      };

      const result = ConversationSchema.safeParse(conversation);
      expect(result.success).toBe(true);
    });

    it('should validate status values', () => {
      const statuses = ['active', 'idle', 'completed'];
      statuses.forEach(status => {
        const conversation = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '456e4567-e89b-12d3-a456-426614174000',
          messages: [],
          context: {
            mentionedPeople: [],
            mentionedDates: [],
            mentionedProjects: [],
            upcomingMeetings: [],
            unreadEmails: 0
          },
          status,
          startedAt: Date.now(),
          lastActiveAt: Date.now()
        };

        const result = ConversationSchema.safeParse(conversation);
        expect(result.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // Action Schemas
  // ============================================================================

  describe('ActionSchema', () => {
    it('should validate action', () => {
      const action = {
        type: 'send_email',
        description: 'Send email to John',
        params: {
          to: ['john@example.com'],
          subject: 'Hello',
          body: 'Test'
        },
        requiresConfirmation: true,
        riskLevel: 'low'
      };

      const result = ActionSchema.safeParse(action);
      expect(result.success).toBe(true);
    });

    it('should accept valid action types', () => {
      const types = [
        'send_email', 'schedule_meeting', 'reschedule_meeting',
        'cancel_meeting', 'draft_email', 'search_emails',
        'summarize_thread', 'create_task', 'set_reminder',
        'reply_email', 'forward_email'
      ];

      types.forEach(type => {
        const action = {
          type,
          description: 'Test action',
          params: {},
          requiresConfirmation: false
        };

        const result = ActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('ActionPreviewSchema', () => {
    it('should validate action preview', () => {
      const preview = {
        summary: 'Send email to John about meeting',
        details: {
          action: 'send_email',
          changes: {
            to: ['john@example.com'],
            subject: 'Meeting'
          }
        },
        editable: true,
        editableFields: ['subject', 'body']
      };

      const result = ActionPreviewSchema.safeParse(preview);
      expect(result.success).toBe(true);
    });

    it('should accept risks and alternatives', () => {
      const preview = {
        summary: 'Schedule meeting',
        details: {
          action: 'schedule_meeting',
          changes: { time: '2pm' }
        },
        risks: [{
          level: 'medium',
          description: 'Conflicts with another meeting'
        }],
        alternatives: [{
          description: 'Schedule for 3pm instead',
          action: 'schedule_meeting'
        }],
        editable: true
      };

      const result = ActionPreviewSchema.safeParse(preview);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Intent & Understanding Schemas
  // ============================================================================

  describe('IntentSchema', () => {
    it('should validate intent', () => {
      const intent = {
        type: 'schedule_meeting',
        confidence: 0.95
      };

      const result = IntentSchema.safeParse(intent);
      expect(result.success).toBe(true);
    });

    it('should reject confidence outside 0-1 range', () => {
      const invalidIntent = {
        type: 'schedule_meeting',
        confidence: 1.5
      };

      const result = IntentSchema.safeParse(invalidIntent);
      expect(result.success).toBe(false);
    });
  });

  describe('EntitySchema', () => {
    it('should validate entity', () => {
      const entity = {
        type: 'email',
        value: 'john@example.com',
        position: [5, 20],
        confidence: 0.98
      };

      const result = EntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });

  describe('UnderstandingSchema', () => {
    it('should validate understanding result', () => {
      const understanding = {
        intents: [{
          type: 'schedule_meeting',
          confidence: 0.9
        }],
        entities: [{
          type: 'person',
          value: 'John',
          position: [0, 4],
          confidence: 0.95
        }],
        confidence: 0.92
      };

      const result = UnderstandingSchema.safeParse(understanding);
      expect(result.success).toBe(true);
    });

    it('should require at least one intent', () => {
      const invalid = {
        intents: [],
        entities: [],
        confidence: 0.5
      };

      const result = UnderstandingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // Request Schemas
  // ============================================================================

  describe('CreateConversationRequestSchema', () => {
    it('should validate create request', () => {
      const request = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = CreateConversationRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const request = {
        userId: 'not-a-uuid'
      };

      const result = CreateConversationRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('SendMessageRequestSchema', () => {
    it('should validate send message request', () => {
      const request = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'What is on my calendar today?',
        inputMethod: 'typed'
      };

      const result = SendMessageRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const request = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        message: '',
        inputMethod: 'typed'
      };

      const result = SendMessageRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be empty');
      }
    });

    it('should reject message over 10000 chars', () => {
      const request = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'a'.repeat(10001),
        inputMethod: 'typed'
      };

      const result = SendMessageRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too long');
      }
    });
  });

  describe('ProcessIntentRequestSchema', () => {
    it('should validate intent processing request', () => {
      const request = {
        message: 'Schedule a meeting with John tomorrow at 2pm',
        context: {
          mentionedPeople: [],
          mentionedDates: [],
          mentionedProjects: [],
          upcomingMeetings: [],
          unreadEmails: 0
        }
      };

      const result = ProcessIntentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Response Schemas
  // ============================================================================

  describe('MessageResponseSchema', () => {
    it('should validate message response', () => {
      const response = {
        messageId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'I can help you with that',
        role: 'assistant'
      };

      const result = MessageResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should accept optional fields', () => {
      const response = {
        messageId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'I can help you with that',
        role: 'assistant',
        actions: [{
          type: 'send_email',
          description: 'Send test email',
          params: {},
          requiresConfirmation: true
        }],
        suggestions: [{
          id: '1',
          text: 'Check my calendar',
          type: 'action'
        }],
        streamingComplete: true
      };

      const result = MessageResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Suggestion Schema
  // ============================================================================

  describe('SuggestionSchema', () => {
    it('should validate suggestion', () => {
      const suggestion = {
        id: 'suggest-1',
        text: 'Check my calendar',
        type: 'action'
      };

      const result = SuggestionSchema.safeParse(suggestion);
      expect(result.success).toBe(true);
    });

    it('should accept valid suggestion types', () => {
      const types = ['quick_reply', 'action', 'question', 'completion'];
      types.forEach(type => {
        const suggestion = {
          id: '1',
          text: 'Test',
          type
        };

        const result = SuggestionSchema.safeParse(suggestion);
        expect(result.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // Type Inference
  // ============================================================================

  describe('Type Inference', () => {
    it('should infer types correctly', () => {
      const request: import('./conversation.schemas').SendMessageRequest = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test',
        inputMethod: 'typed'
      };

      const result = SendMessageRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });
});
