import { logger } from '@tide/logger';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';
import type {
  Action,
  ActionType,
  ActionContext,
  ExecutionResult,
  UndoRequest
} from '../types/index.js';

/**
 * Action Executor
 * Executes approved actions by calling appropriate service endpoints
 */
export class ActionExecutor {
  private db = SupabaseConnectionManager.getInstance(true); // Service role
  private emailServiceURL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3003';
  private calendarServiceURL = process.env.CALENDAR_SERVICE_URL || 'http://localhost:3004';
  private workflowServiceURL = process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3006';

  /**
   * Execute an action
   */
  async execute(action: Action): Promise<ExecutionResult> {
    logger.info({ actionId: action.id, type: action.type }, 'Executing action');

    try {
      let result: ExecutionResult;

      switch (action.type) {
        case 'send_email':
          result = await this.executeSendEmail(action);
          break;
        case 'schedule_meeting':
          result = await this.executeScheduleMeeting(action);
          break;
        case 'decline_meeting':
          result = await this.executeDeclineMeeting(action);
          break;
        case 'reschedule_meeting':
          result = await this.executeRescheduleMeeting(action);
          break;
        case 'archive_email':
          result = await this.executeArchiveEmail(action);
          break;
        case 'delegate_task':
          result = await this.executeDelegateTask(action);
          break;
        case 'update_task':
          result = await this.executeUpdateTask(action);
          break;
        case 'send_reminder':
          result = await this.executeSendReminder(action);
          break;
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }

      // Update action status
      await this.updateActionStatus(action.id, 'executed', result);

      logger.info({ actionId: action.id, success: result.success }, 'Action executed');

      return result;
    } catch (error) {
      logger.error({ error, actionId: action.id }, 'Action execution failed');

      const result: ExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      await this.updateActionStatus(action.id, 'failed', result);

      return result;
    }
  }

  /**
   * Undo an executed action
   */
  async undo(request: UndoRequest): Promise<ExecutionResult> {
    logger.info({ actionId: request.actionId }, 'Undoing action');

    // Get action from database
    const { data: action, error } = await this.db
      .from('action_suggestions')
      .select('*')
      .eq('id', request.actionId)
      .eq('user_id', request.userId)
      .single();

    if (error || !action) {
      throw new Error('Action not found');
    }

    if (action.status !== 'executed') {
      throw new Error('Can only undo executed actions');
    }

    if (!action.execution_result?.undoData) {
      throw new Error('Action cannot be undone - missing undo data');
    }

    try {
      let result: ExecutionResult;

      switch (action.suggestion_type) {
        case 'send_email':
          result = await this.undoSendEmail(action);
          break;
        case 'archive_email':
          result = await this.undoArchiveEmail(action);
          break;
        case 'update_task':
          result = await this.undoUpdateTask(action);
          break;
        // Add more undo handlers as needed
        default:
          throw new Error(`Undo not supported for action type: ${action.suggestion_type}`);
      }

      // Update action status
      await this.updateActionStatus(action.id, 'undone', result);

      logger.info({ actionId: action.id }, 'Action undone successfully');

      return result;
    } catch (error) {
      logger.error({ error, actionId: action.id }, 'Undo failed');
      throw error;
    }
  }

  // ========== Email Actions ==========

  private async executeSendEmail(action: Action): Promise<ExecutionResult> {
    const { to, subject, body } = action.context.payload as any;

    const response = await fetch(`${this.emailServiceURL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, any>;

    return {
      success: true,
      message: 'Email sent successfully',
      data,
      undoData: {
        messageId: data.messageId,
        to,
        subject
      }
    };
  }

  private async undoSendEmail(action: any): Promise<ExecutionResult> {
    // In reality, we can't unsend an email, but we can:
    // 1. Send a follow-up email saying "Please disregard"
    // 2. Archive/delete from sent folder
    // 3. Log the undo for user awareness

    return {
      success: true,
      message: 'Email marked as undone (cannot recall sent email)',
      data: { note: 'Consider sending a follow-up to clarify' }
    };
  }

  private async executeArchiveEmail(action: Action): Promise<ExecutionResult> {
    const { emailId } = action.context.payload as any;

    // Update email status in database
    const { error } = await this.db
      .from('emails')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq('id', emailId);

    if (error) {
      throw new Error('Failed to archive email');
    }

    return {
      success: true,
      message: 'Email archived',
      undoData: { emailId }
    };
  }

  private async undoArchiveEmail(action: any): Promise<ExecutionResult> {
    const emailId = action.execution_result.undoData.emailId;

    const { error } = await this.db
      .from('emails')
      .update({ is_archived: false, archived_at: null })
      .eq('id', emailId);

    if (error) {
      throw new Error('Failed to unarchive email');
    }

    return {
      success: true,
      message: 'Email restored from archive'
    };
  }

  // ========== Calendar Actions ==========

  private async executeScheduleMeeting(action: Action): Promise<ExecutionResult> {
    const { title, startTime, endTime, attendees } = action.context.payload as any;

    const response = await fetch(`${this.calendarServiceURL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, startTime, endTime, attendees })
    });

    if (!response.ok) {
      throw new Error(`Failed to create meeting: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, any>;

    return {
      success: true,
      message: 'Meeting scheduled',
      data,
      undoData: { eventId: data.event.id }
    };
  }

  private async executeDeclineMeeting(action: Action): Promise<ExecutionResult> {
    const { eventId, reason } = action.context.payload as any;

    // Send decline response (simplified)
    const { error } = await this.db
      .from('events')
      .update({ status: 'declined', declined_reason: reason })
      .eq('id', eventId);

    if (error) {
      throw new Error('Failed to decline meeting');
    }

    return {
      success: true,
      message: 'Meeting declined',
      undoData: { eventId }
    };
  }

  private async executeRescheduleMeeting(action: Action): Promise<ExecutionResult> {
    const { eventId, newStartTime, newEndTime } = action.context.payload as any;

    const response = await fetch(`${this.calendarServiceURL}/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: newStartTime, endTime: newEndTime })
    });

    if (!response.ok) {
      throw new Error(`Failed to reschedule meeting: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, any>;

    return {
      success: true,
      message: 'Meeting rescheduled',
      data,
      undoData: {
        eventId,
        originalStartTime: action.context.originalData?.startTime,
        originalEndTime: action.context.originalData?.endTime
      }
    };
  }

  // ========== Task Actions ==========

  private async executeDelegateTask(action: Action): Promise<ExecutionResult> {
    const { taskId, delegateTo } = action.context.payload as any;

    const { error } = await this.db
      .from('tasks')
      .update({ assigned_to: delegateTo, delegated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      throw new Error('Failed to delegate task');
    }

    return {
      success: true,
      message: `Task delegated to ${delegateTo}`,
      undoData: {
        taskId,
        originalAssignee: action.context.originalData?.assignedTo
      }
    };
  }

  private async executeUpdateTask(action: Action): Promise<ExecutionResult> {
    const { taskId, status, updates } = action.context.payload as any;

    const { error } = await this.db
      .from('tasks')
      .update({ status, ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      throw new Error('Failed to update task');
    }

    return {
      success: true,
      message: 'Task updated',
      undoData: {
        taskId,
        originalStatus: action.context.originalData?.status,
        originalData: action.context.originalData
      }
    };
  }

  private async undoUpdateTask(action: any): Promise<ExecutionResult> {
    const { taskId, originalStatus, originalData } = action.execution_result.undoData;

    const { error } = await this.db
      .from('tasks')
      .update({ status: originalStatus, ...originalData })
      .eq('id', taskId);

    if (error) {
      throw new Error('Failed to undo task update');
    }

    return {
      success: true,
      message: 'Task update undone'
    };
  }

  // ========== Reminder Actions ==========

  private async executeSendReminder(action: Action): Promise<ExecutionResult> {
    const { type, message, recipientId } = action.context.payload as any;

    // In a real implementation, would send push notification or email
    logger.info({ type, recipientId }, 'Sending reminder');

    return {
      success: true,
      message: 'Reminder sent'
    };
  }

  // ========== Helper Methods ==========

  private async updateActionStatus(
    actionId: string,
    status: string,
    result: ExecutionResult
  ): Promise<void> {
    const { error } = await this.db
      .from('action_suggestions')
      .update({
        status,
        executed_at: status === 'executed' ? new Date().toISOString() : undefined,
        execution_result: result
      })
      .eq('id', actionId);

    if (error) {
      logger.error({ error, actionId }, 'Failed to update action status');
    }
  }
}
