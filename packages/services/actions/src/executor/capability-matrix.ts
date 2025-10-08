import { logger } from '@tide/logger';
import type { ActionType, ActionContext, CapabilityRule, UserPreferences } from '../types/index.js';

/**
 * Capability Matrix
 * Determines what actions can be executed autonomously vs requiring approval
 */
export class CapabilityMatrix {
  private rules: Map<string, CapabilityRule[]> = new Map();

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize capability rules
   */
  private initializeRules(): void {
    // Email Actions
    this.addRule('archive_email', {
      condition: (ctx) => {
        const email = ctx.payload as any;
        return email.category === 'newsletter' || email.category === 'promotional';
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'Newsletters and promotional emails are safe to auto-archive'
    });

    this.addRule('archive_email', {
      condition: (ctx) => {
        const email = ctx.payload as any;
        return email.isSpam || email.confidence > 0.95;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'High-confidence spam detection allows autonomous archiving'
    });

    this.addRule('send_email', {
      condition: (ctx) => {
        const email = ctx.payload as any;
        return email.financialAmount && email.financialAmount > 1000;
      },
      canExecuteAlone: false,
      requiresApproval: true,
      reasoning: 'Financial commitments over $1000 require approval'
    });

    this.addRule('send_email', {
      condition: (ctx, prefs) => {
        const email = ctx.payload as any;
        return prefs?.vipContacts?.includes(email.to);
      },
      canExecuteAlone: false,
      requiresApproval: true,
      reasoning: 'Emails to VIP contacts require approval'
    });

    this.addRule('send_email', {
      condition: (ctx) => {
        const email = ctx.payload as any;
        return email.isRoutine && email.confidence > 0.9;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'High-confidence routine emails can be sent autonomously'
    });

    // Meeting Actions
    this.addRule('decline_meeting', {
      condition: (ctx) => {
        const meeting = ctx.payload as any;
        return meeting.optional && meeting.conflictExists;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'Optional meetings with conflicts can be auto-declined'
    });

    this.addRule('decline_meeting', {
      condition: (ctx, prefs) => {
        const meeting = ctx.payload as any;
        return prefs?.vipContacts?.some(vip => meeting.attendees?.includes(vip));
      },
      canExecuteAlone: false,
      requiresApproval: true,
      reasoning: 'Meetings with VIP attendees require approval to decline'
    });

    this.addRule('reschedule_meeting', {
      condition: (ctx) => {
        const meeting = ctx.payload as any;
        return meeting.attendeeCount <= 2 && meeting.alternativeFound;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'Small meetings with clear alternatives can be auto-rescheduled'
    });

    this.addRule('reschedule_meeting', {
      condition: (ctx) => {
        const meeting = ctx.payload as any;
        return meeting.attendeeCount > 5;
      },
      canExecuteAlone: false,
      requiresApproval: true,
      reasoning: 'Large meetings require approval to reschedule'
    });

    // Task Actions
    this.addRule('delegate_task', {
      condition: (ctx) => {
        const task = ctx.payload as any;
        return task.delegable && task.suggestedDelegate && task.confidence > 0.85;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'High-confidence task delegation with clear delegate'
    });

    this.addRule('update_task', {
      condition: (ctx) => {
        const task = ctx.payload as any;
        return task.statusChange === 'completed' && task.autoCompleted;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'Auto-completed tasks can update status autonomously'
    });

    // Reminder Actions
    this.addRule('send_reminder', {
      condition: (ctx) => {
        const reminder = ctx.payload as any;
        return reminder.type === 'follow_up' && reminder.confidence > 0.8;
      },
      canExecuteAlone: true,
      requiresApproval: false,
      reasoning: 'Follow-up reminders can be sent autonomously'
    });

    logger.info({ ruleCount: this.getAllRules().length }, 'Capability matrix initialized');
  }

  /**
   * Add a capability rule
   */
  private addRule(actionType: ActionType, rule: CapabilityRule): void {
    if (!this.rules.has(actionType)) {
      this.rules.set(actionType, []);
    }
    this.rules.get(actionType)!.push(rule);
  }

  /**
   * Check if action can be executed autonomously
   */
  canExecuteAutonomously(
    actionType: ActionType,
    context: ActionContext,
    userPreferences?: UserPreferences
  ): { canExecute: boolean; reasoning: string; requiresApproval: boolean } {
    const rules = this.rules.get(actionType) || [];

    // Check user's autonomy level
    const autonomyLevel = userPreferences?.autonomyLevel || 'balanced';

    if (autonomyLevel === 'conservative') {
      return {
        canExecute: false,
        reasoning: 'User has conservative autonomy settings - all actions require approval',
        requiresApproval: true
      };
    }

    // Check custom rules first
    if (userPreferences?.customRules) {
      for (const customRule of userPreferences.customRules) {
        // In a real implementation, would evaluate custom rule condition
        // For now, just check if rule applies
        if (customRule.action === 'never_suggest') {
          return {
            canExecute: false,
            reasoning: `Custom rule: ${customRule.name}`,
            requiresApproval: false
          };
        }
      }
    }

    // Find matching rule
    for (const rule of rules) {
      if (rule.condition(context, userPreferences)) {
        return {
          canExecute: rule.canExecuteAlone,
          reasoning: rule.reasoning,
          requiresApproval: rule.requiresApproval
        };
      }
    }

    // Default: require approval
    return {
      canExecute: false,
      reasoning: 'No matching rule found - defaulting to require approval',
      requiresApproval: true
    };
  }

  /**
   * Get all rules for debugging
   */
  getAllRules(): Array<{ actionType: string; rule: CapabilityRule }> {
    const allRules: Array<{ actionType: string; rule: CapabilityRule }> = [];
    for (const [actionType, rules] of this.rules.entries()) {
      for (const rule of rules) {
        allRules.push({ actionType, rule });
      }
    }
    return allRules;
  }
}
