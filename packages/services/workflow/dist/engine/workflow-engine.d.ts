import { Pool } from 'pg';
import { UserId } from '@tide/types';
import { WorkflowDefinition, WorkflowState, WorkflowContext, StepHandler } from '../types';
import { WorkflowRepository } from '../persistence/workflow-repository';
import { TaskEngine } from '../tasks/task-engine';
import { PatternDetector } from '../patterns/pattern-detector';
/**
 * Workflow Engine
 *
 * Main orchestration engine that ties together all workflow components:
 * - State machine execution
 * - DAG-based workflow orchestration
 * - Compensation/Saga pattern for transactions
 * - Task management
 * - Pattern detection
 */
export declare class WorkflowEngine {
    private pool;
    private workflowRepository;
    private taskRepository;
    private patternRepository;
    private statePersistence;
    private compensationManager;
    private sagaOrchestrator;
    private dagExecutor;
    private taskEngine;
    private patternDetector;
    constructor(pool: Pool);
    /**
     * Execute workflow using state machine
     */
    executeWorkflowStateMachine(workflow: WorkflowDefinition, initialContext?: Partial<WorkflowContext>): Promise<WorkflowState>;
    /**
     * Execute workflow using DAG executor
     */
    executeWorkflowDAG(workflow: WorkflowDefinition, context: WorkflowContext): Promise<WorkflowExecutionResult>;
    /**
     * Execute workflow with Saga pattern (for transactions)
     */
    executeWorkflowSaga(workflow: WorkflowDefinition, context: WorkflowContext): Promise<any>;
    /**
     * Register custom step handler
     */
    registerStepHandler(name: string, handler: StepHandler): void;
    /**
     * Get workflow repository (for saving/loading workflows)
     */
    getWorkflowRepository(): WorkflowRepository;
    /**
     * Get task engine (for task management)
     */
    getTaskEngine(): TaskEngine;
    /**
     * Get pattern detector (for pattern detection)
     */
    getPatternDetector(): PatternDetector;
    /**
     * Detect patterns for user
     */
    detectUserPatterns(userId: UserId, days?: number): Promise<any[]>;
    /**
     * Get ready tasks for user
     */
    getReadyTasks(userId: UserId): Promise<any[]>;
    /**
     * Execute ready tasks
     */
    executeTasks(userId: UserId): Promise<any>;
    /**
     * Generate execution ID
     */
    private generateExecutionId;
    /**
     * Health check
     */
    healthCheck(): Promise<HealthStatus>;
}
export interface WorkflowExecutionResult {
    success: boolean;
    results: Map<string, any>;
    duration: number;
    error?: string;
}
export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: Date;
    error?: string;
    components: {
        database: 'up' | 'down' | 'unknown';
        workflow: 'up' | 'down' | 'unknown';
        tasks: 'up' | 'down' | 'unknown';
        patterns: 'up' | 'down' | 'unknown';
    };
}
//# sourceMappingURL=workflow-engine.d.ts.map