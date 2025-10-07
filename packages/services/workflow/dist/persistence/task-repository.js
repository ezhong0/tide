"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const logger_1 = require("@tide/logger");
/**
 * Task Repository
 *
 * Handles persistence of tasks, subtasks, and dependencies to PostgreSQL
 */
class TaskRepository {
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Create a new task
     */
    async createTask(task) {
        const query = `
      INSERT INTO tide.tasks (
        id, user_id, title, description, priority, due_date, estimated_duration_minutes,
        assignee, tags, project, status, progress, parent_task_id, complexity, metadata,
        created_at, updated_at, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `;
        const values = [
            task.id,
            task.userId,
            task.title,
            task.description || null,
            task.priority,
            task.dueDate || null,
            task.estimatedDuration || null,
            task.assignee || null,
            task.tags || [],
            task.project || null,
            task.status,
            task.progress || 0,
            task.parentTaskId || null,
            task.complexity || null,
            JSON.stringify(task.metadata || {}),
            task.createdAt,
            task.updatedAt,
            task.startedAt || null,
            task.completedAt || null,
        ];
        try {
            await this.pool.query(query, values);
            logger_1.logger.info({ taskId: task.id }, 'Task created');
        }
        catch (error) {
            logger_1.logger.error({ error, taskId: task.id }, 'Failed to create task');
            throw error;
        }
    }
    /**
     * Get task by ID
     */
    async getTask(id) {
        const query = `
      SELECT * FROM tide.tasks
      WHERE id = $1
    `;
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return this.mapRowToTask(result.rows[0]);
        }
        catch (error) {
            logger_1.logger.error({ error, taskId: id }, 'Failed to get task');
            throw error;
        }
    }
    /**
     * Get tasks by user
     */
    async getTasksByUser(userId, filters) {
        let query = `
      SELECT * FROM tide.tasks
      WHERE user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters?.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }
        if (filters?.project) {
            query += ` AND project = $${paramIndex}`;
            params.push(filters.project);
            paramIndex++;
        }
        if (filters?.assignee) {
            query += ` AND assignee = $${paramIndex}`;
            params.push(filters.assignee);
            paramIndex++;
        }
        query += ` ORDER BY priority DESC, due_date ASC NULLS LAST`;
        if (filters?.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
        }
        try {
            const result = await this.pool.query(query, params);
            return result.rows.map(row => this.mapRowToTask(row));
        }
        catch (error) {
            logger_1.logger.error({ error, userId }, 'Failed to get tasks by user');
            throw error;
        }
    }
    /**
     * Update task
     */
    async updateTask(task) {
        const query = `
      UPDATE tide.tasks
      SET title = $2,
          description = $3,
          priority = $4,
          due_date = $5,
          estimated_duration_minutes = $6,
          assignee = $7,
          tags = $8,
          project = $9,
          status = $10,
          progress = $11,
          complexity = $12,
          metadata = $13,
          updated_at = $14,
          started_at = $15,
          completed_at = $16
      WHERE id = $1
    `;
        const values = [
            task.id,
            task.title,
            task.description || null,
            task.priority,
            task.dueDate || null,
            task.estimatedDuration || null,
            task.assignee || null,
            task.tags || [],
            task.project || null,
            task.status,
            task.progress || 0,
            task.complexity || null,
            JSON.stringify(task.metadata || {}),
            task.updatedAt,
            task.startedAt || null,
            task.completedAt || null,
        ];
        try {
            await this.pool.query(query, values);
            logger_1.logger.debug({ taskId: task.id }, 'Task updated');
        }
        catch (error) {
            logger_1.logger.error({ error, taskId: task.id }, 'Failed to update task');
            throw error;
        }
    }
    /**
     * Delete task
     */
    async deleteTask(id) {
        const query = `
      DELETE FROM tide.tasks
      WHERE id = $1
    `;
        try {
            await this.pool.query(query, [id]);
            logger_1.logger.info({ taskId: id }, 'Task deleted');
        }
        catch (error) {
            logger_1.logger.error({ error, taskId: id }, 'Failed to delete task');
            throw error;
        }
    }
    /**
     * Create subtask
     */
    async createSubtask(subtask) {
        const query = `
      INSERT INTO tide.subtasks (
        id, parent_id, title, description, order_index, estimated_time_minutes,
        assignee, status, created_at, updated_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
        const values = [
            subtask.id,
            subtask.parentId,
            subtask.title,
            subtask.description || null,
            subtask.order,
            subtask.estimatedTime || null,
            subtask.assignee || null,
            subtask.status,
            subtask.createdAt,
            subtask.updatedAt,
            subtask.completedAt || null,
        ];
        try {
            await this.pool.query(query, values);
            logger_1.logger.debug({ subtaskId: subtask.id }, 'Subtask created');
        }
        catch (error) {
            logger_1.logger.error({ error, subtaskId: subtask.id }, 'Failed to create subtask');
            throw error;
        }
    }
    /**
     * Get subtasks by parent task
     */
    async getSubtasksByParent(parentId) {
        const query = `
      SELECT * FROM tide.subtasks
      WHERE parent_id = $1
      ORDER BY order_index ASC
    `;
        try {
            const result = await this.pool.query(query, [parentId]);
            return result.rows.map(row => this.mapRowToSubtask(row));
        }
        catch (error) {
            logger_1.logger.error({ error, parentId }, 'Failed to get subtasks');
            throw error;
        }
    }
    /**
     * Add task dependency
     */
    async addDependency(dependency) {
        const query = `
      INSERT INTO tide.task_dependencies (
        id, task_id, depends_on_task_id, dependency_type, created_at
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (task_id, depends_on_task_id) DO NOTHING
    `;
        const values = [
            this.generateId(),
            dependency.taskId,
            dependency.dependsOnTaskId,
            dependency.type || 'blocks',
            new Date(),
        ];
        try {
            await this.pool.query(query, values);
            logger_1.logger.debug({ dependency }, 'Dependency added');
        }
        catch (error) {
            logger_1.logger.error({ error, dependency }, 'Failed to add dependency');
            throw error;
        }
    }
    /**
     * Get task dependencies
     */
    async getTaskDependencies(taskId) {
        const query = `
      SELECT * FROM tide.task_dependencies
      WHERE task_id = $1
    `;
        try {
            const result = await this.pool.query(query, [taskId]);
            return result.rows.map(row => ({
                id: row.id,
                taskId: row.task_id,
                dependsOnTaskId: row.depends_on_task_id,
                type: row.dependency_type,
            }));
        }
        catch (error) {
            logger_1.logger.error({ error, taskId }, 'Failed to get task dependencies');
            throw error;
        }
    }
    /**
     * Get tasks that depend on this task
     */
    async getDependentTasks(taskId) {
        const query = `
      SELECT task_id FROM tide.task_dependencies
      WHERE depends_on_task_id = $1
    `;
        try {
            const result = await this.pool.query(query, [taskId]);
            return result.rows.map(row => row.task_id);
        }
        catch (error) {
            logger_1.logger.error({ error, taskId }, 'Failed to get dependent tasks');
            throw error;
        }
    }
    /**
     * Get ready tasks (no blocking dependencies)
     */
    async getReadyTasks(userId) {
        const query = `
      SELECT t.* FROM tide.tasks t
      WHERE t.user_id = $1
        AND t.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM tide.task_dependencies td
          JOIN tide.tasks dt ON td.depends_on_task_id = dt.id
          WHERE td.task_id = t.id
            AND td.dependency_type = 'blocks'
            AND dt.status != 'completed'
        )
      ORDER BY t.priority DESC, t.due_date ASC NULLS LAST
    `;
        try {
            const result = await this.pool.query(query, [userId]);
            return result.rows.map(row => this.mapRowToTask(row));
        }
        catch (error) {
            logger_1.logger.error({ error, userId }, 'Failed to get ready tasks');
            throw error;
        }
    }
    /**
     * Map database row to Task
     */
    mapRowToTask(row) {
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            priority: parseFloat(row.priority),
            dueDate: row.due_date ? new Date(row.due_date) : undefined,
            estimatedDuration: row.estimated_duration_minutes,
            assignee: row.assignee,
            tags: row.tags || [],
            project: row.project,
            status: row.status,
            progress: row.progress || 0,
            parentTaskId: row.parent_task_id,
            complexity: row.complexity ? parseFloat(row.complexity) : undefined,
            metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            startedAt: row.started_at ? new Date(row.started_at) : undefined,
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        };
    }
    /**
     * Map database row to Subtask
     */
    mapRowToSubtask(row) {
        return {
            id: row.id,
            parentId: row.parent_id,
            title: row.title,
            description: row.description,
            order: row.order_index,
            estimatedTime: row.estimated_time_minutes,
            assignee: row.assignee,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        };
    }
    /**
     * Generate UUID
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.TaskRepository = TaskRepository;
//# sourceMappingURL=task-repository.js.map