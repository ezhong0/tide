import { UserId } from '@tide/types';
import { Task, TaskId, TaskRequest, Subtask } from '../types/task.types.js';
import { TaskRepository } from '../persistence/task-repository.js';
/**
 * Task Management Engine
 *
 * Intelligent task engine with smart prioritization, auto-decomposition,
 * and dependency management
 */
export declare class TaskEngine {
    private repository;
    private prioritizer;
    private decomposer;
    constructor(repository: TaskRepository, prioritizer: TaskPrioritizer, decomposer: TaskDecomposer);
    /**
     * Create a new task with smart defaults
     */
    createTask(request: TaskRequest): Promise<Task>;
    /**
     * Decompose complex task into subtasks
     */
    private decomposeTask;
    /**
     * Get ready tasks (no blocking dependencies)
     */
    getReadyTasks(userId: UserId): Promise<Task[]>;
    /**
     * Execute tasks in priority order
     */
    executeTasks(userId: UserId): Promise<ExecutionReport>;
    /**
     * Update task priority dynamically
     */
    updateTaskPriority(taskId: TaskId): Promise<number>;
    /**
     * Check if task is still relevant
     */
    private isStillRelevant;
    /**
     * Notify tasks that depend on completed task
     */
    private notifyDependentTasks;
    /**
     * Assess task complexity
     */
    private assessComplexity;
    /**
     * Estimate task duration
     */
    private estimateTime;
    /**
     * Auto-tag task based on content
     */
    private autoTag;
    /**
     * Generate ID
     */
    private generateId;
}
/**
 * Task Prioritizer
 *
 * Implements smart priority calculation using multiple factors
 */
export declare class TaskPrioritizer {
    /**
     * Calculate initial priority for new task
     */
    calculate(request: TaskRequest): Promise<number>;
    /**
     * Calculate dynamic priority (adjusts over time)
     */
    calculateDynamicPriority(task: Task): Promise<number>;
    /**
     * Order tasks by priority
     */
    order(tasks: Task[]): Promise<Task[]>;
    /**
     * Calculate urgency (time-based)
     */
    private calculateUrgency;
    /**
     * Calculate importance (impact-based)
     */
    private calculateImportance;
    /**
     * Calculate impact
     */
    private calculateImpact;
    /**
     * Calculate effort (inverse priority - lower effort = higher priority)
     */
    private calculateEffort;
    /**
     * Calculate dependency score
     */
    private calculateDependencyScore;
}
/**
 * Task Decomposer
 *
 * Breaks down complex tasks into smaller subtasks
 */
export declare class TaskDecomposer {
    /**
     * Decompose task into subtasks
     */
    decompose(task: Task): Promise<Subtask[]>;
    /**
     * Extract steps from description
     */
    private extractSteps;
}
export interface TaskResult {
    taskId: TaskId;
    success: boolean;
    error?: string;
    completedAt: Date;
}
export interface ExecutionReport {
    executed: TaskResult[];
    failed: TaskResult[];
    skipped: number;
}
//# sourceMappingURL=task-engine.d.ts.map