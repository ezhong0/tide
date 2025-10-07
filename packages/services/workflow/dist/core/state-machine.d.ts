import { WorkflowDefinition, WorkflowState, StepHandler } from '../types';
/**
 * Workflow State Machine
 *
 * Manages workflow state transitions and step execution.
 * Implements a robust state machine with:
 * - State persistence
 * - Transition guards
 * - Retry policies
 * - Error handling
 * - History tracking
 */
export declare class WorkflowStateMachine {
    private workflow;
    private persistence;
    private states;
    private transitions;
    private handlers;
    constructor(workflow: WorkflowDefinition, persistence: StatePersistence);
    /**
     * Create a new workflow instance
     */
    createWorkflow(): Promise<WorkflowState>;
    /**
     * Start workflow execution
     */
    start(stateId: string): Promise<WorkflowState>;
    /**
     * Pause workflow execution
     */
    pause(stateId: string): Promise<WorkflowState>;
    /**
     * Resume workflow execution
     */
    resume(stateId: string): Promise<WorkflowState>;
    /**
     * Cancel workflow execution
     */
    cancel(stateId: string): Promise<WorkflowState>;
    /**
     * Get workflow status
     */
    getStatus(stateId: string): Promise<WorkflowState>;
    /**
     * Execute the workflow
     */
    private execute;
    /**
     * Execute a single step
     */
    private executeStep;
    /**
     * Set up the state machine from workflow definition
     */
    private setupStateMachine;
    /**
     * Get handler for a step type
     */
    private getHandlerForStep;
    /**
     * Get default handler for step type
     */
    private getDefaultHandler;
    /**
     * Register a custom step handler
     */
    registerHandler(name: string, handler: StepHandler): void;
    /**
     * Determine next step after successful execution
     */
    private determineNextStep;
    /**
     * Get failure step for a step
     */
    private getFailureStep;
    /**
     * Evaluate a condition
     */
    private evaluateCondition;
    /**
     * Execute with timeout
     */
    private executeWithTimeout;
    /**
     * Calculate retry delay
     */
    private calculateRetryDelay;
    /**
     * Delay helper
     */
    private delay;
    /**
     * Generate execution ID
     */
    private generateExecutionId;
}
/**
 * State Persistence Interface
 * Implementations should handle state storage and retrieval
 */
export interface StatePersistence {
    save(state: WorkflowState): Promise<void>;
    load(id: string): Promise<WorkflowState | null>;
    update(state: WorkflowState): Promise<void>;
    delete(id: string): Promise<void>;
}
/**
 * In-Memory State Persistence (for testing)
 */
export declare class InMemoryStatePersistence implements StatePersistence {
    private states;
    save(state: WorkflowState): Promise<void>;
    load(id: string): Promise<WorkflowState | null>;
    update(state: WorkflowState): Promise<void>;
    delete(id: string): Promise<void>;
    clear(): void;
}
//# sourceMappingURL=state-machine.d.ts.map