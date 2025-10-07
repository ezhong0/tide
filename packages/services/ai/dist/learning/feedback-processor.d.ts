/**
 * Feedback Processor
 * Processes user feedback to improve AI performance
 */
export interface UserFeedback {
    userId: string;
    requestId: string;
    feedbackType: 'positive' | 'negative' | 'neutral';
    rating?: number;
    comments?: string;
    specificIssues?: string[];
    timestamp: number;
}
export interface FeedbackInsights {
    averageRating: number;
    positiveCount: number;
    negativeCount: number;
    commonIssues: {
        issue: string;
        count: number;
    }[];
    improvementAreas: string[];
    strengths: string[];
}
export declare class FeedbackProcessor {
    private feedback;
    /**
     * Record user feedback
     */
    recordFeedback(feedback: UserFeedback): Promise<void>;
    /**
     * Process feedback for learning
     */
    private processFeedback;
    /**
     * Get feedback insights for user
     */
    getInsights(userId: string): Promise<FeedbackInsights>;
    /**
     * Get recent feedback
     */
    getRecentFeedback(userId: string, since: number): Promise<UserFeedback[]>;
    /**
     * Get aggregate feedback statistics
     */
    getAggregateStats(userId: string): Promise<{
        totalFeedback: number;
        averageRating: number;
        satisfaction: number;
        trend: 'improving' | 'declining' | 'stable';
    }>;
}
//# sourceMappingURL=feedback-processor.d.ts.map