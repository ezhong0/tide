import { logger } from '@tide/logger';
/**
 * Workflow Repository
 *
 * Handles persistence of workflow definitions and executions to PostgreSQL
 */
export class WorkflowRepository {
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Save workflow definition
     */
    async saveWorkflow(workflow) {
        const query = `
      INSERT INTO tide.workflows (
        id, name, description, version, definition, created_by, status, tags, category, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        definition = EXCLUDED.definition,
        updated_at = EXCLUDED.updated_at
    `;
        const values = [
            workflow.id,
            workflow.name,
            workflow.description || null,
            workflow.version,
            JSON.stringify(workflow),
            workflow.createdBy,
            'active',
            [],
            null,
            workflow.createdAt,
            workflow.updatedAt,
        ];
        try {
            await this.pool.query(query, values);
            logger.info({ workflowId: workflow.id }, 'Workflow saved');
        }
        catch (error) {
            logger.error({ error, workflowId: workflow.id }, 'Failed to save workflow');
            throw error;
        }
    }
    /**
     * Get workflow by ID
     */
    async getWorkflow(id) {
        const query = `
      SELECT * FROM tide.workflows
      WHERE id = $1
    `;
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            const workflow = typeof row.definition === 'string'
                ? JSON.parse(row.definition)
                : row.definition;
            return workflow;
        }
        catch (error) {
            logger.error({ error, workflowId: id }, 'Failed to get workflow');
            throw error;
        }
    }
    /**
     * Get all workflows for a user
     */
    async getWorkflowsByUser(userId) {
        const query = `
      SELECT * FROM tide.workflows
      WHERE created_by = $1 AND status != 'archived'
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query, [userId]);
            return result.rows.map(row => {
                const workflow = typeof row.definition === 'string'
                    ? JSON.parse(row.definition)
                    : row.definition;
                return workflow;
            });
        }
        catch (error) {
            logger.error({ error, userId }, 'Failed to get workflows by user');
            throw error;
        }
    }
    /**
     * Save workflow execution state
     */
    async saveExecution(execution) {
        const query = `
      INSERT INTO tide.workflow_executions (
        id, workflow_id, user_id, status, current_step, context, history,
        error_code, error_message, retry_count, started_at, completed_at,
        paused_at, duration_ms, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        current_step = EXCLUDED.current_step,
        context = EXCLUDED.context,
        history = EXCLUDED.history,
        error_code = EXCLUDED.error_code,
        error_message = EXCLUDED.error_message,
        retry_count = EXCLUDED.retry_count,
        completed_at = EXCLUDED.completed_at,
        paused_at = EXCLUDED.paused_at,
        duration_ms = EXCLUDED.duration_ms,
        updated_at = EXCLUDED.updated_at
    `;
        // Calculate duration if completed
        let durationMs = null;
        if (execution.status === 'completed' && execution.createdAt) {
            durationMs = new Date().getTime() - execution.createdAt.getTime();
        }
        const values = [
            execution.id,
            execution.workflowId,
            null, // user_id - extract from context if needed
            execution.status,
            execution.currentStep || null,
            JSON.stringify(execution.context),
            JSON.stringify(execution.history),
            null, // error_code
            null, // error_message
            0, // retry_count
            execution.status === 'running' ? new Date() : null,
            execution.status === 'completed' ? new Date() : null,
            execution.status === 'paused' ? new Date() : null,
            durationMs,
            execution.createdAt,
            execution.updatedAt,
        ];
        try {
            await this.pool.query(query, values);
            logger.debug({ executionId: execution.id }, 'Execution saved');
        }
        catch (error) {
            logger.error({ error, executionId: execution.id }, 'Failed to save execution');
            throw error;
        }
    }
    /**
     * Load workflow execution state
     */
    async loadExecution(id) {
        const query = `
      SELECT * FROM tide.workflow_executions
      WHERE id = $1
    `;
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            const state = {
                id: row.id,
                workflowId: row.workflow_id,
                currentStep: row.current_step,
                status: row.status,
                context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
                history: typeof row.history === 'string' ? JSON.parse(row.history) : row.history,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            };
            // Convert stepResults from object to Map
            if (state.context && state.context.stepResults) {
                if (Array.isArray(state.context.stepResults)) {
                    state.context.stepResults = new Map(Object.entries(state.context.stepResults));
                }
                else if (typeof state.context.stepResults === 'object') {
                    state.context.stepResults = new Map(Object.entries(state.context.stepResults));
                }
            }
            return state;
        }
        catch (error) {
            logger.error({ error, executionId: id }, 'Failed to load execution');
            throw error;
        }
    }
    /**
     * Update workflow execution
     */
    async updateExecution(execution) {
        await this.saveExecution(execution);
    }
    /**
     * Delete execution
     */
    async deleteExecution(id) {
        const query = `
      DELETE FROM tide.workflow_executions
      WHERE id = $1
    `;
        try {
            await this.pool.query(query, [id]);
            logger.info({ executionId: id }, 'Execution deleted');
        }
        catch (error) {
            logger.error({ error, executionId: id }, 'Failed to delete execution');
            throw error;
        }
    }
    /**
     * Get executions by workflow ID
     */
    async getExecutionsByWorkflow(workflowId, limit = 100) {
        const query = `
      SELECT * FROM tide.workflow_executions
      WHERE workflow_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
        try {
            const result = await this.pool.query(query, [workflowId, limit]);
            return result.rows.map(row => ({
                id: row.id,
                workflowId: row.workflow_id,
                currentStep: row.current_step,
                status: row.status,
                context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
                history: typeof row.history === 'string' ? JSON.parse(row.history) : row.history,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            }));
        }
        catch (error) {
            logger.error({ error, workflowId }, 'Failed to get executions by workflow');
            throw error;
        }
    }
    /**
     * Get active (running/paused) executions
     */
    async getActiveExecutions() {
        const query = `
      SELECT * FROM tide.workflow_executions
      WHERE status IN ('running', 'paused')
      ORDER BY created_at DESC
    `;
        try {
            const result = await this.pool.query(query);
            return result.rows.map(row => ({
                id: row.id,
                workflowId: row.workflow_id,
                currentStep: row.current_step,
                status: row.status,
                context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
                history: typeof row.history === 'string' ? JSON.parse(row.history) : row.history,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            }));
        }
        catch (error) {
            logger.error({ error }, 'Failed to get active executions');
            throw error;
        }
    }
}
/**
 * PostgreSQL State Persistence for WorkflowStateMachine
 */
export class PostgreSQLStatePersistence {
    constructor(repository) {
        this.repository = repository;
    }
    async save(state) {
        await this.repository.saveExecution(state);
    }
    async load(id) {
        return await this.repository.loadExecution(id);
    }
    async update(state) {
        await this.repository.updateExecution(state);
    }
    async delete(id) {
        await this.repository.deleteExecution(id);
    }
}
//# sourceMappingURL=workflow-repository.js.map