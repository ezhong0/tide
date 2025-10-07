import { Pool } from 'pg';
import { WorkflowDefinition, WorkflowId, WorkflowExecutionId, WorkflowState } from '../types';
import { UserId } from '@tide/types';
/**
 * Workflow Repository
 *
 * Handles persistence of workflow definitions and executions to PostgreSQL
 */
export declare class WorkflowRepository {
    private pool;
    constructor(pool: Pool);
    /**
     * Save workflow definition
     */
    saveWorkflow(workflow: WorkflowDefinition): Promise<void>;
    /**
     * Get workflow by ID
     */
    getWorkflow(id: WorkflowId): Promise<WorkflowDefinition | null>;
    /**
     * Get all workflows for a user
     */
    getWorkflowsByUser(userId: UserId): Promise<WorkflowDefinition[]>;
    /**
     * Save workflow execution state
     */
    saveExecution(execution: WorkflowState): Promise<void>;
    /**
     * Load workflow execution state
     */
    loadExecution(id: WorkflowExecutionId): Promise<WorkflowState | null>;
    /**
     * Update workflow execution
     */
    updateExecution(execution: WorkflowState): Promise<void>;
    /**
     * Delete execution
     */
    deleteExecution(id: WorkflowExecutionId): Promise<void>;
    /**
     * Get executions by workflow ID
     */
    getExecutionsByWorkflow(workflowId: WorkflowId, limit?: number): Promise<WorkflowState[]>;
    /**
     * Get active (running/paused) executions
     */
    getActiveExecutions(): Promise<WorkflowState[]>;
}
/**
 * PostgreSQL State Persistence for WorkflowStateMachine
 */
export declare class PostgreSQLStatePersistence {
    private repository;
    constructor(repository: WorkflowRepository);
    save(state: WorkflowState): Promise<void>;
    load(id: string): Promise<WorkflowState | null>;
    update(state: WorkflowState): Promise<void>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=workflow-repository.d.ts.map