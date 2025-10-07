/**
 * Pattern Database
 * Stores and retrieves behavioral patterns
 */
import type { Pattern } from '@tide/contracts';
export declare class PatternDatabase {
    private patterns;
    private patternIndex;
    /**
     * Store a pattern
     */
    store(pattern: Pattern): Promise<void>;
    /**
     * Get patterns for user
     */
    getUserPatterns(userId: string, type?: Pattern['type']): Promise<Pattern[]>;
    /**
     * Find patterns matching criteria
     */
    findPatterns(userId: string, criteria: Partial<Pattern>): Promise<Pattern[]>;
    /**
     * Get most frequent patterns
     */
    getFrequentPatterns(userId: string, limit?: number): Promise<Pattern[]>;
    /**
     * Get recent patterns
     */
    getRecentPatterns(userId: string, since: number): Promise<Pattern[]>;
    /**
     * Update pattern frequency
     */
    incrementFrequency(patternId: string, userId: string): Promise<void>;
    /**
     * Delete pattern
     */
    deletePattern(patternId: string, userId: string): Promise<void>;
    /**
     * Clear old patterns
     */
    clearOldPatterns(userId: string, olderThan: number): Promise<number>;
    /**
     * Get pattern statistics
     */
    getStatistics(userId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        avgConfidence: number;
        avgFrequency: number;
    }>;
}
//# sourceMappingURL=pattern-database.d.ts.map