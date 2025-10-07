import { UserId } from '@tide/types';
import { DetectedPattern, UserBehavior } from '../types/pattern.types.js';
import { PatternRepository } from '../persistence/pattern-repository.js';
/**
 * Pattern Detector
 *
 * Detects behavioral patterns from user actions
 * Supports temporal, sequential, conditional, and collaborative patterns
 */
export declare class PatternDetector {
    private repository;
    private analyzer;
    constructor(repository: PatternRepository, analyzer: BehaviorAnalyzer);
    /**
     * Detect patterns for a user
     */
    detectPatterns(userId: UserId, days?: number): Promise<DetectedPattern[]>;
    /**
     * Detect temporal patterns (time-based)
     */
    private detectTemporalPatterns;
    /**
     * Detect sequential patterns (action sequences)
     */
    private detectSequentialPatterns;
    /**
     * Group behaviors by time
     */
    private groupByTime;
    /**
     * Find daily patterns (same time every day)
     */
    private findDailyPatterns;
    /**
     * Find weekly patterns (same day/time each week)
     */
    private findWeeklyPatterns;
    /**
     * Find action sequences
     */
    private findSequences;
    /**
     * Get sequence signature (hash)
     */
    private getSequenceSignature;
    /**
     * Describe sequence in natural language
     */
    private describeSequence;
    /**
     * Calculate pattern value (time saved in minutes)
     */
    private calculateValue;
    /**
     * Get day name
     */
    private getDayName;
    /**
     * Generate ID
     */
    private generateId;
}
/**
 * Behavior Analyzer
 *
 * Analyzes user behaviors to extract insights
 */
export declare class BehaviorAnalyzer {
    /**
     * Analyze user behaviors
     */
    analyze(behaviors: UserBehavior[]): Promise<BehaviorAnalysis>;
    /**
     * Find most common action
     */
    private findMostCommon;
    /**
     * Analyze time distribution
     */
    private analyzeTimeDistribution;
    /**
     * Find peak hour
     */
    private findPeakHour;
    /**
     * Calculate action frequency
     */
    private calculateActionFrequency;
}
export interface BehaviorAnalysis {
    totalBehaviors: number;
    uniqueActions: number;
    mostCommonAction: string;
    timeDistribution: TimeDistribution;
    actionFrequency: Map<string, number>;
}
export interface TimeDistribution {
    peakHour: number;
    distribution: Array<{
        hour: number;
        count: number;
    }>;
}
//# sourceMappingURL=pattern-detector.d.ts.map