import { Pool } from 'pg';
import { UserId } from '@tide/types';
import { DetectedPattern, PatternId, UserBehavior, AutomationSuggestion, PatternStatus } from '../types/pattern.types.js';
/**
 * Pattern Repository
 *
 * Handles persistence of user behaviors, detected patterns, and automation suggestions
 */
export declare class PatternRepository {
    private pool;
    constructor(pool: Pool);
    /**
     * Record user behavior
     */
    recordBehavior(behavior: UserBehavior): Promise<void>;
    /**
     * Get user behaviors within time range
     */
    getBehaviors(userId: UserId, days?: number): Promise<UserBehavior[]>;
    /**
     * Save detected pattern
     */
    savePattern(pattern: DetectedPattern): Promise<void>;
    /**
     * Get patterns for user
     */
    getPatternsByUser(userId: UserId, status?: PatternStatus): Promise<DetectedPattern[]>;
    /**
     * Update pattern status
     */
    updatePatternStatus(patternId: PatternId, status: PatternStatus): Promise<void>;
    /**
     * Save automation suggestion
     */
    saveSuggestion(suggestion: AutomationSuggestion): Promise<void>;
    /**
     * Get suggestions for user
     */
    getSuggestionsByUser(userId: UserId, status?: string): Promise<AutomationSuggestion[]>;
    /**
     * Record pattern sequence
     */
    recordSequence(userId: UserId, actions: string[], signature: string): Promise<void>;
    /**
     * Get frequent sequences
     */
    getFrequentSequences(userId: UserId, minCount?: number): Promise<any[]>;
    /**
     * Map database row to UserBehavior
     */
    private mapRowToBehavior;
    /**
     * Map database row to DetectedPattern
     */
    private mapRowToPattern;
    /**
     * Map database row to AutomationSuggestion
     */
    private mapRowToSuggestion;
    /**
     * Determine time of day from hour
     */
    private getTimeOfDay;
    /**
     * Generate UUID
     */
    private generateId;
}
//# sourceMappingURL=pattern-repository.d.ts.map