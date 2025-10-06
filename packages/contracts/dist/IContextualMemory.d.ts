/**
 * Contextual Memory Service Contract (Module 00)
 * Maintains conversation state and long-term memory
 *
 * Performance Requirements:
 * - Store context: <50ms
 * - Retrieve context: <100ms
 * - Search memory: <200ms
 */
import { Result, IConversationContext, ISessionMemory, IRelationshipMap, ILearnedPattern, ConversationId, SessionId, UserId } from '@tide/types';
export interface IContextualMemory {
    /**
     * Store conversation context
     * @param conversationId Conversation ID
     * @param context Context to store
     * @returns Success result
     * @performance <50ms
     */
    storeContext(conversationId: ConversationId, context: IConversationContext): Promise<Result<void>>;
    /**
     * Retrieve conversation context
     * @param conversationId Conversation ID
     * @returns Stored context
     * @performance <100ms
     */
    retrieveContext(conversationId: ConversationId): Promise<Result<IConversationContext>>;
    /**
     * Store session memory
     * @param sessionId Session ID
     * @param memory Session memory to store
     * @returns Success result
     * @performance <50ms
     */
    storeSession(sessionId: SessionId, memory: ISessionMemory): Promise<Result<void>>;
    /**
     * Retrieve session memory
     * @param sessionId Session ID
     * @returns Session memory
     * @performance <100ms
     */
    retrieveSession(sessionId: SessionId): Promise<Result<ISessionMemory>>;
    /**
     * Get relationship map for user
     * @param userId User ID
     * @returns Relationship map
     * @performance <100ms
     */
    getRelationshipMap(userId: UserId): Promise<Result<IRelationshipMap>>;
    /**
     * Update relationship map
     * @param userId User ID
     * @param updates Updates to apply
     * @returns Updated relationship map
     * @performance <100ms
     */
    updateRelationshipMap(userId: UserId, updates: Partial<IRelationshipMap>): Promise<Result<IRelationshipMap>>;
    /**
     * Search long-term memory
     * @param userId User ID
     * @param query Search query
     * @param limit Maximum results
     * @returns Relevant memories
     * @performance <200ms
     */
    searchMemory(userId: UserId, query: string, limit?: number): Promise<Result<ILearnedPattern[]>>;
    /**
     * Merge contexts from multiple conversations
     * @param conversationIds List of conversation IDs
     * @returns Merged context
     * @performance <200ms
     */
    mergeContexts(conversationIds: ConversationId[]): Promise<Result<IConversationContext>>;
    /**
     * Clear old context data
     * @param olderThan Timestamp threshold
     * @returns Number of items cleared
     * @performance <500ms
     */
    clearOldContext(olderThan: number): Promise<Result<number>>;
}
//# sourceMappingURL=IContextualMemory.d.ts.map