/**
 * Conversation Service Contract (Module 00)
 * Core conversational AI interface for text-first interaction
 *
 * Performance Requirements:
 * - First response: <800ms
 * - Streaming start: <300ms
 * - Full response with preview: <2000ms
 * - Context load: <100ms
 */

import {
  Result,
  IConversation,
  IResponse,
  IConversationContext,
  ConversationId,
  MessageId,
  UserId,
  InputMethod
} from '@tide/types';

export interface IConversationService {
  /**
   * Create a new conversation
   * @param userId User initiating the conversation
   * @returns New conversation instance
   * @performance <100ms
   */
  createConversation(userId: UserId): Promise<Result<IConversation>>;

  /**
   * Get an existing conversation
   * @param conversationId ID of the conversation to retrieve
   * @returns Conversation with full context
   * @performance <100ms
   */
  getConversation(conversationId: ConversationId): Promise<Result<IConversation>>;

  /**
   * Send a message in a conversation
   * @param conversationId ID of the conversation
   * @param message Message content
   * @param inputMethod How the message was created
   * @returns AI response with actions/suggestions
   * @performance <800ms for first response, <2000ms for full response
   */
  sendMessage(
    conversationId: ConversationId,
    message: string,
    inputMethod: InputMethod
  ): Promise<Result<IResponse>>;

  /**
   * Stream a response (for real-time feedback)
   * @param conversationId ID of the conversation
   * @param message Message content
   * @param onChunk Callback for each response chunk
   * @returns Complete response when done
   * @performance <300ms to start streaming
   */
  streamResponse(
    conversationId: ConversationId,
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<Result<IResponse>>;

  /**
   * Get conversation context
   * @param conversationId ID of the conversation
   * @returns Current conversation context
   * @performance <100ms
   */
  getContext(conversationId: ConversationId): Promise<Result<IConversationContext>>;

  /**
   * Update conversation context
   * @param conversationId ID of the conversation
   * @param context Updated context
   * @returns Updated conversation
   * @performance <100ms
   */
  updateContext(
    conversationId: ConversationId,
    context: Partial<IConversationContext>
  ): Promise<Result<IConversation>>;

  /**
   * List user's conversations
   * @param userId User ID
   * @param limit Maximum number of conversations to return
   * @param offset Pagination offset
   * @returns List of conversations
   * @performance <200ms
   */
  listConversations(
    userId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Result<IConversation[]>>;

  /**
   * Archive a conversation
   * @param conversationId ID to archive
   * @returns Success result
   * @performance <100ms
   */
  archiveConversation(conversationId: ConversationId): Promise<Result<void>>;

  /**
   * Provide feedback on a message
   * @param messageId ID of the message
   * @param feedback Feedback type
   * @returns Success result
   * @performance <50ms
   */
  provideFeedback(
    messageId: MessageId,
    feedback: 'helpful' | 'not_helpful'
  ): Promise<Result<void>>;
}
