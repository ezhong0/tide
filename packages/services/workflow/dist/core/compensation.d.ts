import { WorkflowTransaction, WorkflowExecutionId, WorkflowStepId, StepResult, CompensationHandler, WorkflowContext } from '../types/index.js';
/**
 * Compensation Manager
 *
 * Implements the Saga pattern for managing distributed transactions.
 * Features:
 * - Automatic compensation on failure
 * - Reverse-order rollback
 * - Compensation logging
 * - Failure recovery
 */
export declare class CompensationManager {
    private compensationHandlers;
    constructor();
    /**
     * Start a new transaction
     */
    startTransaction(executionId: WorkflowExecutionId): Promise<WorkflowTransaction>;
    /**
     * Record a completed step in the transaction
     */
    recordStep(transaction: WorkflowTransaction, stepId: WorkflowStepId, result: StepResult): Promise<void>;
    /**
     * Commit the transaction
     */
    commit(transaction: WorkflowTransaction): Promise<void>;
    /**
     * Rollback the transaction
     */
    rollback(transaction: WorkflowTransaction, context: WorkflowContext): Promise<void>;
    /**
     * Compensate a single step
     */
    private compensateStep;
    /**
     * Register a compensation handler for a step
     */
    registerCompensationHandler(stepId: string, handler: CompensationHandler): void;
    /**
     * Get compensation handler for a step
     */
    private getCompensationHandler;
    /**
     * Register default compensation handlers
     */
    private registerDefaultHandlers;
    /**
     * Generate transaction ID
     */
    private generateTransactionId;
}
/**
 * Saga Orchestrator
 *
 * High-level orchestrator for Saga pattern workflows.
 * Manages complex multi-step transactions with automatic compensation.
 */
export declare class SagaOrchestrator {
    private compensationManager;
    constructor(compensationManager: CompensationManager);
    /**
     * Execute a saga workflow
     */
    executeSaga(executionId: WorkflowExecutionId, steps: Array<{
        stepId: WorkflowStepId;
        execute: () => Promise<StepResult>;
        compensate?: CompensationHandler;
    }>, context: WorkflowContext): Promise<SagaResult>;
}
/**
 * Saga execution result
 */
export interface SagaResult {
    success: boolean;
    error?: string;
    transaction: WorkflowTransaction;
}
/**
 * Saga execution error
 */
export declare class SagaExecutionError extends Error {
    details?: any | undefined;
    constructor(message: string, details?: any | undefined);
}
//# sourceMappingURL=compensation.d.ts.map