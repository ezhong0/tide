import type { Email, TriageResult } from '../types/index.js';
/**
 * Email triage engine that analyzes emails and determines handling strategy
 */
export declare class EmailTriageEngine {
    /**
     * Analyze email and generate triage result
     */
    analyze(email: Email): Promise<TriageResult>;
    /**
     * Analyze email importance (0-1 score)
     */
    private analyzeImportance;
    /**
     * Analyze email urgency
     */
    private analyzeUrgency;
    /**
     * Categorize email
     */
    private categorizeEmail;
    /**
     * Analyze email sentiment
     */
    private analyzeSentiment;
    /**
     * Detect action required
     */
    private detectActionRequired;
    /**
     * Analyze relationship context
     */
    private analyzeRelationships;
    /**
     * Determine handling strategy
     */
    private determineStrategy;
    /**
     * Calculate confidence in triage decision
     */
    private calculateConfidence;
    /**
     * Check if email body contains deadline
     */
    private hasDeadline;
    /**
     * Extract deadline date from text
     */
    private extractDeadline;
}
//# sourceMappingURL=triage-engine.d.ts.map