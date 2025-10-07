import { UserId } from '@tide/types';

/**
 * Task Types
 * Type definitions for intelligent task management system
 */

// ============================================================================
// Task Definition Types
// ============================================================================

export type TaskId = string & { readonly __brand: 'TaskId' };
export type SubtaskId = string & { readonly __brand: 'SubtaskId' };

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'deferred';

export interface TaskPriority {
  urgency: number;
  importance: number;
  impact: number;
  effort: number;
  dependencies: number;
}

export interface Task {
  id: TaskId;
  userId: UserId;

  // Content
  title: string;
  description?: string;

  // Scheduling
  priority: number; // 0.0 - 1.0 (calculated from TaskPriority)
  dueDate?: Date;
  estimatedDuration?: number; // minutes

  // Assignment
  assignee?: UserId;

  // Organization
  tags: string[];
  project?: string;

  // Parent task relationship
  parentTaskId?: TaskId;

  // Status
  status: TaskStatus;
  progress: number; // 0-100

  // Metadata
  complexity?: number; // 0.0 - 1.0
  metadata: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Subtask {
  id: SubtaskId;
  parentId: TaskId;
  title: string;
  description?: string;
  order: number;
  estimatedTime?: number; // minutes
  assignee?: UserId;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TaskDependency {
  id?: string;
  taskId: TaskId;
  dependsOnTaskId: TaskId;
  type: 'blocks' | 'relates_to' | 'duplicates';
}


export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0-6
  dayOfMonth?: number;
  endDate?: Date;
}

// ============================================================================
// Task Creation Types
// ============================================================================

export interface TaskRequest {
  userId: UserId;
  title: string;
  description?: string;
  dueDate?: Date;
  assignee?: UserId;
  dependencies?: TaskId[];
  tags?: string[];
  project?: string;
  metadata?: Record<string, unknown>;
}

export interface TaskDecomposition {
  originalTask: Task;
  subtasks: SubtaskDecomposition[];
  estimatedTotalTime: number;
  complexity: number;
}

export interface SubtaskDecomposition {
  title: string;
  description: string;
  order: number;
  dependencies: number[]; // indices in subtasks array
  estimatedTime: number;
  assignee?: UserId;
}

// ============================================================================
// Task Prioritization Types
// ============================================================================

export interface PriorityFactors {
  urgency: number; // 0.0 - 1.0
  importance: number; // 0.0 - 1.0
  impact: number; // 0.0 - 1.0
  effort: number; // 0.0 - 1.0 (inverse - lower effort = higher score)
  dependencies: number; // 0.0 - 1.0 (more tasks blocked = higher score)
}

export interface DynamicPriorityContext {
  currentTime: Date;
  userContext?: UserContext;
  blockingCount?: number;
  timeUntilDue?: number;
}

export interface UserContext {
  currentTask?: TaskId;
  focusTime: boolean;
  availableTime?: number; // minutes
  skills?: string[];
  workload?: number; // 0.0 - 1.0
}

// ============================================================================
// Task Dependency Types
// ============================================================================

export interface DependencyGraph {
  nodes: Map<TaskId, DependencyNode>;
  edges: Map<TaskId, TaskId[]>;
}

export interface DependencyNode {
  taskId: TaskId;
  dependencies: TaskId[];
  dependents: TaskId[];
  level: number;
  status: TaskStatus;
}

export interface DependencyValidation {
  valid: boolean;
  errors: DependencyError[];
  warnings: string[];
}

export interface DependencyError {
  type: 'circular' | 'missing' | 'invalid_status';
  taskIds: TaskId[];
  message: string;
}

// ============================================================================
// Task Execution Types
// ============================================================================

export interface TaskExecutionRequest {
  userId: UserId;
  maxTasks?: number;
  timeAvailable?: number; // minutes
  filters?: TaskFilters;
}

export interface TaskFilters {
  status?: TaskStatus[];
  tags?: string[];
  project?: string;
  dueBy?: Date;
  priority?: {
    min?: number;
    max?: number;
  };
}

export interface TaskExecutionResult {
  taskId: TaskId;
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
  completedAt: Date;
}

export interface ExecutionReport {
  executed: TaskExecutionResult[];
  failed: TaskExecutionResult[];
  skipped: number;
  totalDuration: number;
  summary: {
    successRate: number;
    avgDuration: number;
    tasksCompleted: number;
  };
}

// ============================================================================
// Task Scheduling Types
// ============================================================================

export interface TaskSchedule {
  taskId: TaskId;
  scheduledFor: Date;
  estimatedDuration: number;
  priority: TaskPriority;
  constraints?: ScheduleConstraints;
}

export interface ScheduleConstraints {
  mustStartBy?: Date;
  mustFinishBy?: Date;
  requiredResources?: string[];
  preferredTimeSlots?: TimeSlot[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  type: 'focus' | 'meeting' | 'flexible' | 'break';
}

export interface ScheduleSuggestion {
  taskId: TaskId;
  suggestedStart: Date;
  suggestedEnd: Date;
  confidence: number;
  reasoning: string[];
}

// ============================================================================
// Task Analytics Types
// ============================================================================

export interface TaskMetrics {
  userId: UserId;
  period: { start: Date; end: Date };

  // Completion metrics
  totalTasks: number;
  completedTasks: number;
  completionRate: number;

  // Time metrics
  avgCompletionTime: number;
  totalTimeSpent: number;

  // Priority metrics
  avgPriority: number;
  highPriorityCompleted: number;

  // Accuracy metrics
  estimationAccuracy: number; // How close estimates were to actual
  onTimeRate: number; // % completed by due date
}

export interface TaskInsight {
  type: 'bottleneck' | 'overdue' | 'underestimated' | 'pattern' | 'suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  taskIds: TaskId[];
  suggestion?: string;
  impact?: number;
}
