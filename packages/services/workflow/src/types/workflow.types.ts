import { UserId } from '@tide/types';

/**
 * Workflow Types
 * Core type definitions for the workflow automation system
 */

// ============================================================================
// Workflow Definition Types
// ============================================================================

export type WorkflowId = string & { readonly __brand: 'WorkflowId' };
export type WorkflowExecutionId = string & { readonly __brand: 'WorkflowExecutionId' };
export type WorkflowStepId = string & { readonly __brand: 'WorkflowStepId' };

export type WorkflowStatus =
  | 'draft'
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'compensated';

export type StepType =
  | 'action'
  | 'decision'
  | 'parallel'
  | 'email'
  | 'calendar'
  | 'integration'
  | 'approval'
  | 'delay';

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description?: string;
  version: number;
  steps: WorkflowStep[];
  triggers?: WorkflowTrigger[];
  metadata?: Record<string, unknown>;
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: WorkflowStepId;
  name: string;
  type: StepType;
  config: StepConfig;

  // Execution control
  timeout?: number; // milliseconds
  retryPolicy?: RetryPolicy;

  // Flow control
  next?: WorkflowStepId | ConditionalTransition[];
  onSuccess?: WorkflowStepId;
  onFailure?: WorkflowStepId;

  // Compensation
  compensation?: CompensationConfig;

  // Metadata
  metadata?: Record<string, unknown>;
}

export interface StepConfig {
  handler?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, string>;
  conditions?: Condition[];
  parallel?: boolean;
  [key: string]: unknown;
}

export interface ConditionalTransition {
  condition: Condition;
  target: WorkflowStepId;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'exists';
  value: unknown;
}

export interface RetryPolicy {
  maxAttempts: number;
  delay: number; // milliseconds
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
}

export interface CompensationConfig {
  handler: string;
  inputs?: Record<string, unknown>;
  timeout?: number;
}

// ============================================================================
// Workflow Execution Types
// ============================================================================

export interface WorkflowExecution {
  id: WorkflowExecutionId;
  workflowId: WorkflowId;
  userId: UserId;

  // State
  status: WorkflowStatus;
  currentStep?: WorkflowStepId;
  context: WorkflowContext;

  // History
  history: ExecutionHistoryEntry[];

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;

  // Error handling
  error?: ExecutionError;
  retryCount: number;

  // Metadata
  metadata?: Record<string, unknown>;
}

export interface WorkflowContext {
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  stepResults: Map<WorkflowStepId, StepResult>;
  variables: Record<string, unknown>;
}

export interface ExecutionHistoryEntry {
  stepId: WorkflowStepId;
  timestamp: Date;
  status: StepStatus;
  result?: StepResult;
  error?: ExecutionError;
  duration?: number;
}

export interface StepResult {
  success: boolean;
  output?: unknown;
  error?: ExecutionError;
  metadata?: Record<string, unknown>;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  recoverable: boolean;
}

// ============================================================================
// Workflow Triggers
// ============================================================================

export type TriggerType =
  | 'manual'
  | 'scheduled'
  | 'event'
  | 'webhook'
  | 'pattern';

export interface WorkflowTrigger {
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
}

export interface TriggerConfig {
  // Scheduled triggers
  schedule?: string; // cron expression
  timezone?: string;

  // Event triggers
  eventType?: string;
  eventFilter?: Record<string, unknown>;

  // Webhook triggers
  webhookUrl?: string;
  webhookSecret?: string;

  // Pattern triggers
  patternId?: string;

  [key: string]: unknown;
}

// ============================================================================
// State Machine Types
// ============================================================================

export interface WorkflowState {
  id: WorkflowExecutionId;
  workflowId: WorkflowId;
  currentStep: WorkflowStepId;
  status: WorkflowStatus;
  context: WorkflowContext;
  history: ExecutionHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StateTransition {
  event: string;
  from: WorkflowStepId;
  to: WorkflowStepId;
  guard?: (context: WorkflowContext) => boolean | Promise<boolean>;
}

export interface StateMachineConfig {
  initialState: WorkflowStepId;
  states: Map<WorkflowStepId, StateDefinition>;
  transitions: Map<WorkflowStepId, StateTransition[]>;
}

export interface StateDefinition {
  id: WorkflowStepId;
  type: StepType;
  handler: StepHandler;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  compensation?: CompensationHandler;
}

export type StepHandler = (
  context: WorkflowContext,
  config: StepConfig
) => Promise<StepResult>;

export type CompensationHandler = (
  context: WorkflowContext,
  stepResult: StepResult
) => Promise<void>;

// ============================================================================
// DAG Types
// ============================================================================

export interface WorkflowDAG {
  nodes: Map<WorkflowStepId, DAGNode>;
  edges: Map<WorkflowStepId, WorkflowStepId[]>;
  entryPoint: WorkflowStepId;
  exitPoints: WorkflowStepId[];
}

export interface DAGNode {
  id: WorkflowStepId;
  step: WorkflowStep;
  dependencies: WorkflowStepId[];
  dependents: WorkflowStepId[];
  level: number; // For topological sorting
}

export interface ExecutionPlan {
  stages: ExecutionStage[];
  totalSteps: number;
  estimatedDuration?: number;
}

export interface ExecutionStage {
  stageNumber: number;
  steps: WorkflowStep[];
  parallel: boolean;
}

// ============================================================================
// Transaction Types (Saga Pattern)
// ============================================================================

export interface WorkflowTransaction {
  id: string;
  workflowExecutionId: WorkflowExecutionId;
  steps: TransactionStep[];
  status: 'active' | 'committed' | 'rolled_back';
  startedAt: Date;
  completedAt?: Date;
}

export interface TransactionStep {
  stepId: WorkflowStepId;
  status: 'pending' | 'executed' | 'compensated' | 'failed';
  executedAt?: Date;
  compensatedAt?: Date;
  result?: StepResult;
  compensationResult?: StepResult;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface WorkflowMetrics {
  workflowId: WorkflowId;
  executionCount: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  lastExecutedAt?: Date;
}

export interface StepMetrics {
  stepId: WorkflowStepId;
  executionCount: number;
  successRate: number;
  avgDuration: number;
  failureRate: number;
  commonErrors: Map<string, number>;
}
