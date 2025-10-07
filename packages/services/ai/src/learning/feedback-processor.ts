/**
 * Feedback Processor
 * Processes user feedback to improve AI performance
 */

import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'FeedbackProcessor' });

export interface UserFeedback {
  userId: string;
  requestId: string;
  feedbackType: 'positive' | 'negative' | 'neutral';
  rating?: number; // 1-5
  comments?: string;
  specificIssues?: string[];
  timestamp: number;
}

export interface FeedbackInsights {
  averageRating: number;
  positiveCount: number;
  negativeCount: number;
  commonIssues: { issue: string; count: number }[];
  improvementAreas: string[];
  strengths: string[];
}

export class FeedbackProcessor {
  private feedback = new Map<string, UserFeedback[]>();

  /**
   * Record user feedback
   */
  async recordFeedback(feedback: UserFeedback): Promise<void> {
    const userFeedback = this.feedback.get(feedback.userId) || [];
    userFeedback.push(feedback);
    this.feedback.set(feedback.userId, userFeedback);

    logger.info('Feedback recorded', {
      userId: feedback.userId,
      type: feedback.feedbackType,
      rating: feedback.rating,
    });

    // Process feedback immediately for quick learning
    await this.processFeedback(feedback);
  }

  /**
   * Process feedback for learning
   */
  private async processFeedback(feedback: UserFeedback): Promise<void> {
    // Extract insights
    if (feedback.feedbackType === 'negative' && feedback.specificIssues) {
      logger.warn('Negative feedback received', {
        userId: feedback.userId,
        issues: feedback.specificIssues,
      });

      // In production, this would trigger model updates or alerts
    }

    if (feedback.rating && feedback.rating <= 2) {
      logger.warn('Low rating received', {
        userId: feedback.userId,
        rating: feedback.rating,
        requestId: feedback.requestId,
      });
    }
  }

  /**
   * Get feedback insights for user
   */
  async getInsights(userId: string): Promise<FeedbackInsights> {
    const userFeedback = this.feedback.get(userId) || [];

    if (userFeedback.length === 0) {
      return {
        averageRating: 0,
        positiveCount: 0,
        negativeCount: 0,
        commonIssues: [],
        improvementAreas: [],
        strengths: [],
      };
    }

    const positiveCount = userFeedback.filter(f => f.feedbackType === 'positive').length;
    const negativeCount = userFeedback.filter(f => f.feedbackType === 'negative').length;

    const ratingsWithValues = userFeedback.filter(f => f.rating !== undefined);
    const averageRating = ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValues.length
      : 0;

    // Aggregate issues
    const issueCount = new Map<string, number>();
    userFeedback.forEach(f => {
      f.specificIssues?.forEach(issue => {
        issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
      });
    });

    const commonIssues = Array.from(issueCount.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Identify improvement areas
    const improvementAreas = commonIssues
      .filter(i => i.count > 2)
      .map(i => i.issue);

    // Identify strengths (from positive feedback comments)
    const strengths: string[] = [];
    userFeedback
      .filter(f => f.feedbackType === 'positive' && f.comments)
      .forEach(f => {
        if (f.comments) {
          strengths.push(f.comments);
        }
      });

    return {
      averageRating,
      positiveCount,
      negativeCount,
      commonIssues,
      improvementAreas,
      strengths: strengths.slice(0, 5),
    };
  }

  /**
   * Get recent feedback
   */
  async getRecentFeedback(userId: string, since: number): Promise<UserFeedback[]> {
    const userFeedback = this.feedback.get(userId) || [];
    return userFeedback
      .filter(f => f.timestamp >= since)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get aggregate feedback statistics
   */
  async getAggregateStats(userId: string): Promise<{
    totalFeedback: number;
    averageRating: number;
    satisfaction: number; // 0-100
    trend: 'improving' | 'declining' | 'stable';
  }> {
    const userFeedback = this.feedback.get(userId) || [];

    if (userFeedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        satisfaction: 0,
        trend: 'stable',
      };
    }

    const insights = await this.getInsights(userId);
    const satisfaction = (insights.positiveCount / userFeedback.length) * 100;

    // Calculate trend (last 10 vs previous 10)
    const recent = userFeedback.slice(0, 10);
    const previous = userFeedback.slice(10, 20);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recent.length >= 5 && previous.length >= 5) {
      const recentAvg = recent.reduce((sum, f) => sum + (f.rating || 3), 0) / recent.length;
      const previousAvg = previous.reduce((sum, f) => sum + (f.rating || 3), 0) / previous.length;

      if (recentAvg > previousAvg + 0.3) trend = 'improving';
      else if (recentAvg < previousAvg - 0.3) trend = 'declining';
    }

    return {
      totalFeedback: userFeedback.length,
      averageRating: insights.averageRating,
      satisfaction,
      trend,
    };
  }
}
