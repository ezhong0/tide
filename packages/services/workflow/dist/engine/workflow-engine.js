import { logger } from '@tide/logger';
import { WorkflowStateMachine } from '../core/state-machine.js';
import { DAGExecutor } from '../core/dag-executor.js';
import { CompensationManager, SagaOrchestrator } from '../core/compensation.js';
import { WorkflowRepository, PostgreSQLStatePersistence } from '../persistence/workflow-repository.js';
import { TaskEngine, TaskPrioritizer, TaskDecomposer } from '../tasks/task-engine.js';
import { TaskRepository } from '../persistence/task-repository.js';
import { PatternDetector, BehaviorAnalyzer } from '../patterns/pattern-detector.js';
import { PatternRepository } from '../persistence/pattern-repository.js';
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
export class WorkflowEngine {
    constructor(pool) {
        this.pool = pool;
        // Initialize repositories
        this.workflowRepository = new WorkflowRepository(pool);
        this.taskRepository = new TaskRepository(pool);
        this.patternRepository = new PatternRepository(pool);
        // Initialize persistence
        this.statePersistence = new PostgreSQLStatePersistence(this.workflowRepository);
        // Initialize core components
        this.compensationManager = new CompensationManager();
        this.sagaOrchestrator = new SagaOrchestrator(this.compensationManager);
        this.dagExecutor = new DAGExecutor();
        // Initialize engines
        const prioritizer = new TaskPrioritizer();
        const decomposer = new TaskDecomposer();
        this.taskEngine = new TaskEngine(this.taskRepository, prioritizer, decomposer);
        const behaviorAnalyzer = new BehaviorAnalyzer();
        this.patternDetector = new PatternDetector(this.patternRepository, behaviorAnalyzer);
        logger.info('Workflow engine initialized');
    }
    /**
     * Execute workflow using state machine
     */
    async executeWorkflowStateMachine(workflow, initialContext) {
        logger.info({ workflowId: workflow.id }, 'Executing workflow with state machine');
        // Create state machine
        const stateMachine = new WorkflowStateMachine(workflow, this.statePersistence);
        // Create workflow instance
        const state = await stateMachine.createWorkflow();
        // Set initial context if provided
        if (initialContext) {
            state.context = {
                ...state.context,
                ...initialContext,
            };
            await this.statePersistence.update(state);
        }
        // Start execution
        const result = await stateMachine.start(state.id);
        logger.info({ workflowId: workflow.id, executionId: state.id, status: result.status }, 'Workflow execution completed');
        return result;
    }
    /**
     * Execute workflow using DAG executor
     */
    async executeWorkflowDAG(workflow, context) {
        logger.info({ workflowId: workflow.id }, 'Executing workflow with DAG');
        try {
            // Build DAG
            const dag = this.dagExecutor.buildDAG(workflow);
            // Create execution plan
            const plan = this.dagExecutor.createExecutionPlan(dag);
            // Execute workflow
            const startTime = Date.now();
            const results = await this.dagExecutor.execute(plan, context);
            const duration = Date.now() - startTime;
            // Check if all steps succeeded
            const allSuccess = Array.from(results.values()).every(r => r.success);
            logger.info({
                workflowId: workflow.id,
                success: allSuccess,
                duration,
                stepCount: results.size,
            }, 'DAG execution completed');
            return {
                success: allSuccess,
                results,
                duration,
            };
        }
        catch (error) {
            logger.error({ error, workflowId: workflow.id }, 'DAG execution failed');
            throw error;
        }
    }
    /**
     * Execute workflow with Saga pattern (for transactions)
     */
    async executeWorkflowSaga(workflow, context) {
        logger.info({ workflowId: workflow.id }, 'Executing workflow with Saga pattern');
        const executionId = this.generateExecutionId();
        // Convert workflow steps to saga steps
        const sagaSteps = workflow.steps.map(step => ({
            stepId: step.id,
            execute: async () => {
                // Execute step handler
                const handler = this.dagExecutor['getHandler'](step);
                return await handler(context, step.config);
            },
            compensate: step.compensation
                ? this.compensationManager['getCompensationHandler'](step.id)
                : undefined,
        }));
        // Execute saga
        const result = await this.sagaOrchestrator.executeSaga(executionId, sagaSteps, context);
        logger.info({
            workflowId: workflow.id,
            executionId,
            success: result.success,
        }, 'Saga execution completed');
        return result;
    }
    /**
     * Register custom step handler
     */
    registerStepHandler(name, handler) {
        this.dagExecutor.registerHandler(name, handler);
        logger.info({ handlerName: name }, 'Step handler registered');
    }
    /**
     * Get workflow repository (for saving/loading workflows)
     */
    getWorkflowRepository() {
        return this.workflowRepository;
    }
    /**
     * Get task engine (for task management)
     */
    getTaskEngine() {
        return this.taskEngine;
    }
    /**
     * Get pattern detector (for pattern detection)
     */
    getPatternDetector() {
        return this.patternDetector;
    }
    /**
     * Detect patterns for user
     */
    async detectUserPatterns(userId, days = 30) {
        logger.info({ userId, days }, 'Detecting user patterns');
        return await this.patternDetector.detectPatterns(userId, days);
    }
    /**
     * Get ready tasks for user
     */
    async getReadyTasks(userId) {
        return await this.taskEngine.getReadyTasks(userId);
    }
    /**
     * Execute ready tasks
     */
    async executeTasks(userId) {
        logger.info({ userId }, 'Executing ready tasks');
        return await this.taskEngine.executeTasks(userId);
    }
    /**
     * Generate execution ID
     */
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            // Check database connection
            await this.pool.query('SELECT 1');
            return {
                status: 'healthy',
                timestamp: new Date(),
                components: {
                    database: 'up',
                    workflow: 'up',
                    tasks: 'up',
                    patterns: 'up',
                },
            };
        }
        catch (error) {
            logger.error({ error }, 'Health check failed');
            return {
                status: 'unhealthy',
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
                components: {
                    database: 'down',
                    workflow: 'unknown',
                    tasks: 'unknown',
                    patterns: 'unknown',
                },
            };
        }
    }
}
//# sourceMappingURL=workflow-engine.js.map