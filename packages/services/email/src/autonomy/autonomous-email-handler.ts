import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import { serviceUrls } from '@tide/config';
import type { UserId } from '@tide/types';
import { EmailCapabilityMatrix, type Email, type UserContext, type RelationshipInfo, type CapabilityDecision } from './email-capability-matrix.js';

export interface EmailAction {
  id: string;
  emailId: string;
  userId: UserId;
  actionType: 'archive' | 'respond' | 'forward' | 'categorize' | 'flag' | 'delete' | 'delegate';
  actionDetails: Record<string, unknown>;
  reasoning: string;
  confidence: number;
  status: 'pending' | 'executed' | 'failed' | 'undone';
  executedAt?: Date;
  undoneAt?: Date;
  userFeedback?: 'approved' | 'rejected' | 'modified' | 'undone';
}

export interface EmailAnalysis {
  category: string;
  priority: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  requiresResponse: boolean;
  suggestedAction: string;
  confidence: number;
  involveMoney: boolean;
  financialAmount?: number;
  sentiment?: string;
}

/**
 * Autonomous Email Handler
 * Processes emails and executes safe actions automatically, queues sensitive ones for approval
 */
export class AutonomousEmailHandler {
  private db = createSupabase(true);
  private capabilityMatrix = new EmailCapabilityMatrix();
  private aiServiceURL = serviceUrls.ai;

  /**
   * Process incoming email
   */
  async process(email: Email, userId: UserId): Promise<EmailAction> {
    logger.info({ emailId: email.id, userId }, 'Processing email autonomously');

    // Step 1: Analyze email
    const analysis = await this.analyzeEmail(email);

    // Step 2: Get user context and relationship info with graceful degradation
    const results = await Promise.allSettled([
      this.getUserContext(userId),
      this.getRelationshipInfo(userId, email.from)
    ]);

    const userContext = results[0].status === 'fulfilled'
      ? results[0].value
      : { userId, autonomyLevel: 'balanced' as const, vipContacts: [], customRules: [] };
    const relationship = results[1].status === 'fulfilled' ? results[1].value : undefined;

    // Log failures
    if (results[0].status === 'rejected') {
      logger.warn({ error: results[0].reason, userId }, 'Failed to get user context, using defaults');
    }
    if (results[1].status === 'rejected') {
      logger.warn({ error: results[1].reason, contactEmail: email.from }, 'Failed to get relationship info');
    }

    // Step 3: Evaluate capability (can we act autonomously?)
    const capability = await this.capabilityMatrix.evaluate(
      { ...email, ...analysis },
      userContext,
      relationship
    );

    // Step 4: Execute or queue
    if (capability.canExecuteAutonomously) {
      // Execute automatically
      const action = await this.executeAction(email, userId, capability, analysis);
      await this.notifyUser(email, action, 'executed');

      // Learn from autonomous execution
      await this.recordPattern(userId, email, action, 'autonomous_execution');

      return action;
    } else {
      // Queue for approval
      const action = await this.queueForApproval(email, userId, capability, analysis);
      await this.notifyUser(email, action, 'pending_approval');
      return action;
    }
  }

  /**
   * Analyze email using AI
   */
  private async analyzeEmail(email: Email): Promise<EmailAnalysis> {
    try {
      const response = await fetch(`${this.aiServiceURL}/analyze/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_id: email.id,
          from: email.from,
          subject: email.subject,
          body: email.body
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = await response.json();
      return this.mapAIAnalysis(result);
    } catch (error) {
      logger.warn({ error }, 'AI analysis failed, using rule-based fallback');
      return this.ruleBasedAnalysis(email);
    }
  }

  /**
   * Map AI analysis result
   */
  private mapAIAnalysis(aiResult: any): EmailAnalysis {
    return {
      category: aiResult.category || 'other',
      priority: aiResult.priority || 5,
      urgency: aiResult.urgency || 'medium',
      requiresResponse: aiResult.requires_response || false,
      suggestedAction: aiResult.suggested_action || 'review',
      confidence: aiResult.confidence || 0.7,
      involveMoney: aiResult.involves_money || false,
      financialAmount: aiResult.financial_amount,
      sentiment: aiResult.sentiment
    };
  }

  /**
   * Rule-based analysis fallback
   */
  private ruleBasedAnalysis(email: Email): EmailAnalysis {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();
    const text = `${subject} ${body}`;

    // Detect category
    let category = 'other';
    if (text.includes('newsletter') || text.includes('unsubscribe')) {
      category = 'newsletter';
    } else if (text.includes('promotion') || text.includes('sale') || text.includes('discount')) {
      category = 'promotional';
    } else if (text.includes('meeting') || text.includes('calendar')) {
      category = 'meeting';
    }

    // Detect urgency
    let urgency: EmailAnalysis['urgency'] = 'medium';
    if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
      urgency = 'high';
    } else if (text.includes('when you can') || text.includes('no rush')) {
      urgency = 'low';
    }

    // Detect financial
    const moneyPattern = /\$[\d,]+(\.\d{2})?/g;
    const moneyMatches = text.match(moneyPattern);
    const involveMoney = !!moneyMatches;
    const financialAmount = moneyMatches
      ? parseFloat(moneyMatches[0].replace(/[$,]/g, ''))
      : undefined;

    return {
      category,
      priority: urgency === 'high' ? 8 : urgency === 'low' ? 3 : 5,
      urgency,
      requiresResponse: !['newsletter', 'promotional'].includes(category),
      suggestedAction: category === 'newsletter' ? 'archive' : 'review',
      confidence: 0.6,
      involveMoney,
      financialAmount
    };
  }

  /**
   * Get user context including autonomy preferences
   */
  private async getUserContext(userId: UserId): Promise<UserContext> {
    const { data: preferences } = await this.db
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: vipContacts } = await this.db
      .from('relationship_intelligence')
      .select('contact_email')
      .eq('user_id', userId)
      .eq('vip_status', true);

    return {
      userId,
      autonomyLevel: preferences?.autonomy_level || 'balanced',
      vipContacts: vipContacts?.map(c => c.contact_email) || [],
      customRules: preferences?.custom_rules || []
    };
  }

  /**
   * Get relationship information for contact
   */
  private async getRelationshipInfo(
    userId: UserId,
    contactEmail: string
  ): Promise<RelationshipInfo | undefined> {
    const { data } = await this.db
      .from('relationship_intelligence')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_email', contactEmail)
      .single();

    if (!data) return undefined;

    return {
      contactEmail: data.contact_email,
      vipStatus: data.vip_status,
      relationshipStrength: data.relationship_strength,
      interactionFrequency: data.interaction_frequency
    };
  }

  /**
   * Execute action autonomously
   */
  private async executeAction(
    email: Email,
    userId: UserId,
    capability: CapabilityDecision,
    analysis: EmailAnalysis
  ): Promise<EmailAction> {
    const action: EmailAction = {
      id: crypto.randomUUID(),
      emailId: email.id,
      userId,
      actionType: this.mapSuggestedActionToType(capability.suggestedAction || analysis.suggestedAction),
      actionDetails: {
        originalSubject: email.subject,
        category: analysis.category,
        capability: capability.matchedRule
      },
      reasoning: capability.reasoning,
      confidence: capability.confidence,
      status: 'pending'
    };

    try {
      // Execute the action
      await this.performAction(action, email);

      // Record in database
      await this.db.from('autonomous_email_actions').insert({
        id: action.id,
        user_id: userId,
        email_id: email.id,
        action_type: action.actionType,
        action_details: action.actionDetails,
        reasoning: action.reasoning,
        confidence: action.confidence,
        executed_at: new Date().toISOString()
      });

      // Update email triage
      await this.db.from('email_triage').upsert({
        user_id: userId,
        email_id: email.id,
        category: analysis.category,
        priority: analysis.priority,
        urgency: analysis.urgency,
        autonomous_action_taken: action.actionType,
        autonomous_executed_at: new Date().toISOString()
      });

      action.status = 'executed';
      action.executedAt = new Date();

      logger.info({ actionId: action.id, emailId: email.id }, 'Autonomous action executed');

      return action;
    } catch (error) {
      logger.error({ error, actionId: action.id }, 'Failed to execute autonomous action');
      action.status = 'failed';
      return action;
    }
  }

  /**
   * Queue action for user approval
   */
  private async queueForApproval(
    email: Email,
    userId: UserId,
    capability: CapabilityDecision,
    analysis: EmailAnalysis
  ): Promise<EmailAction> {
    const action: EmailAction = {
      id: crypto.randomUUID(),
      emailId: email.id,
      userId,
      actionType: this.mapSuggestedActionToType(capability.suggestedAction || analysis.suggestedAction),
      actionDetails: {
        originalSubject: email.subject,
        category: analysis.category,
        capability: capability.matchedRule
      },
      reasoning: capability.reasoning,
      confidence: capability.confidence,
      status: 'pending'
    };

    // Add to action suggestions table (from Phase 1)
    await this.db.from('action_suggestions').insert({
      id: action.id,
      user_id: userId,
      suggestion_type: action.actionType,
      context: {
        email_id: email.id,
        from: email.from,
        subject: email.subject,
        ...action.actionDetails
      },
      preview: `${action.actionType}: ${email.subject}`,
      confidence: action.confidence,
      requires_approval: true,
      status: 'pending'
    });

    logger.info({ actionId: action.id, emailId: email.id }, 'Action queued for approval');

    return action;
  }

  /**
   * Perform the actual action
   */
  private async performAction(action: EmailAction, email: Email): Promise<void> {
    switch (action.actionType) {
      case 'archive':
        // Call email service to archive
        await this.archiveEmail(email.id);
        break;
      case 'categorize':
        // Update email category
        await this.categorizeEmail(email.id, action.actionDetails.category as string);
        break;
      case 'delete':
        // Soft delete email
        await this.deleteEmail(email.id);
        break;
      case 'flag':
        // Flag email for attention
        await this.flagEmail(email.id);
        break;
      // Other actions would call appropriate services
      default:
        logger.warn({ actionType: action.actionType }, 'Unknown action type');
    }
  }

  /**
   * Archive email
   */
  private async archiveEmail(emailId: string): Promise<void> {
    // Implementation would call email provider API
    logger.info({ emailId }, 'Archiving email');
  }

  /**
   * Categorize email
   */
  private async categorizeEmail(emailId: string, category: string): Promise<void> {
    logger.info({ emailId, category }, 'Categorizing email');
  }

  /**
   * Delete email
   */
  private async deleteEmail(emailId: string): Promise<void> {
    logger.info({ emailId }, 'Deleting email');
  }

  /**
   * Flag email
   */
  private async flagEmail(emailId: string): Promise<void> {
    logger.info({ emailId }, 'Flagging email');
  }

  /**
   * Map suggested action to action type
   */
  private mapSuggestedActionToType(suggestedAction: string): EmailAction['actionType'] {
    const mapping: Record<string, EmailAction['actionType']> = {
      archive: 'archive',
      categorize_social: 'categorize',
      categorize_receipts: 'categorize',
      categorize_notifications: 'categorize',
      categorize_mailing_list: 'categorize',
      delete: 'delete',
      review_meeting: 'flag',
      priority_flag: 'flag',
      review_financial: 'flag',
      review_legal: 'flag'
    };

    return mapping[suggestedAction] || 'flag';
  }

  /**
   * Notify user of action taken
   */
  private async notifyUser(
    email: Email,
    action: EmailAction,
    type: 'executed' | 'pending_approval'
  ): Promise<void> {
    logger.info({
      emailId: email.id,
      actionId: action.id,
      type
    }, 'User notification sent');
    // Implementation would send push notification or update UI
  }

  /**
   * Record pattern for learning
   */
  private async recordPattern(
    userId: UserId,
    email: Email,
    action: EmailAction,
    patternType: string
  ): Promise<void> {
    await this.db.from('email_patterns').insert({
      user_id: userId,
      pattern_type: patternType,
      trigger_conditions: {
        category: email.category,
        from_domain: email.from.split('@')[1],
        action_type: action.actionType
      },
      action_taken: action.actionType,
      success_count: 1
    });
  }

  /**
   * Undo autonomous action
   */
  async undoAction(actionId: string, userId: UserId): Promise<void> {
    const { data: action } = await this.db
      .from('autonomous_email_actions')
      .select('*')
      .eq('id', actionId)
      .eq('user_id', userId)
      .single();

    if (!action) {
      throw new Error('Action not found');
    }

    // Perform undo based on action type
    // Implementation would reverse the action

    // Update action record
    await this.db
      .from('autonomous_email_actions')
      .update({
        undone_at: new Date().toISOString(),
        user_feedback: 'undone'
      })
      .eq('id', actionId);

    logger.info({ actionId }, 'Action undone');
  }

  /**
   * Record user feedback on action
   */
  async recordFeedback(
    actionId: string,
    userId: UserId,
    feedback: 'approved' | 'rejected' | 'modified'
  ): Promise<void> {
    await this.db
      .from('autonomous_email_actions')
      .update({
        user_feedback: feedback,
        feedback_at: new Date().toISOString()
      })
      .eq('id', actionId)
      .eq('user_id', userId);

    // Update pattern confidence based on feedback
    const { data: action } = await this.db
      .from('autonomous_email_actions')
      .select('*')
      .eq('id', actionId)
      .single();

    if (action) {
      await this.updatePatternConfidence(userId, action, feedback);
    }
  }

  /**
   * Update pattern confidence based on user feedback
   */
  private async updatePatternConfidence(
    userId: UserId,
    action: any,
    feedback: string
  ): Promise<void> {
    const increment = feedback === 'approved' ? 1 : 0;
    const decrement = feedback === 'rejected' ? 1 : 0;

    await this.db.rpc('update_pattern_feedback', {
      p_user_id: userId,
      p_action_type: action.action_type,
      p_approved: increment,
      p_rejected: decrement
    });
  }
}
