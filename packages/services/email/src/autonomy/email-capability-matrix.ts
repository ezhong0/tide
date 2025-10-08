import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';

export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  category?: string;
  priority?: number;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
  involveMoney?: boolean;
  financialAmount?: number;
  attachments?: number;
  metadata?: Record<string, unknown>;
}

export interface UserContext {
  userId: UserId;
  vipContacts: string[];
  autonomyLevel: 'conservative' | 'balanced' | 'aggressive';
  customRules?: CapabilityRule[];
}

export interface RelationshipInfo {
  contactEmail: string;
  vipStatus: boolean;
  relationshipStrength: number;
  interactionFrequency: string;
}

export interface CapabilityRule {
  id: string;
  name: string;
  condition: (email: Email, context: UserContext, relationship?: RelationshipInfo) => boolean;
  canActAlone: boolean;
  requiresApproval: boolean;
  reasoning: string;
  priority: number; // Higher number = higher priority (checked first)
}

export interface CapabilityDecision {
  canExecuteAutonomously: boolean;
  requiresApproval: boolean;
  reasoning: string;
  matchedRule: string;
  confidence: number;
  suggestedAction?: string;
}

/**
 * Email Capability Matrix
 * Determines which emails can be handled autonomously vs requiring approval
 */
export class EmailCapabilityMatrix {
  private rules: CapabilityRule[] = [
    // CRITICAL - Always require approval
    {
      id: 'rule_vip_urgent',
      name: 'VIP Urgent Emails',
      priority: 100,
      condition: (email, context, relationship) =>
        relationship?.vipStatus === true && email.urgency === 'critical',
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'VIP contacts with urgent emails always need your personal attention'
    },

    {
      id: 'rule_high_financial',
      name: 'High Financial Impact',
      priority: 95,
      condition: (email) =>
        email.involveMoney === true && (email.financialAmount || 0) > 1000,
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'Emails involving >$1000 require your approval for financial safety'
    },

    {
      id: 'rule_legal_contract',
      name: 'Legal/Contract Documents',
      priority: 90,
      condition: (email) => {
        const legalKeywords = ['contract', 'agreement', 'legal', 'terms and conditions', 'nda', 'confidential'];
        const text = `${email.subject} ${email.body}`.toLowerCase();
        return legalKeywords.some(keyword => text.includes(keyword)) && (email.attachments || 0) > 0;
      },
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'Legal documents and contracts require your review'
    },

    // HIGH PRIORITY - Selective autonomy
    {
      id: 'rule_vip_general',
      name: 'VIP General Emails',
      priority: 80,
      condition: (email, context, relationship) =>
        relationship?.vipStatus === true && email.urgency !== 'low',
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'VIP contacts deserve your personal attention'
    },

    {
      id: 'rule_meeting_request',
      name: 'Meeting Requests',
      priority: 75,
      condition: (email) => {
        const meetingKeywords = ['meeting', 'call', 'schedule', 'calendar invite', 'zoom', 'teams meeting'];
        const text = `${email.subject} ${email.body}`.toLowerCase();
        return meetingKeywords.some(keyword => text.includes(keyword));
      },
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'Meeting requests should be reviewed before accepting/declining'
    },

    {
      id: 'rule_first_contact',
      name: 'First Contact from New Person',
      priority: 70,
      condition: (email, context, relationship) =>
        !relationship || relationship.interactionFrequency === 'rare',
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'First contact from new people needs your review to build relationship'
    },

    // MEDIUM PRIORITY - Conditional autonomy
    {
      id: 'rule_newsletter_promotional',
      name: 'Newsletters & Promotional',
      priority: 50,
      condition: (email) =>
        email.category === 'newsletter' || email.category === 'promotional',
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Newsletters and promotional emails can be auto-archived safely'
    },

    {
      id: 'rule_social_notifications',
      name: 'Social Media Notifications',
      priority: 45,
      condition: (email) => {
        const socialDomains = ['linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com'];
        return socialDomains.some(domain => email.from.includes(domain));
      },
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Social media notifications can be auto-categorized'
    },

    {
      id: 'rule_receipts_confirmations',
      name: 'Receipts & Order Confirmations',
      priority: 40,
      condition: (email) => {
        const keywords = ['receipt', 'order confirmation', 'invoice', 'payment received'];
        const subject = email.subject.toLowerCase();
        return keywords.some(keyword => subject.includes(keyword)) &&
               (email.financialAmount || 0) < 500;
      },
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Small transaction receipts can be auto-filed for record keeping'
    },

    {
      id: 'rule_automated_notifications',
      name: 'Automated System Notifications',
      priority: 35,
      condition: (email) => {
        const automated = ['no-reply@', 'noreply@', 'donotreply@', 'notifications@'];
        return automated.some(prefix => email.from.toLowerCase().includes(prefix));
      },
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Automated system notifications can be auto-categorized'
    },

    // LOW PRIORITY - Safe autonomous actions
    {
      id: 'rule_spam_obvious',
      name: 'Obvious Spam',
      priority: 30,
      condition: (email) => email.category === 'spam',
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Spam emails can be automatically deleted'
    },

    {
      id: 'rule_low_priority_old',
      name: 'Old Low Priority Emails',
      priority: 25,
      condition: (email) => {
        if (!email.metadata?.receivedAt) return false;
        const daysOld = (Date.now() - new Date(email.metadata.receivedAt as string).getTime()) / (1000 * 60 * 60 * 24);
        return daysOld > 30 && !!email.priority && email.priority < 3;
      },
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Old low-priority emails can be auto-archived'
    },

    {
      id: 'rule_mailing_list',
      name: 'Mailing Lists',
      priority: 20,
      condition: (email) => {
        const mailingListIndicators = ['list-unsubscribe', 'mailing list', 'update preferences'];
        const text = `${email.subject} ${email.body}`.toLowerCase();
        return mailingListIndicators.some(indicator => text.includes(indicator));
      },
      canActAlone: true,
      requiresApproval: false,
      reasoning: 'Mailing list emails can be auto-categorized'
    },

    // CONSERVATIVE MODE OVERRIDES
    {
      id: 'rule_conservative_override',
      name: 'Conservative Mode Override',
      priority: 10,
      condition: (email, context) =>
        context.autonomyLevel === 'conservative' && email.urgency !== 'low',
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'Conservative mode: most emails require approval'
    },

    // DEFAULT - Fallback rule
    {
      id: 'rule_default',
      name: 'Default Rule',
      priority: 0,
      condition: () => true,
      canActAlone: false,
      requiresApproval: true,
      reasoning: 'Default: unknown emails require approval for safety'
    }
  ];

  /**
   * Evaluate email and determine if it can be handled autonomously
   */
  async evaluate(
    email: Email,
    context: UserContext,
    relationship?: RelationshipInfo
  ): Promise<CapabilityDecision> {
    logger.info({ emailId: email.id, userId: context.userId }, 'Evaluating email capability');

    // Combine built-in rules with custom user rules
    const allRules = [
      ...(context.customRules || []),
      ...this.rules
    ].sort((a, b) => b.priority - a.priority);

    // Find first matching rule
    const matchedRule = allRules.find(rule =>
      rule.condition(email, context, relationship)
    );

    if (!matchedRule) {
      // Should never happen due to default rule, but safety fallback
      return {
        canExecuteAutonomously: false,
        requiresApproval: true,
        reasoning: 'No matching rule found, defaulting to requiring approval',
        matchedRule: 'none',
        confidence: 0.5
      };
    }

    // Calculate confidence based on rule priority and context
    const confidence = this.calculateConfidence(matchedRule, email, context, relationship);

    // Determine suggested action
    const suggestedAction = this.determineSuggestedAction(email, matchedRule, relationship);

    logger.info({
      emailId: email.id,
      matchedRule: matchedRule.id,
      canActAlone: matchedRule.canActAlone,
      confidence
    }, 'Capability evaluation complete');

    return {
      canExecuteAutonomously: matchedRule.canActAlone,
      requiresApproval: matchedRule.requiresApproval,
      reasoning: matchedRule.reasoning,
      matchedRule: matchedRule.id,
      confidence,
      suggestedAction
    };
  }

  /**
   * Calculate confidence score for the decision
   */
  private calculateConfidence(
    rule: CapabilityRule,
    email: Email,
    context: UserContext,
    relationship?: RelationshipInfo
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for high-priority rules
    if (rule.priority >= 80) {
      confidence += 0.15;
    } else if (rule.priority >= 50) {
      confidence += 0.1;
    }

    // Increase confidence for clear categories
    if (email.category && ['newsletter', 'promotional', 'spam'].includes(email.category)) {
      confidence += 0.1;
    }

    // Increase confidence with strong relationship data
    if (relationship && relationship.relationshipStrength > 0.7) {
      confidence += 0.05;
    }

    // Adjust for autonomy level
    if (context.autonomyLevel === 'aggressive' && rule.canActAlone) {
      confidence += 0.05;
    } else if (context.autonomyLevel === 'conservative') {
      confidence -= 0.1;
    }

    return Math.min(Math.max(confidence, 0), 1); // Clamp between 0 and 1
  }

  /**
   * Determine suggested action based on email and rule
   */
  private determineSuggestedAction(
    email: Email,
    rule: CapabilityRule,
    relationship?: RelationshipInfo
  ): string | undefined {
    // Map rule types to suggested actions
    const actionMap: Record<string, string> = {
      rule_newsletter_promotional: 'archive',
      rule_social_notifications: 'categorize_social',
      rule_receipts_confirmations: 'categorize_receipts',
      rule_automated_notifications: 'categorize_notifications',
      rule_spam_obvious: 'delete',
      rule_low_priority_old: 'archive',
      rule_mailing_list: 'categorize_mailing_list',
      rule_meeting_request: 'review_meeting',
      rule_vip_urgent: 'priority_flag',
      rule_high_financial: 'review_financial',
      rule_legal_contract: 'review_legal'
    };

    return actionMap[rule.id];
  }

  /**
   * Add custom rule for user
   */
  addCustomRule(rule: CapabilityRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all rules
   */
  getRules(): CapabilityRule[] {
    return [...this.rules];
  }

  /**
   * Get rules that allow autonomous action
   */
  getAutonomousRules(): CapabilityRule[] {
    return this.rules.filter(rule => rule.canActAlone);
  }

  /**
   * Get rules that require approval
   */
  getApprovalRules(): CapabilityRule[] {
    return this.rules.filter(rule => rule.requiresApproval);
  }
}
