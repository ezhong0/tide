import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import type { ActionSuggestion, ActionContext, UserPreferences } from '../types/index.js';
import { CapabilityMatrix } from '../executor/capability-matrix.js';

/**
 * Action Suggester
 * Analyzes user data and suggests intelligent actions
 */
export class ActionSuggester {
  private db = createSupabase(true);
  private capabilityMatrix = new CapabilityMatrix();

  /**
   * Generate action suggestions for a user
   */
  async generateSuggestions(userId: UserId): Promise<ActionSuggestion[]> {
    logger.info({ userId }, 'Generating action suggestions');

    const userPreferences = await this.getUserPreferences(userId);
    const suggestions: ActionSuggestion[] = [];

    // Generate suggestions from different sources in parallel
    const [
      emailSuggestions,
      calendarSuggestions,
      taskSuggestions
    ] = await Promise.all([
      this.suggestEmailActions(userId, userPreferences),
      this.suggestCalendarActions(userId, userPreferences),
      this.suggestTaskActions(userId, userPreferences)
    ]);

    suggestions.push(...emailSuggestions, ...calendarSuggestions, ...taskSuggestions);

    // Filter and rank suggestions
    const rankedSuggestions = this.rankSuggestions(suggestions);

    logger.info({ userId, count: rankedSuggestions.length }, 'Suggestions generated');

    return rankedSuggestions.slice(0, 10); // Top 10 suggestions
  }

  /**
   * Suggest email actions
   */
  private async suggestEmailActions(
    userId: UserId,
    preferences: UserPreferences
  ): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];

    // Get unread emails
    const { data: emails } = await this.db
      .from('emails')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .limit(20);

    if (!emails) return suggestions;

    for (const email of emails) {
      // Suggest archiving newsletters/promotional
      if (email.ai_category === 'low' || email.ai_category === 'promotional') {
        const context: ActionContext = {
          targetId: email.id,
          targetType: 'email',
          payload: {
            emailId: email.id,
            category: email.ai_category
          }
        };

        const capability = this.capabilityMatrix.canExecuteAutonomously(
          'archive_email',
          context,
          preferences
        );

        suggestions.push({
          type: 'archive_email',
          context,
          preview: `Archive "${email.subject}"`,
          confidence: 0.85,
          requiresApproval: capability.requiresApproval,
          reasoning: capability.reasoning,
          estimatedTimeSaved: 1
        });
      }

      // Suggest responding to routine emails
      if (email.ai_category === 'routine' && email.ai_priority >= 7) {
        const context: ActionContext = {
          targetId: email.id,
          targetType: 'email',
          payload: {
            emailId: email.id,
            to: email.from_address,
            isRoutine: true
          }
        };

        const capability = this.capabilityMatrix.canExecuteAutonomously(
          'send_email',
          context,
          preferences
        );

        suggestions.push({
          type: 'send_email',
          context,
          preview: `Draft response to "${email.subject}"`,
          confidence: 0.75,
          requiresApproval: capability.requiresApproval,
          reasoning: 'Routine email can have draft auto-generated',
          estimatedTimeSaved: 5
        });
      }
    }

    return suggestions;
  }

  /**
   * Suggest calendar actions
   */
  private async suggestCalendarActions(
    userId: UserId,
    preferences: UserPreferences
  ): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];

    // Get upcoming events
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: events } = await this.db
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', now.toISOString())
      .lt('start_time', tomorrow.toISOString());

    if (!events) return suggestions;

    // Check for conflicts
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        const start1 = new Date(event1.start_time);
        const end1 = new Date(event1.end_time);
        const start2 = new Date(event2.start_time);
        const end2 = new Date(event2.end_time);

        // Check if events overlap
        if (start1 < end2 && start2 < end1) {
          // Suggest declining optional meeting
          const optionalEvent = event1.is_optional ? event1 : (event2.is_optional ? event2 : null);

          if (optionalEvent) {
            const context: ActionContext = {
              targetId: optionalEvent.id,
              targetType: 'event',
              payload: {
                eventId: optionalEvent.id,
                optional: true,
                conflictExists: true,
                reason: 'Scheduling conflict with another meeting'
              }
            };

            const capability = this.capabilityMatrix.canExecuteAutonomously(
              'decline_meeting',
              context,
              preferences
            );

            suggestions.push({
              type: 'decline_meeting',
              context,
              preview: `Decline "${optionalEvent.title}" due to conflict`,
              confidence: 0.8,
              requiresApproval: capability.requiresApproval,
              reasoning: capability.reasoning,
              estimatedTimeSaved: 30
            });
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Suggest task actions
   */
  private async suggestTaskActions(
    userId: UserId,
    preferences: UserPreferences
  ): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];

    // Get pending tasks
    const { data: tasks } = await this.db
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(10);

    if (!tasks) return suggestions;

    for (const task of tasks) {
      // Suggest delegating low-priority tasks
      if (task.priority === 'low' && task.estimated_effort > 60) {
        const context: ActionContext = {
          targetId: task.id,
          targetType: 'task',
          payload: {
            taskId: task.id,
            delegable: true,
            suggestedDelegate: task.suggested_delegate
          }
        };

        const capability = this.capabilityMatrix.canExecuteAutonomously(
          'delegate_task',
          context,
          preferences
        );

        suggestions.push({
          type: 'delegate_task',
          context,
          preview: `Delegate "${task.title}"`,
          confidence: 0.7,
          requiresApproval: capability.requiresApproval,
          reasoning: 'Low-priority task with suggested delegate',
          estimatedTimeSaved: task.estimated_effort || 30
        });
      }

      // Suggest reminders for overdue tasks
      if (task.due_at && new Date(task.due_at) < new Date()) {
        suggestions.push({
          type: 'send_reminder',
          context: {
            targetId: task.id,
            targetType: 'task',
            payload: {
              taskId: task.id,
              type: 'overdue',
              message: `Reminder: "${task.title}" is overdue`
            }
          },
          preview: `Send reminder for overdue task "${task.title}"`,
          confidence: 0.9,
          requiresApproval: false,
          reasoning: 'Automatic reminder for overdue task',
          estimatedTimeSaved: 2
        });
      }
    }

    return suggestions;
  }

  /**
   * Rank suggestions by value
   */
  private rankSuggestions(suggestions: ActionSuggestion[]): ActionSuggestion[] {
    return suggestions.sort((a, b) => {
      // Score = confidence * timeSaved
      const scoreA = a.confidence * (a.estimatedTimeSaved || 0);
      const scoreB = b.confidence * (b.estimatedTimeSaved || 0);
      return scoreB - scoreA;
    });
  }

  /**
   * Get user preferences
   */
  private async getUserPreferences(userId: UserId): Promise<UserPreferences> {
    const { data } = await this.db
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      return {
        autonomyLevel: data.autonomy_level || 'balanced',
        trustedSenders: data.trusted_senders || [],
        vipContacts: data.vip_contacts || [],
        neverAutomateCategories: data.never_automate_categories || [],
        customRules: data.custom_rules || []
      };
    }

    // Default preferences
    return {
      autonomyLevel: 'balanced',
      trustedSenders: [],
      vipContacts: [],
      neverAutomateCategories: [],
      customRules: []
    };
  }

  /**
   * Save suggestion to database
   */
  async saveSuggestion(userId: UserId, suggestion: ActionSuggestion): Promise<string> {
    const { data, error } = await this.db
      .from('action_suggestions')
      .insert({
        user_id: userId,
        suggestion_type: suggestion.type,
        context: suggestion.context,
        preview: suggestion.preview,
        confidence: suggestion.confidence,
        requires_approval: suggestion.requiresApproval,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save suggestion: ${error.message}`);
    }

    return data.id;
  }
}
