import { WorkflowDefinition, WorkflowStepId, WorkflowDAG, ExecutionPlan, WorkflowContext, StepResult, StepHandler } from '../types';
/**
 * DAG Executor
 *
 * Executes workflows as Directed Acyclic Graphs (DAGs).
 * Features:
 * - Topological sorting for optimal execution order
 * - Parallel execution of independent steps
 * - Dependency resolution
 * - Cycle detection
 */
export declare class DAGExecutor {
    private handlers;
    constructor();
    /**
     * Build DAG from workflow definition
     */
    buildDAG(workflow: WorkflowDefinition): WorkflowDAG;
    /**
     * Create execution plan from DAG
     */
    createExecutionPlan(dag: WorkflowDAG): ExecutionPlan;
    /**
     * Execute workflow according to plan
     */
    execute(plan: ExecutionPlan, context: WorkflowContext): Promise<Map<WorkflowStepId, StepResult>>;
    /**
     * Execute steps in parallel
     */
    private executeParallel;
    /**
     * Execute a single step
     */
    private executeStep;
    /**
     * Get handler for step
     */
    private getHandler;
    /**
     * Register a custom step handler
     */
    registerHandler(name: string, handler: StepHandler): void;
    /**
     * Register default handlers
     */
    private registerDefaultHandlers;
    /**
     * Get next steps from current step
     */
    private getNextSteps;
    /**
     * Calculate node levels for topological sorting
     */
    private calculateLevels;
    /**
     * Detect cycles in the DAG
     */
    private detectCycles;
    /**
     * Find entry point (node with no dependencies)
     */
    private findEntryPoint;
    /**
     * Find exit points (nodes with no dependents)
     */
    private findExitPoints;
    /**
     * Group nodes by level
     */
    private groupByLevel;
}
//# sourceMappingURL=dag-executor.d.ts.map