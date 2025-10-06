/**
 * Personalization Engine Contract (Module 00)
 * Learns user preferences and adapts behavior
 *
 * Performance Requirements:
 * - Observe interaction: <50ms
 * - Personalize response: <100ms
 * - Get suggestions: <200ms
 */
import { Result, IInteraction, IUserPreferences, ILearnedPattern, ISuggestion, UserId, IConversationContext } from '@tide/types';
export interface IPersonalizationEngine {
    /**
     * Learn from an interaction
     * @param interaction User interaction to learn from
     * @returns Success result
     * @performance <50ms (async, non-blocking)
     */
    observeInteraction(interaction: IInteraction): Promise<Result<void>>;
    /**
     * Get user preferences
     * @param userId User ID
     * @returns User preferences
     * @performance <50ms
     */
    getUserPreferences(userId: UserId): Promise<Result<IUserPreferences>>;
    /**
     * Update user preferences
     * @param userId User ID
     * @param preferences Updated preferences
     * @returns Success result
     * @performance <100ms
     */
    updatePreferences(userId: UserId, preferences: Partial<IUserPreferences>): Promise<Result<void>>;
    /**
     * Get learned patterns for user
     * @param userId User ID
     * @param minConfidence Minimum confidence threshold
     * @returns Learned patterns
     * @performance <100ms
     */
    getLearnedPatterns(userId: UserId, minConfidence?: number): Promise<Result<ILearnedPattern[]>>;
    /**
     * Personalize a response based on user preferences
     * @param baseResponse Base response text
     * @param userId User ID
     * @returns Personalized response
     * @performance <100ms
     */
    personalizeResponse(baseResponse: string, userId: UserId): Promise<Result<string>>;
    /**
     * Get proactive suggestions based on patterns
     * @param userId User ID
     * @param context Current context
     * @returns Suggested actions
     * @performance <200ms
     */
    getProactiveSuggestions(userId: UserId, context: IConversationContext): Promise<Result<ISuggestion[]>>;
    /**
     * Check if action matches learned pattern
     * @param userId User ID
     * @param actionType Type of action
     * @param params Action parameters
     * @returns Pattern match confidence (0-1)
     * @performance <50ms
     */
    matchesPattern(userId: UserId, actionType: string, params: Record<string, unknown>): Promise<Result<number>>;
}
//# sourceMappingURL=IPersonalizationEngine.d.ts.map