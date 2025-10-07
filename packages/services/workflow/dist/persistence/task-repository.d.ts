import { Pool } from 'pg';
import { UserId } from '@tide/types';
import { Task, TaskId, TaskStatus, Subtask, TaskDependency } from '../types/task.types';
/**
 * Task Repository
 *
 * Handles persistence of tasks, subtasks, and dependencies to PostgreSQL
 */
export declare class TaskRepository {
    private pool;
    constructor(pool: Pool);
    /**
     * Create a new task
     */
    createTask(task: Task): Promise<void>;
    /**
     * Get task by ID
     */
    getTask(id: TaskId): Promise<Task | null>;
    /**
     * Get tasks by user
     */
    getTasksByUser(userId: UserId, filters?: TaskFilters): Promise<Task[]>;
    /**
     * Update task
     */
    updateTask(task: Task): Promise<void>;
    /**
     * Delete task
     */
    deleteTask(id: TaskId): Promise<void>;
    /**
     * Create subtask
     */
    createSubtask(subtask: Subtask): Promise<void>;
    /**
     * Get subtasks by parent task
     */
    getSubtasksByParent(parentId: TaskId): Promise<Subtask[]>;
    /**
     * Add task dependency
     */
    addDependency(dependency: TaskDependency): Promise<void>;
    /**
     * Get task dependencies
     */
    getTaskDependencies(taskId: TaskId): Promise<TaskDependency[]>;
    /**
     * Get tasks that depend on this task
     */
    getDependentTasks(taskId: TaskId): Promise<TaskId[]>;
    /**
     * Get ready tasks (no blocking dependencies)
     */
    getReadyTasks(userId: UserId): Promise<Task[]>;
    /**
     * Map database row to Task
     */
    private mapRowToTask;
    /**
     * Map database row to Subtask
     */
    private mapRowToSubtask;
    /**
     * Generate UUID
     */
    private generateId;
}
export interface TaskFilters {
    status?: TaskStatus;
    project?: string;
    assignee?: UserId;
    limit?: number;
}
//# sourceMappingURL=task-repository.d.ts.map