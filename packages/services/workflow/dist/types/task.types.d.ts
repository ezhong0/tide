import { UserId } from '@tide/types';
/**
 * Task Types
 * Type definitions for intelligent task management system
 */
export type TaskId = string & {
    readonly __brand: 'TaskId';
};
export type SubtaskId = string & {
    readonly __brand: 'SubtaskId';
};
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled' | 'deferred';
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
    title: string;
    description?: string;
    priority: number;
    dueDate?: Date;
    estimatedDuration?: number;
    assignee?: UserId;
    tags: string[];
    project?: string;
    parentTaskId?: TaskId;
    status: TaskStatus;
    progress: number;
    complexity?: number;
    metadata: Record<string, unknown>;
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
    estimatedTime?: number;
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
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
}
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
    dependencies: number[];
    estimatedTime: number;
    assignee?: UserId;
}
export interface PriorityFactors {
    urgency: number;
    importance: number;
    impact: number;
    effort: number;
    dependencies: number;
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
    availableTime?: number;
    skills?: string[];
    workload?: number;
}
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
export interface TaskExecutionRequest {
    userId: UserId;
    maxTasks?: number;
    timeAvailable?: number;
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
export interface TaskMetrics {
    userId: UserId;
    period: {
        start: Date;
        end: Date;
    };
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgCompletionTime: number;
    totalTimeSpent: number;
    avgPriority: number;
    highPriorityCompleted: number;
    estimationAccuracy: number;
    onTimeRate: number;
}
export interface TaskInsight {
    type: 'bottleneck' | 'overdue' | 'underestimated' | 'pattern' | 'suggestion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    taskIds: TaskId[];
    suggestion?: string;
    impact?: number;
}
//# sourceMappingURL=task.types.d.ts.map