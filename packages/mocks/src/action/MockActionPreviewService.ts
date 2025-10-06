/**
 * Mock Action Preview Service (Module 00 - Day 3)
 * In-memory implementation for testing preview-and-confirm pattern
 */

import { IActionPreviewService } from '@tide/contracts';
import {
  Result,
  ok,
  err,
  IAction,
  IActionPreview,
  IActionResult,
  UserId,
  UUID,
  Timestamp
} from '@tide/types';
import crypto from 'crypto';

interface ExecutedAction {
  id: string;
  action: IAction;
  userId: UserId;
  timestamp: Timestamp;
  undoable: boolean;
  undoWindow: number;
}

export class MockActionPreviewService implements IActionPreviewService {
  private executedActions: Map<string, ExecutedAction> = new Map();

  /**
   * Generate preview for an action
   * @performance <500ms
   */
  async generatePreview(
    action: IAction,
    userId: UserId
  ): Promise<Result<IActionPreview>> {
    // Validate action first
    const validation = await this.validateAction(action);
    if (!validation.success) {
      return validation as Result<IActionPreview>;
    }

    if (!validation.data.valid) {
      return err(new Error(`Invalid action: ${validation.data.errors?.join(', ')}`));
    }

    const preview: IActionPreview = {
      summary: this.generateSummary(action),
      details: {
        action: action.type,
        targetResource: this.getTargetResource(action),
        changes: action.params,
        affectedItems: this.getAffectedItems(action)
      },
      risks: this.assessRisks(action),
      alternatives: this.generateAlternatives(action),
      editable: this.isEditable(action),
      editableFields: this.getEditableFields(action)
    };

    return ok(preview);
  }

  /**
   * Execute a confirmed action
   * @performance <1000ms
   */
  async executeAction(
    action: IAction,
    userId: UserId,
    modifications?: Record<string, unknown>
  ): Promise<Result<IActionResult>> {
    // Validate action
    const validation = await this.validateAction(action);
    if (!validation.success) {
      return validation as Result<IActionResult>;
    }

    if (!validation.data.valid) {
      return err(new Error(`Cannot execute invalid action: ${validation.data.errors?.join(', ')}`));
    }

    // Apply modifications if provided
    const finalAction = modifications
      ? { ...action, params: { ...action.params, ...modifications } }
      : action;

    // Execute the action (mock implementation)
    const resultId = crypto.randomUUID();
    const undoWindowResult = await this.getUndoWindow(finalAction.type);
    const undoWindow = undoWindowResult.success ? undoWindowResult.data : 0;

    const executedAction: ExecutedAction = {
      id: resultId,
      action: finalAction,
      userId,
      timestamp: Date.now() as Timestamp,
      undoable: undoWindow > 0,
      undoWindow
    };

    this.executedActions.set(resultId, executedAction);

    const result: IActionResult = {
      success: true,
      action: finalAction,
      result: this.getActionResult(finalAction),
      undoable: executedAction.undoable,
      undoWindow: executedAction.undoWindow
    };

    return ok(result);
  }

  /**
   * Check if action requires confirmation
   * @performance <50ms
   */
  async requiresConfirmation(action: IAction): Promise<Result<boolean>> {
    // High-risk actions always require confirmation
    if (action.riskLevel === 'high') {
      return ok(true);
    }

    // Actions with requiresConfirmation flag
    if (action.requiresConfirmation) {
      return ok(true);
    }

    // Destructive actions require confirmation
    const destructiveActions = ['cancel_meeting', 'delete_email'];
    if (destructiveActions.includes(action.type)) {
      return ok(true);
    }

    return ok(false);
  }

  /**
   * Check if action requires authentication
   * @performance <50ms
   */
  async requiresAuthentication(action: IAction): Promise<Result<boolean>> {
    // Sensitive actions require authentication
    const sensitiveActions = ['send_email', 'schedule_meeting', 'cancel_meeting'];
    return ok(sensitiveActions.includes(action.type));
  }

  /**
   * Get undo window for action type
   * @performance <10ms
   */
  async getUndoWindow(actionType: string): Promise<Result<number>> {
    const undoWindows: Record<string, number> = {
      send_email: 30000, // 30 seconds
      schedule_meeting: 300000, // 5 minutes
      cancel_meeting: 300000, // 5 minutes
      draft_email: 0, // Not undoable
      search_emails: 0,
      summarize_thread: 0,
      create_task: 60000, // 1 minute
      set_reminder: 60000,
      reply_email: 30000,
      forward_email: 30000,
      reschedule_meeting: 300000
    };

    return ok(undoWindows[actionType] ?? 0);
  }

  /**
   * Undo an action
   * @performance <500ms
   */
  async undoAction(resultId: string, userId: UserId): Promise<Result<void>> {
    const executed = this.executedActions.get(resultId);

    if (!executed) {
      return err(new Error('Action not found'));
    }

    if (executed.userId !== userId) {
      return err(new Error('Unauthorized to undo this action'));
    }

    if (!executed.undoable) {
      return err(new Error('Action cannot be undone'));
    }

    const now = Date.now();
    const elapsed = now - executed.timestamp;

    if (elapsed > executed.undoWindow) {
      return err(new Error('Undo window has expired'));
    }

    // Remove the action (mock undo)
    this.executedActions.delete(resultId);

    return ok(undefined);
  }

  /**
   * Validate action parameters
   * @performance <100ms
   */
  async validateAction(
    action: IAction
  ): Promise<Result<{ valid: boolean; errors?: string[] }>> {
    const errors: string[] = [];

    // Validate action type
    const validTypes = [
      'send_email',
      'schedule_meeting',
      'reschedule_meeting',
      'cancel_meeting',
      'draft_email',
      'search_emails',
      'summarize_thread',
      'create_task',
      'set_reminder',
      'reply_email',
      'forward_email'
    ];

    if (!validTypes.includes(action.type)) {
      errors.push(`Invalid action type: ${action.type}`);
    }

    // Validate action-specific parameters
    switch (action.type) {
      case 'send_email':
      case 'reply_email':
        if (!action.params.to || (action.params.to as string[]).length === 0) {
          errors.push('Email requires at least one recipient');
        }
        if (!action.params.subject || (action.params.subject as string).trim() === '') {
          errors.push('Email requires a subject');
        }
        break;

      case 'schedule_meeting':
      case 'reschedule_meeting':
        if (!action.params.title || (action.params.title as string).trim() === '') {
          errors.push('Meeting requires a title');
        }
        if (!action.params.duration || (action.params.duration as number) <= 0) {
          errors.push('Meeting requires a valid duration');
        }
        break;

      case 'create_task':
        if (!action.params.description || (action.params.description as string).trim() === '') {
          errors.push('Task requires a description');
        }
        break;

      case 'set_reminder':
        if (!action.params.message || (action.params.message as string).trim() === '') {
          errors.push('Reminder requires a message');
        }
        if (!action.params.time) {
          errors.push('Reminder requires a time');
        }
        break;
    }

    return ok({
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private generateSummary(action: IAction): string {
    switch (action.type) {
      case 'send_email':
        return `Send email to ${(action.params.to as string[]).join(', ')}`;
      case 'schedule_meeting':
        return `Schedule meeting: ${action.params.title as string}`;
      case 'reschedule_meeting':
        return `Reschedule meeting: ${action.params.title as string}`;
      case 'cancel_meeting':
        return `Cancel meeting: ${action.params.title as string}`;
      case 'draft_email':
        return 'Draft a new email';
      case 'search_emails':
        return `Search emails: ${action.params.query as string}`;
      case 'create_task':
        return `Create task: ${action.params.description as string}`;
      case 'set_reminder':
        return `Set reminder: ${action.params.message as string}`;
      case 'reply_email':
        return `Reply to email`;
      case 'forward_email':
        return `Forward email`;
      default:
        return action.description;
    }
  }

  private getTargetResource(action: IAction): string | undefined {
    switch (action.type) {
      case 'send_email':
      case 'reply_email':
        return 'Email';
      case 'schedule_meeting':
      case 'reschedule_meeting':
      case 'cancel_meeting':
        return 'Calendar';
      case 'create_task':
        return 'Tasks';
      case 'set_reminder':
        return 'Reminders';
      default:
        return undefined;
    }
  }

  private getAffectedItems(action: IAction): string[] | undefined {
    const items: string[] = [];

    if (action.params.to) {
      (action.params.to as string[]).forEach(recipient => items.push(recipient));
    }

    if (action.params.attendees) {
      (action.params.attendees as string[]).forEach(attendee => items.push(attendee));
    }

    return items.length > 0 ? items : undefined;
  }

  private assessRisks(action: IAction): IActionPreview['risks'] {
    const risks: IActionPreview['risks'] = [];

    // High-risk actions
    if (action.riskLevel === 'high') {
      risks.push({
        level: 'high',
        description: 'This action cannot be easily undone',
        mitigation: 'Review carefully before confirming'
      });
    }

    // Email-specific risks
    if (action.type === 'send_email') {
      const recipientCount = (action.params.to as string[])?.length ?? 0;
      if (recipientCount > 10) {
        risks.push({
          level: 'medium',
          description: `Sending to ${recipientCount} recipients`,
          mitigation: 'Verify recipient list is correct'
        });
      }
    }

    // Meeting-specific risks
    if (action.type === 'cancel_meeting') {
      risks.push({
        level: 'medium',
        description: 'Meeting cancellation will notify all attendees',
        mitigation: 'Consider rescheduling instead'
      });
    }

    return risks.length > 0 ? risks : undefined;
  }

  private generateAlternatives(action: IAction): IActionPreview['alternatives'] {
    const alternatives: IActionPreview['alternatives'] = [];

    if (action.type === 'cancel_meeting') {
      alternatives.push({
        description: 'Reschedule the meeting instead',
        action: 'reschedule_meeting',
        params: action.params
      });
    }

    if (action.type === 'send_email') {
      alternatives.push({
        description: 'Save as draft instead',
        action: 'draft_email',
        params: action.params
      });
    }

    return alternatives.length > 0 ? alternatives : undefined;
  }

  private isEditable(action: IAction): boolean {
    // Most actions are editable before execution
    const nonEditableActions = ['search_emails', 'summarize_thread'];
    return !nonEditableActions.includes(action.type);
  }

  private getEditableFields(action: IAction): string[] | undefined {
    if (!this.isEditable(action)) {
      return undefined;
    }

    switch (action.type) {
      case 'send_email':
      case 'reply_email':
      case 'draft_email':
        return ['to', 'subject', 'body', 'cc', 'bcc'];
      case 'schedule_meeting':
      case 'reschedule_meeting':
        return ['title', 'duration', 'attendees', 'location'];
      case 'create_task':
        return ['description', 'priority', 'dueDate'];
      case 'set_reminder':
        return ['message', 'time'];
      default:
        return undefined;
    }
  }

  private getActionResult(action: IAction): unknown {
    switch (action.type) {
      case 'send_email':
        return {
          messageId: UUID(crypto.randomUUID()),
          sent: true,
          timestamp: Date.now()
        };
      case 'schedule_meeting':
        return {
          meetingId: UUID(crypto.randomUUID()),
          scheduled: true,
          timestamp: Date.now()
        };
      case 'create_task':
        return {
          taskId: UUID(crypto.randomUUID()),
          created: true,
          timestamp: Date.now()
        };
      default:
        return { success: true };
    }
  }
}
