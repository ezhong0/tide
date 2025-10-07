/**
 * Learning System
 * Continuous improvement engine that learns from user interactions
 */
import type { AIRequest } from '@tide/contracts';
import { PatternDatabase } from './pattern-database';
import { UserPreferenceModel } from './user-preference-model';
import { FeedbackProcessor } from './feedback-processor';
export declare class LearningSystem {
    private patterns;
    private preferences;
    private feedback;
    constructor();
    /**
     * Observe an interaction to extract learnings
     */
    observe(request: AIRequest, response: any): Promise<void>;
    /**
     * Extract patterns from interaction
     */
    private extractPatterns;
    /**
     * Update user model based on patterns
     */
    private updateUserModel;
    /**
     * Learn from specific user data
     */
    learn(userId: string): Promise<any>;
    /**
     * Learn writing style from patterns
     */
    private learnWritingStyle;
    /**
     * Learn scheduling preferences from patterns
     */
    private learnSchedulingPreferences;
    /**
     * Extract preferred meeting times from patterns
     */
    private extractPreferredMeetingTimes;
    /**
     * Check if time is during working hours
     */
    private isWorkingHours;
    /**
     * Get pattern database (for external access)
     */
    getPatternDatabase(): PatternDatabase;
    /**
     * Get preference model (for external access)
     */
    getPreferenceModel(): UserPreferenceModel;
    /**
     * Get feedback processor (for external access)
     */
    getFeedbackProcessor(): FeedbackProcessor;
}
//# sourceMappingURL=learning-system.d.ts.map