/**
 * Pattern Database
 * Stores and retrieves behavioral patterns
 */
import { createLogger } from '@tide/logger';
const logger = createLogger({ component: 'PatternDatabase' });
export class PatternDatabase {
    constructor() {
        this.patterns = new Map();
        this.patternIndex = new Map();
    }
    /**
     * Store a pattern
     */
    async store(pattern) {
        const userPatterns = this.patterns.get(pattern.userId) || [];
        userPatterns.push(pattern);
        this.patterns.set(pattern.userId, userPatterns);
        // Index by type for quick lookup
        const typeKey = `${pattern.userId}:${pattern.type}`;
        const index = this.patternIndex.get(typeKey) || new Set();
        index.add(pattern.id);
        this.patternIndex.set(typeKey, index);
        logger.debug('Pattern stored', {
            userId: pattern.userId,
            patternId: pattern.id,
            type: pattern.type,
        });
    }
    /**
     * Get patterns for user
     */
    async getUserPatterns(userId, type) {
        const userPatterns = this.patterns.get(userId) || [];
        if (type) {
            return userPatterns.filter(p => p.type === type);
        }
        return userPatterns;
    }
    /**
     * Find patterns matching criteria
     */
    async findPatterns(userId, criteria) {
        const userPatterns = await this.getUserPatterns(userId);
        return userPatterns.filter(pattern => {
            if (criteria.type && pattern.type !== criteria.type)
                return false;
            if (criteria.confidence && pattern.confidence < criteria.confidence)
                return false;
            if (criteria.frequency && pattern.frequency < criteria.frequency)
                return false;
            return true;
        });
    }
    /**
     * Get most frequent patterns
     */
    async getFrequentPatterns(userId, limit = 10) {
        const userPatterns = await this.getUserPatterns(userId);
        return userPatterns
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, limit);
    }
    /**
     * Get recent patterns
     */
    async getRecentPatterns(userId, since) {
        const userPatterns = await this.getUserPatterns(userId);
        return userPatterns
            .filter(p => p.lastOccurred >= since)
            .sort((a, b) => b.lastOccurred - a.lastOccurred);
    }
    /**
     * Update pattern frequency
     */
    async incrementFrequency(patternId, userId) {
        const userPatterns = this.patterns.get(userId);
        if (!userPatterns)
            return;
        const pattern = userPatterns.find(p => p.id === patternId);
        if (pattern) {
            pattern.frequency++;
            pattern.lastOccurred = Date.now();
            logger.debug('Pattern frequency incremented', {
                patternId,
                newFrequency: pattern.frequency,
            });
        }
    }
    /**
     * Delete pattern
     */
    async deletePattern(patternId, userId) {
        const userPatterns = this.patterns.get(userId);
        if (!userPatterns)
            return;
        const index = userPatterns.findIndex(p => p.id === patternId);
        if (index !== -1) {
            userPatterns.splice(index, 1);
            logger.debug('Pattern deleted', { patternId });
        }
    }
    /**
     * Clear old patterns
     */
    async clearOldPatterns(userId, olderThan) {
        const userPatterns = this.patterns.get(userId);
        if (!userPatterns)
            return 0;
        const before = userPatterns.length;
        const filtered = userPatterns.filter(p => p.lastOccurred >= olderThan);
        this.patterns.set(userId, filtered);
        const deleted = before - filtered.length;
        logger.info('Cleared old patterns', { userId, deleted });
        return deleted;
    }
    /**
     * Get pattern statistics
     */
    async getStatistics(userId) {
        const userPatterns = await this.getUserPatterns(userId);
        const byType = {};
        userPatterns.forEach(p => {
            byType[p.type] = (byType[p.type] || 0) + 1;
        });
        const avgConfidence = userPatterns.length > 0
            ? userPatterns.reduce((sum, p) => sum + p.confidence, 0) / userPatterns.length
            : 0;
        const avgFrequency = userPatterns.length > 0
            ? userPatterns.reduce((sum, p) => sum + p.frequency, 0) / userPatterns.length
            : 0;
        return {
            total: userPatterns.length,
            byType,
            avgConfidence,
            avgFrequency,
        };
    }
}
//# sourceMappingURL=pattern-database.js.map