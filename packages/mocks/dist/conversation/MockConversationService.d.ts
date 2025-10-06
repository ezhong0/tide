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
import { Result, IConversation, IResponse, IConversationContext, ConversationId, MessageId, UserId, InputMethod } from '@tide/types';
/**
 * Mock implementation of conversation service
 * Uses simple pattern matching for realistic responses
 */
export declare class MockConversationService implements IConversationService {
    private conversations;
    private messages;
    /**
     * Create a new conversation
     * @performance <100ms
     */
    createConversation(userId: UserId): Promise<Result<IConversation>>;
    /**
     * Get an existing conversation
     * @performance <100ms
     */
    getConversation(conversationId: ConversationId): Promise<Result<IConversation>>;
    /**
     * Send a message and get AI response
     * @performance <800ms for first response
     */
    sendMessage(conversationId: ConversationId, message: string, inputMethod: InputMethod): Promise<Result<IResponse>>;
    /**
     * Stream a response (mock implementation returns immediately)
     * @performance <300ms to start streaming
     */
    streamResponse(conversationId: ConversationId, message: string, onChunk: (chunk: string) => void): Promise<Result<IResponse>>;
    /**
     * Get conversation context
     * @performance <100ms
     */
    getContext(conversationId: ConversationId): Promise<Result<IConversationContext>>;
    /**
     * Update conversation context
     * @performance <100ms
     */
    updateContext(conversationId: ConversationId, context: Partial<IConversationContext>): Promise<Result<IConversation>>;
    /**
     * List user's conversations
     * @performance <200ms
     */
    listConversations(userId: UserId, limit?: number, offset?: number): Promise<Result<IConversation[]>>;
    /**
     * Archive a conversation
     * @performance <100ms
     */
    archiveConversation(conversationId: ConversationId): Promise<Result<void>>;
    /**
     * Provide feedback on a message
     * @performance <50ms
     */
    provideFeedback(messageId: MessageId, feedback: 'helpful' | 'not_helpful'): Promise<Result<void>>;
    private createEmptyContext;
    private sanitizeConversation;
    private updateContextFromMessage;
    private generateResponse;
    private generateEmailResponse;
    private generateMeetingResponse;
    private generateCalendarResponse;
    private generateGreetingResponse;
}
//# sourceMappingURL=MockConversationService.d.ts.map