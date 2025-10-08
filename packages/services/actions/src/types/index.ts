import type { UserId } from '@tide/types';

export type ActionType =
  | 'send_email'
  | 'schedule_meeting'
  | 'delegate_task'
  | 'decline_meeting'
  | 'archive_email'
  | 'send_reminder'
  | 'update_task'
  | 'reschedule_meeting'
  | 'forward_email'
  | 'create_task'
  | 'cancel_meeting';

export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed' | 'undone';

export interface Action {
  id: string;
  userId: UserId;
  type: ActionType;
  context: ActionContext;
  preview: string;
  confidence: number;
  requiresApproval: boolean;
  status: ActionStatus;
  executedAt?: Date;
  executionResult?: ExecutionResult;
  canUndo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionContext {
  targetId?: string; // Email ID, Event ID, Task ID, etc.
  targetType?: 'email' | 'event' | 'task';
  payload: Record<string, unknown>;
  reasoning?: string;
  originalData?: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
  undoData?: Record<string, unknown>; // Data needed to undo this action
}

export interface ActionSuggestion {
  type: ActionType;
  context: ActionContext;
  preview: string;
  confidence: number;
  requiresApproval: boolean;
  reasoning: string;
  estimatedTimeSaved?: number;
}

export interface CapabilityRule {
  condition: (context: ActionContext, userPreferences?: UserPreferences) => boolean;
  canExecuteAlone: boolean;
  requiresApproval: boolean;
  reasoning: string;
}

export interface UserPreferences {
  autonomyLevel: 'conservative' | 'balanced' | 'aggressive';
  trustedSenders?: string[];
  vipContacts?: string[];
  neverAutomateCategories?: string[];
  customRules?: CustomRule[];
}

export interface CustomRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow_autonomous' | 'require_approval' | 'never_suggest';
}

export interface UndoRequest {
  actionId: string;
  userId: UserId;
  reason?: string;
}

export interface ApprovalRequest {
  actionId: string;
  userId: UserId;
  approved: boolean;
  modifications?: Record<string, unknown>;
}
