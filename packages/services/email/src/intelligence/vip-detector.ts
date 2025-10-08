import { logger } from '@tide/logger';
import type { RelationshipData } from './relationship-tracker.js';

/**
 * VIP Detection Signals
 */
export interface VIPSignals {
  highInteractionVolume: boolean; // >20 emails/month
  quickResponseTime: boolean; // <2 hour avg response
  recentActivity: boolean; // Emailed in last 7 days
  balancedConversation: boolean; // Good back-and-forth ratio
  positiveSentiment: boolean; // Positive/very positive sentiment
  importantTopics: boolean; // Discusses important topics (meetings, projects, urgent)
  titleIndicator: boolean; // Has executive/leadership title
  domainAuthority: boolean; // From important domain (company execs, etc)
}

/**
 * VIP Score Breakdown
 */
export interface VIPScore {
  score: number; // 0-100
  isVIP: boolean; // score >= 70
  signals: VIPSignals;
  reasons: string[]; // Human-readable reasons
}

/**
 * Automatic VIP Detection
 * Analyzes multiple signals to determine if contact should be VIP
 */
export class VIPDetector {
  // VIP detection thresholds
  private readonly THRESHOLDS = {
    HIGH_INTERACTION_VOLUME: 20, // emails per month
    QUICK_RESPONSE_MINUTES: 120, // 2 hours
    RECENT_ACTIVITY_DAYS: 7,
    BALANCED_RATIO: 0.3, // At least 30% balance
    VIP_SCORE_THRESHOLD: 70, // Out of 100
  };

  // Signal weights (must sum to 100)
  private readonly SIGNAL_WEIGHTS = {
    highInteractionVolume: 20,
    quickResponseTime: 15,
    recentActivity: 10,
    balancedConversation: 15,
    positiveSentiment: 10,
    importantTopics: 15,
    titleIndicator: 10,
    domainAuthority: 5,
  };

  /**
   * Detect if contact should be VIP
   */
  async detectVIP(relationship: RelationshipData): Promise<VIPScore> {
    logger.debug({ contactEmail: relationship.contactEmail }, 'Detecting VIP status');

    // Calculate all signals
    const signals = this.calculateSignals(relationship);

    // Calculate weighted score
    const score = this.calculateScore(signals);

    // Determine VIP status
    const isVIP = score >= this.THRESHOLDS.VIP_SCORE_THRESHOLD;

    // Generate reasons
    const reasons = this.generateReasons(signals, isVIP);

    logger.info({
      contactEmail: relationship.contactEmail,
      score,
      isVIP,
      signals
    }, 'VIP detection complete');

    return {
      score,
      isVIP,
      signals,
      reasons,
    };
  }

  /**
   * Calculate all VIP signals
   */
  private calculateSignals(relationship: RelationshipData): VIPSignals {
    return {
      highInteractionVolume: this.checkHighVolume(relationship),
      quickResponseTime: this.checkQuickResponse(relationship),
      recentActivity: this.checkRecentActivity(relationship),
      balancedConversation: this.checkBalance(relationship),
      positiveSentiment: this.checkPositiveSentiment(relationship),
      importantTopics: this.checkImportantTopics(relationship),
      titleIndicator: this.checkTitle(relationship),
      domainAuthority: this.checkDomain(relationship),
    };
  }

  /**
   * Check for high interaction volume
   */
  private checkHighVolume(relationship: RelationshipData): boolean {
    if (!relationship.lastInteractionAt) return false;

    const totalInteractions = relationship.totalEmailsSent + relationship.totalEmailsReceived;
    const daysSinceStart = (Date.now() - relationship.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);
    const monthsSinceStart = Math.max(daysSinceStart / 30, 0.1); // Prevent division by zero

    const emailsPerMonth = totalInteractions / monthsSinceStart;

    return emailsPerMonth >= this.THRESHOLDS.HIGH_INTERACTION_VOLUME;
  }

  /**
   * Check for quick response time
   */
  private checkQuickResponse(relationship: RelationshipData): boolean {
    if (!relationship.averageResponseTimeMinutes) return false;

    return relationship.averageResponseTimeMinutes <= this.THRESHOLDS.QUICK_RESPONSE_MINUTES;
  }

  /**
   * Check for recent activity
   */
  private checkRecentActivity(relationship: RelationshipData): boolean {
    if (!relationship.lastInteractionAt) return false;

    const daysSinceLastInteraction =
      (Date.now() - relationship.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastInteraction <= this.THRESHOLDS.RECENT_ACTIVITY_DAYS;
  }

  /**
   * Check for balanced conversation (not too one-sided)
   */
  private checkBalance(relationship: RelationshipData): boolean {
    const totalInteractions = relationship.totalEmailsSent + relationship.totalEmailsReceived;
    if (totalInteractions === 0) return false;

    const balance =
      Math.min(relationship.totalEmailsSent, relationship.totalEmailsReceived) /
      Math.max(relationship.totalEmailsSent, relationship.totalEmailsReceived);

    return balance >= this.THRESHOLDS.BALANCED_RATIO;
  }

  /**
   * Check for positive sentiment
   */
  private checkPositiveSentiment(relationship: RelationshipData): boolean {
    return relationship.sentiment === 'positive' || relationship.sentiment === 'very_positive';
  }

  /**
   * Check for important topics (meetings, projects, deadlines)
   */
  private checkImportantTopics(relationship: RelationshipData): boolean {
    const importantKeywords = [
      'meeting',
      'project',
      'deadline',
      'urgent',
      'important',
      'review',
      'approval',
      'decision',
      'strategy',
      'planning',
    ];

    const topics = relationship.topics.map((t) => t.toLowerCase());

    return importantKeywords.some((keyword) =>
      topics.some((topic) => topic.includes(keyword))
    );
  }

  /**
   * Check for executive/leadership title indicators
   */
  private checkTitle(relationship: RelationshipData): boolean {
    if (!relationship.contactName && !relationship.metadata?.title) return false;

    const titleIndicators = [
      'ceo',
      'cto',
      'cfo',
      'coo',
      'president',
      'vp',
      'vice president',
      'director',
      'head of',
      'chief',
      'founder',
      'partner',
      'executive',
      'senior',
      'lead',
      'principal',
    ];

    const nameAndTitle = `${relationship.contactName || ''} ${relationship.metadata?.title || ''}`.toLowerCase();

    return titleIndicators.some((indicator) => nameAndTitle.includes(indicator));
  }

  /**
   * Check domain authority (important company domains)
   */
  private checkDomain(relationship: RelationshipData): boolean {
    // Extract domain from email
    const domain = relationship.contactEmail.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    // Check against known important domains (in real app, this would be customizable per user)
    const importantDomains = [
      // User can configure their important domains
      // For now, check if it's not a generic email provider
    ];

    // Generic email providers (less authority)
    const genericProviders = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'aol.com',
    ];

    // Not a generic provider = likely corporate email = more authority
    return !genericProviders.includes(domain);
  }

  /**
   * Calculate weighted VIP score
   */
  private calculateScore(signals: VIPSignals): number {
    let score = 0;

    if (signals.highInteractionVolume) score += this.SIGNAL_WEIGHTS.highInteractionVolume;
    if (signals.quickResponseTime) score += this.SIGNAL_WEIGHTS.quickResponseTime;
    if (signals.recentActivity) score += this.SIGNAL_WEIGHTS.recentActivity;
    if (signals.balancedConversation) score += this.SIGNAL_WEIGHTS.balancedConversation;
    if (signals.positiveSentiment) score += this.SIGNAL_WEIGHTS.positiveSentiment;
    if (signals.importantTopics) score += this.SIGNAL_WEIGHTS.importantTopics;
    if (signals.titleIndicator) score += this.SIGNAL_WEIGHTS.titleIndicator;
    if (signals.domainAuthority) score += this.SIGNAL_WEIGHTS.domainAuthority;

    return score;
  }

  /**
   * Generate human-readable reasons for VIP status
   */
  private generateReasons(signals: VIPSignals, isVIP: boolean): string[] {
    const reasons: string[] = [];

    if (signals.highInteractionVolume) {
      reasons.push('Frequent communication (20+ emails/month)');
    }

    if (signals.quickResponseTime) {
      reasons.push('Quick response time (avg <2 hours)');
    }

    if (signals.recentActivity) {
      reasons.push('Recent activity (emailed in last 7 days)');
    }

    if (signals.balancedConversation) {
      reasons.push('Strong two-way relationship');
    }

    if (signals.positiveSentiment) {
      reasons.push('Positive interaction sentiment');
    }

    if (signals.importantTopics) {
      reasons.push('Discusses important topics (meetings, projects, deadlines)');
    }

    if (signals.titleIndicator) {
      reasons.push('Has leadership/executive title');
    }

    if (signals.domainAuthority) {
      reasons.push('Corporate email (not generic provider)');
    }

    if (!isVIP && reasons.length === 0) {
      reasons.push('Infrequent or low-engagement contact');
    }

    return reasons;
  }

  /**
   * Bulk detect VIPs for multiple contacts
   */
  async detectBulkVIPs(relationships: RelationshipData[]): Promise<Map<string, VIPScore>> {
    logger.info({ count: relationships.length }, 'Bulk VIP detection started');

    const results = new Map<string, VIPScore>();

    for (const relationship of relationships) {
      const score = await this.detectVIP(relationship);
      results.set(relationship.contactEmail, score);
    }

    const vipCount = Array.from(results.values()).filter((s) => s.isVIP).length;

    logger.info({
      total: relationships.length,
      vips: vipCount,
      percentage: Math.round((vipCount / relationships.length) * 100),
    }, 'Bulk VIP detection complete');

    return results;
  }

  /**
   * Get VIP recommendation (for UI display)
   */
  getVIPRecommendation(score: VIPScore): {
    action: 'mark_vip' | 'keep_monitoring' | 'no_action';
    confidence: 'high' | 'medium' | 'low';
    message: string;
  } {
    if (score.score >= 80) {
      return {
        action: 'mark_vip',
        confidence: 'high',
        message: `Strong VIP candidate (${score.score}/100). Consider marking as VIP.`,
      };
    }

    if (score.score >= 70) {
      return {
        action: 'mark_vip',
        confidence: 'medium',
        message: `Potential VIP (${score.score}/100). Review and consider marking as VIP.`,
      };
    }

    if (score.score >= 50) {
      return {
        action: 'keep_monitoring',
        confidence: 'medium',
        message: `Developing relationship (${score.score}/100). Monitor for VIP potential.`,
      };
    }

    return {
      action: 'no_action',
      confidence: 'low',
      message: `Low engagement (${score.score}/100). No VIP action needed.`,
    };
  }
}

/**
 * Export singleton instance
 */
export const vipDetector = new VIPDetector();
