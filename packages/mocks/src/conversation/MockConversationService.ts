/**
 * Mock Conversation Service (Module 00 - Day 2)
 * In-memory implementation of IConversationService for testing and development
 *
 * Features:
 * - Pattern-based response generation
 * - Context tracking
 * - Action suggestions
 * - Personalization learning
 * - Performance within SLAs
 */

import { IConversationService } from '@tide/contracts';
import {
  Result,
  ok,
  err,
  IConversation,
  IResponse,
  IConversationContext,
  IMessage,
  IAction,
  ISuggestion,
  ConversationId,
  MessageId,
  UserId,
  InputMethod,
  UUID,
  Timestamp
} from '@tide/types';
import crypto from 'crypto';

interface StoredConversation extends IConversation {
  archived: boolean;
}

/**
 * Mock implementation of conversation service
 * Uses simple pattern matching for realistic responses
 */
export class MockConversationService implements IConversationService {
  private conversations: Map<ConversationId, StoredConversation> = new Map();
  private messages: Map<MessageId, IMessage> = new Map();

  /**
   * Create a new conversation
   * @performance <100ms
   */
  async createConversation(userId: UserId): Promise<Result<IConversation>> {
    const conversationId = UUID(crypto.randomUUID());
    const now = Date.now() as Timestamp;

    const conversation: StoredConversation = {
      id: conversationId,
      userId,
      messages: [],
      context: this.createEmptyContext(),
      status: 'active',
      startedAt: now,
      lastActiveAt: now,
      archived: false
    };

    this.conversations.set(conversationId, conversation);

    return ok(this.sanitizeConversation(conversation));
  }

  /**
   * Get an existing conversation
   * @performance <100ms
   */
  async getConversation(conversationId: ConversationId): Promise<Result<IConversation>> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return err(new Error('Conversation not found'));
    }

    if (conversation.archived) {
      return err(new Error('Conversation has been archived'));
    }

    return ok(this.sanitizeConversation(conversation));
  }

  /**
   * Send a message and get AI response
   * @performance <800ms for first response
   */
  async sendMessage(
    conversationId: ConversationId,
    message: string,
    inputMethod: InputMethod
  ): Promise<Result<IResponse>> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return err(new Error('Conversation not found'));
    }

    if (conversation.archived) {
      return err(new Error('Cannot send message to archived conversation'));
    }

    // Store user message
    const userMessageId = UUID(crypto.randomUUID());
    const timestamp = Date.now() as Timestamp;

    const userMessage: IMessage = {
      id: userMessageId,
      role: 'user',
      content: message,
      timestamp,
      inputMethod
    };

    conversation.messages.push(userMessage);
    this.messages.set(userMessageId, userMessage);

    // Update context based on message
    this.updateContextFromMessage(conversation.context, message);

    // Generate AI response
    const response = await this.generateResponse(message, conversation.context);

    // Store assistant message
    const assistantMessageId = UUID(crypto.randomUUID());
    const assistantMessage: IMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: response.content,
      timestamp: Date.now() as Timestamp,
      inputMethod: 'typed',
      actions: response.actions,
      suggestions: response.suggestions,
      preview: response.preview
    };

    conversation.messages.push(assistantMessage);
    this.messages.set(assistantMessageId, assistantMessage);

    // Update conversation status
    conversation.lastActiveAt = Date.now() as Timestamp;
    conversation.status = 'active';

    return ok({
      messageId: assistantMessageId,
      content: response.content,
      role: 'assistant',
      actions: response.actions,
      suggestions: response.suggestions,
      preview: response.preview,
      streamingComplete: true
    });
  }

  /**
   * Stream a response (mock implementation returns immediately)
   * @performance <300ms to start streaming
   */
  async streamResponse(
    conversationId: ConversationId,
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<Result<IResponse>> {
    // Get the full response first
    const result = await this.sendMessage(conversationId, message, 'typed');

    if (!result.success) {
      return result;
    }

    // Simulate streaming by chunking the response
    const content = result.data.content;
    const chunkSize = 10; // characters per chunk

    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      onChunk(chunk);
      // Small delay to simulate streaming (5ms per chunk)
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    return result;
  }

  /**
   * Get conversation context
   * @performance <100ms
   */
  async getContext(conversationId: ConversationId): Promise<Result<IConversationContext>> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return err(new Error('Conversation not found'));
    }

    return ok(conversation.context);
  }

  /**
   * Update conversation context
   * @performance <100ms
   */
  async updateContext(
    conversationId: ConversationId,
    context: Partial<IConversationContext>
  ): Promise<Result<IConversation>> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return err(new Error('Conversation not found'));
    }

    // Merge context
    conversation.context = {
      ...conversation.context,
      ...context,
      // Handle arrays specially (don't overwrite with undefined)
      mentionedPeople: context.mentionedPeople ?? conversation.context.mentionedPeople,
      mentionedDates: context.mentionedDates ?? conversation.context.mentionedDates,
      mentionedProjects: context.mentionedProjects ?? conversation.context.mentionedProjects,
      upcomingMeetings: context.upcomingMeetings ?? conversation.context.upcomingMeetings
    };

    conversation.lastActiveAt = Date.now() as Timestamp;

    return ok(this.sanitizeConversation(conversation));
  }

  /**
   * List user's conversations
   * @performance <200ms
   */
  async listConversations(
    userId: UserId,
    limit = 10,
    offset = 0
  ): Promise<Result<IConversation[]>> {
    const userConversations = Array.from(this.conversations.values())
      .filter(c => c.userId === userId && !c.archived)
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt)
      .slice(offset, offset + limit)
      .map(c => this.sanitizeConversation(c));

    return ok(userConversations);
  }

  /**
   * Archive a conversation
   * @performance <100ms
   */
  async archiveConversation(conversationId: ConversationId): Promise<Result<void>> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return err(new Error('Conversation not found'));
    }

    conversation.archived = true;
    conversation.status = 'completed';

    return ok(undefined);
  }

  /**
   * Provide feedback on a message
   * @performance <50ms
   */
  async provideFeedback(
    messageId: MessageId,
    feedback: 'helpful' | 'not_helpful'
  ): Promise<Result<void>> {
    const message = this.messages.get(messageId);

    if (!message) {
      return err(new Error('Message not found'));
    }

    message.feedback = feedback;

    return ok(undefined);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private createEmptyContext(): IConversationContext {
    return {
      mentionedPeople: [],
      mentionedDates: [],
      mentionedProjects: [],
      upcomingMeetings: [],
      unreadEmails: 0
    };
  }

  private sanitizeConversation(conversation: StoredConversation): IConversation {
    // Remove internal fields
    const { archived, ...publicConversation } = conversation;
    return publicConversation;
  }

  private updateContextFromMessage(context: IConversationContext, message: string): void {
    const lowerMessage = message.toLowerCase();

    // Detect topic
    if (lowerMessage.includes('email') || lowerMessage.includes('send')) {
      context.topic = 'email';
    } else if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
      context.topic = 'calendar';
    } else if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      context.topic = 'tasks';
    }

    // Detect time references
    if (lowerMessage.includes('tomorrow')) {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      context.mentionedDates.push({
        timestamp: tomorrow as Timestamp,
        description: 'tomorrow',
        relative: 'tomorrow'
      });
    }

    if (lowerMessage.includes('next week')) {
      const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
      context.mentionedDates.push({
        timestamp: nextWeek as Timestamp,
        description: 'next week',
        relative: 'next week'
      });
    }
  }

  private async generateResponse(
    message: string,
    context: IConversationContext
  ): Promise<Omit<IResponse, 'messageId' | 'role'>> {
    const lowerMessage = message.toLowerCase();

    // Pattern matching for different intents
    if (lowerMessage.includes('email') && lowerMessage.includes('send')) {
      return this.generateEmailResponse(message, context);
    }

    if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
      return this.generateMeetingResponse(message, context);
    }

    if (lowerMessage.includes('calendar') || lowerMessage.includes('today')) {
      return this.generateCalendarResponse(context);
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return this.generateGreetingResponse();
    }

    // Default response
    return {
      content: "I understand you want help with that. Could you provide more details?",
      suggestions: [
        {
          id: 'sug-1',
          text: 'Check my calendar',
          type: 'action'
        },
        {
          id: 'sug-2',
          text: 'Send an email',
          type: 'action'
        },
        {
          id: 'sug-3',
          text: 'Schedule a meeting',
          type: 'action'
        }
      ]
    };
  }

  private generateEmailResponse(
    message: string,
    context: IConversationContext
  ): Omit<IResponse, 'messageId' | 'role'> {
    const action: IAction = {
      type: 'send_email',
      description: 'Send email based on your request',
      params: {
        to: ['example@example.com'],
        subject: 'Email subject',
        body: 'Email body'
      },
      requiresConfirmation: true,
      riskLevel: 'medium'
    };

    return {
      content: "I can help you send that email. Let me draft it for you to review.",
      actions: [action],
      suggestions: [
        {
          id: 'sug-1',
          text: 'Review draft',
          type: 'action',
          action
        },
        {
          id: 'sug-2',
          text: 'Change recipient',
          type: 'action'
        }
      ]
    };
  }

  private generateMeetingResponse(
    message: string,
    context: IConversationContext
  ): Omit<IResponse, 'messageId' | 'role'> {
    const action: IAction = {
      type: 'schedule_meeting',
      description: 'Schedule meeting based on your request',
      params: {
        title: 'Team Meeting',
        attendees: ['team@example.com'],
        duration: 30
      },
      requiresConfirmation: true,
      riskLevel: 'low'
    };

    return {
      content: "I'll help you schedule that meeting. Let me find a good time.",
      actions: [action],
      suggestions: [
        {
          id: 'sug-1',
          text: 'Find time this week',
          type: 'action'
        },
        {
          id: 'sug-2',
          text: 'Suggest alternative times',
          type: 'action'
        }
      ]
    };
  }

  private generateCalendarResponse(
    context: IConversationContext
  ): Omit<IResponse, 'messageId' | 'role'> {
    const meetingCount = context.upcomingMeetings.length;

    if (meetingCount === 0) {
      return {
        content: "You have no meetings scheduled for today. Your calendar is clear!",
        suggestions: [
          {
            id: 'sug-1',
            text: 'Schedule a meeting',
            type: 'action'
          },
          {
            id: 'sug-2',
            text: 'Check tomorrow',
            type: 'question'
          }
        ]
      };
    }

    return {
      content: `You have ${meetingCount} meeting${meetingCount > 1 ? 's' : ''} scheduled today.`,
      suggestions: [
        {
          id: 'sug-1',
          text: 'Show details',
          type: 'action'
        },
        {
          id: 'sug-2',
          text: 'Find free time',
          type: 'action'
        }
      ]
    };
  }

  private generateGreetingResponse(): Omit<IResponse, 'messageId' | 'role'> {
    return {
      content: "Hello! I'm your AI assistant. I can help you with emails, calendar, tasks, and more. What would you like to do?",
      suggestions: [
        {
          id: 'sug-1',
          text: 'Check my calendar',
          type: 'quick_reply'
        },
        {
          id: 'sug-2',
          text: 'Read my emails',
          type: 'quick_reply'
        },
        {
          id: 'sug-3',
          text: 'Schedule a meeting',
          type: 'quick_reply'
        }
      ]
    };
  }
}
