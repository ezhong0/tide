"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const logger_1 = require("@tide/logger");
const state_machine_1 = require("../core/state-machine");
const dag_executor_1 = require("../core/dag-executor");
const compensation_1 = require("../core/compensation");
const workflow_repository_1 = require("../persistence/workflow-repository");
const task_engine_1 = require("../tasks/task-engine");
const task_repository_1 = require("../persistence/task-repository");
const pattern_detector_1 = require("../patterns/pattern-detector");
const pattern_repository_1 = require("../persistence/pattern-repository");
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
class WorkflowEngine {
    constructor(pool) {
        this.pool = pool;
        // Initialize repositories
        this.workflowRepository = new workflow_repository_1.WorkflowRepository(pool);
        this.taskRepository = new task_repository_1.TaskRepository(pool);
        this.patternRepository = new pattern_repository_1.PatternRepository(pool);
        // Initialize persistence
        this.statePersistence = new workflow_repository_1.PostgreSQLStatePersistence(this.workflowRepository);
        // Initialize core components
        this.compensationManager = new compensation_1.CompensationManager();
        this.sagaOrchestrator = new compensation_1.SagaOrchestrator(this.compensationManager);
        this.dagExecutor = new dag_executor_1.DAGExecutor();
        // Initialize engines
        const prioritizer = new task_engine_1.TaskPrioritizer();
        const decomposer = new task_engine_1.TaskDecomposer();
        this.taskEngine = new task_engine_1.TaskEngine(this.taskRepository, prioritizer, decomposer);
        const behaviorAnalyzer = new pattern_detector_1.BehaviorAnalyzer();
        this.patternDetector = new pattern_detector_1.PatternDetector(this.patternRepository, behaviorAnalyzer);
        logger_1.logger.info('Workflow engine initialized');
    }
    /**
     * Execute workflow using state machine
     */
    async executeWorkflowStateMachine(workflow, initialContext) {
        logger_1.logger.info({ workflowId: workflow.id }, 'Executing workflow with state machine');
        // Create state machine
        const stateMachine = new state_machine_1.WorkflowStateMachine(workflow, this.statePersistence);
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
        logger_1.logger.info({ workflowId: workflow.id, executionId: state.id, status: result.status }, 'Workflow execution completed');
        return result;
    }
    /**
     * Execute workflow using DAG executor
     */
    async executeWorkflowDAG(workflow, context) {
        logger_1.logger.info({ workflowId: workflow.id }, 'Executing workflow with DAG');
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
            logger_1.logger.info({
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
            logger_1.logger.error({ error, workflowId: workflow.id }, 'DAG execution failed');
            throw error;
        }
    }
    /**
     * Execute workflow with Saga pattern (for transactions)
     */
    async executeWorkflowSaga(workflow, context) {
        logger_1.logger.info({ workflowId: workflow.id }, 'Executing workflow with Saga pattern');
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
        logger_1.logger.info({
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
        logger_1.logger.info({ handlerName: name }, 'Step handler registered');
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
        logger_1.logger.info({ userId, days }, 'Detecting user patterns');
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
        logger_1.logger.info({ userId }, 'Executing ready tasks');
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
            logger_1.logger.error({ error }, 'Health check failed');
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
exports.WorkflowEngine = WorkflowEngine;
//# sourceMappingURL=workflow-engine.js.map