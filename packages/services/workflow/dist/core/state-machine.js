import { logger } from '@tide/logger';
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
export class WorkflowStateMachine {
    constructor(workflow, persistence) {
        this.workflow = workflow;
        this.persistence = persistence;
        this.states = new Map();
        this.transitions = new Map();
        this.handlers = new Map();
        this.setupStateMachine();
    }
    /**
     * Create a new workflow instance
     */
    async createWorkflow() {
        const initialStep = this.workflow.steps[0];
        if (!initialStep) {
            throw new Error('Workflow must have at least one step');
        }
        const initialState = {
            id: this.generateExecutionId(),
            workflowId: this.workflow.id,
            currentStep: initialStep.id,
            status: 'pending',
            context: {
                inputs: {},
                outputs: {},
                stepResults: new Map(),
                variables: {},
            },
            history: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.persistence.save(initialState);
        logger.info({ workflowId: this.workflow.id, executionId: initialState.id }, 'Workflow created');
        return initialState;
    }
    /**
     * Start workflow execution
     */
    async start(stateId) {
        const state = await this.persistence.load(stateId);
        if (!state) {
            throw new Error(`Workflow state not found: ${stateId}`);
        }
        if (state.status !== 'pending') {
            throw new Error(`Cannot start workflow in status: ${state.status}`);
        }
        state.status = 'running';
        state.updatedAt = new Date();
        await this.persistence.update(state);
        logger.info({ executionId: state.id }, 'Workflow started');
        // Execute the workflow
        await this.execute(state);
        return state;
    }
    /**
     * Pause workflow execution
     */
    async pause(stateId) {
        const state = await this.persistence.load(stateId);
        if (!state) {
            throw new Error(`Workflow state not found: ${stateId}`);
        }
        if (state.status !== 'running') {
            throw new Error(`Cannot pause workflow in status: ${state.status}`);
        }
        state.status = 'paused';
        state.updatedAt = new Date();
        await this.persistence.update(state);
        logger.info({ executionId: state.id }, 'Workflow paused');
        return state;
    }
    /**
     * Resume workflow execution
     */
    async resume(stateId) {
        const state = await this.persistence.load(stateId);
        if (!state) {
            throw new Error(`Workflow state not found: ${stateId}`);
        }
        if (state.status !== 'paused') {
            throw new Error(`Cannot resume workflow in status: ${state.status}`);
        }
        state.status = 'running';
        state.updatedAt = new Date();
        await this.persistence.update(state);
        logger.info({ executionId: state.id }, 'Workflow resumed');
        // Continue execution
        await this.execute(state);
        return state;
    }
    /**
     * Cancel workflow execution
     */
    async cancel(stateId) {
        const state = await this.persistence.load(stateId);
        if (!state) {
            throw new Error(`Workflow state not found: ${stateId}`);
        }
        state.status = 'cancelled';
        state.updatedAt = new Date();
        await this.persistence.update(state);
        logger.info({ executionId: state.id }, 'Workflow cancelled');
        return state;
    }
    /**
     * Get workflow status
     */
    async getStatus(stateId) {
        const state = await this.persistence.load(stateId);
        if (!state) {
            throw new Error(`Workflow state not found: ${stateId}`);
        }
        return state;
    }
    /**
     * Execute the workflow
     */
    async execute(state) {
        while (state.status === 'running' && state.currentStep) {
            const currentStep = this.workflow.steps.find(s => s.id === state.currentStep);
            if (!currentStep) {
                throw new Error(`Step not found: ${state.currentStep}`);
            }
            // Execute the current step
            const result = await this.executeStep(state, currentStep);
            // Record in history
            const historyEntry = {
                stepId: currentStep.id,
                timestamp: new Date(),
                status: result.success ? 'completed' : 'failed',
                result,
                duration: 0, // TODO: Track actual duration
            };
            state.history.push(historyEntry);
            // Update context with result
            state.context.stepResults.set(currentStep.id, result);
            if (result.output) {
                state.context.outputs[currentStep.id] = result.output;
            }
            // Determine next step
            if (result.success) {
                const nextStep = await this.determineNextStep(state, currentStep, result);
                if (nextStep) {
                    state.currentStep = nextStep;
                }
                else {
                    // Workflow completed
                    state.status = 'completed';
                    state.currentStep = ''; // End of workflow
                }
            }
            else {
                // Handle failure
                const failureStep = this.getFailureStep(currentStep);
                if (failureStep) {
                    state.currentStep = failureStep;
                }
                else {
                    // No failure handler, mark workflow as failed
                    state.status = 'failed';
                    state.currentStep = ''; // End of workflow
                }
            }
            // Update state
            state.updatedAt = new Date();
            await this.persistence.update(state);
        }
        logger.info({ executionId: state.id, status: state.status }, 'Workflow execution completed');
    }
    /**
     * Execute a single step
     */
    async executeStep(state, step) {
        logger.info({ executionId: state.id, stepId: step.id, stepType: step.type }, 'Executing step');
        const stateDefinition = this.states.get(step.id);
        if (!stateDefinition) {
            throw new Error(`State definition not found for step: ${step.id}`);
        }
        let retryCount = 0;
        const maxRetries = step.retryPolicy?.maxAttempts || 0;
        while (retryCount <= maxRetries) {
            try {
                // Execute with timeout if configured
                const result = step.timeout
                    ? await this.executeWithTimeout(() => stateDefinition.handler(state.context, step.config), step.timeout)
                    : await stateDefinition.handler(state.context, step.config);
                logger.info({ executionId: state.id, stepId: step.id }, 'Step executed successfully');
                return {
                    success: true,
                    output: result.output,
                };
            }
            catch (error) {
                logger.error({ executionId: state.id, stepId: step.id, error, retryCount }, 'Step execution failed');
                // Check if should retry
                if (retryCount < maxRetries && step.retryPolicy) {
                    retryCount++;
                    await this.delay(this.calculateRetryDelay(step.retryPolicy, retryCount));
                    continue;
                }
                // Max retries reached or no retry policy
                return {
                    success: false,
                    error: {
                        code: 'STEP_EXECUTION_FAILED',
                        message: error instanceof Error ? error.message : 'Unknown error',
                        recoverable: false,
                    },
                };
            }
        }
        // Should never reach here
        return {
            success: false,
            error: {
                code: 'STEP_EXECUTION_FAILED',
                message: 'Max retries exceeded',
                recoverable: false,
            },
        };
    }
    /**
     * Set up the state machine from workflow definition
     */
    setupStateMachine() {
        // Create states from steps
        for (const step of this.workflow.steps) {
            const handler = this.getHandlerForStep(step);
            const stateDefinition = {
                id: step.id,
                type: step.type,
                handler,
                timeout: step.timeout,
                retryPolicy: step.retryPolicy,
            };
            this.states.set(step.id, stateDefinition);
        }
        // Create transitions from step flow
        for (const step of this.workflow.steps) {
            const transitions = [];
            // Success transition
            if (step.onSuccess) {
                transitions.push({
                    event: 'success',
                    from: step.id,
                    to: step.onSuccess,
                });
            }
            else if (step.next) {
                // Default next step
                const nextStep = typeof step.next === 'string'
                    ? step.next
                    : step.next[0]?.target;
                if (nextStep) {
                    transitions.push({
                        event: 'success',
                        from: step.id,
                        to: nextStep,
                    });
                }
            }
            // Failure transition
            if (step.onFailure) {
                transitions.push({
                    event: 'failure',
                    from: step.id,
                    to: step.onFailure,
                });
            }
            // Conditional transitions
            if (Array.isArray(step.next)) {
                for (const condition of step.next) {
                    transitions.push({
                        event: 'evaluate',
                        from: step.id,
                        to: condition.target,
                        guard: async (context) => this.evaluateCondition(condition.condition, context),
                    });
                }
            }
            this.transitions.set(step.id, transitions);
        }
    }
    /**
     * Get handler for a step type
     */
    getHandlerForStep(step) {
        // Check if custom handler is registered
        if (step.config.handler && this.handlers.has(step.config.handler)) {
            return this.handlers.get(step.config.handler);
        }
        // Return default handler based on step type
        return this.getDefaultHandler(step.type);
    }
    /**
     * Get default handler for step type
     */
    getDefaultHandler(stepType) {
        const defaultHandlers = {
            action: async (context, config) => {
                logger.info({ stepType: 'action', config }, 'Executing action step');
                return { success: true, output: { executed: true } };
            },
            decision: async (context, config) => {
                logger.info({ stepType: 'decision', config }, 'Executing decision step');
                return { success: true, output: { decision: 'default' } };
            },
            parallel: async (context, config) => {
                logger.info({ stepType: 'parallel', config }, 'Executing parallel step');
                return { success: true, output: { parallelResults: [] } };
            },
            delay: async (context, config) => {
                const delayMs = config.delay || 1000;
                await new Promise(resolve => setTimeout(resolve, delayMs));
                return { success: true, output: { delayed: delayMs } };
            },
        };
        return defaultHandlers[stepType] || defaultHandlers.action;
    }
    /**
     * Register a custom step handler
     */
    registerHandler(name, handler) {
        this.handlers.set(name, handler);
    }
    /**
     * Determine next step after successful execution
     */
    async determineNextStep(state, currentStep, result) {
        const transitions = this.transitions.get(currentStep.id);
        if (!transitions || transitions.length === 0) {
            return undefined;
        }
        // Check conditional transitions first
        for (const transition of transitions) {
            if (transition.guard) {
                const shouldTransition = await transition.guard(state.context);
                if (shouldTransition) {
                    return transition.to;
                }
            }
        }
        // Return default success transition
        const successTransition = transitions.find(t => t.event === 'success');
        return successTransition?.to;
    }
    /**
     * Get failure step for a step
     */
    getFailureStep(step) {
        const transitions = this.transitions.get(step.id);
        const failureTransition = transitions?.find(t => t.event === 'failure');
        return failureTransition?.to;
    }
    /**
     * Evaluate a condition
     */
    evaluateCondition(condition, context) {
        // Simple condition evaluation
        // TODO: Implement more sophisticated condition evaluation
        const field = context.variables[condition.field];
        switch (condition.operator) {
            case 'equals':
                return field === condition.value;
            case 'notEquals':
                return field !== condition.value;
            case 'greaterThan':
                return Number(field) > Number(condition.value);
            case 'lessThan':
                return Number(field) < Number(condition.value);
            case 'contains':
                return String(field).includes(String(condition.value));
            case 'exists':
                return field !== undefined && field !== null;
            default:
                return false;
        }
    }
    /**
     * Execute with timeout
     */
    async executeWithTimeout(fn, timeout) {
        return Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timeout')), timeout)),
        ]);
    }
    /**
     * Calculate retry delay
     */
    calculateRetryDelay(policy, attempt) {
        switch (policy.backoff) {
            case 'exponential':
                return Math.min(policy.delay * Math.pow(2, attempt - 1), policy.maxDelay || Infinity);
            case 'linear':
                return Math.min(policy.delay * attempt, policy.maxDelay || Infinity);
            case 'fixed':
            default:
                return policy.delay;
        }
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Generate execution ID
     */
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * In-Memory State Persistence (for testing)
 */
export class InMemoryStatePersistence {
    constructor() {
        this.states = new Map();
    }
    async save(state) {
        this.states.set(state.id, JSON.parse(JSON.stringify(state)));
    }
    async load(id) {
        const state = this.states.get(id);
        return state ? JSON.parse(JSON.stringify(state)) : null;
    }
    async update(state) {
        if (!this.states.has(state.id)) {
            throw new Error(`State not found: ${state.id}`);
        }
        this.states.set(state.id, JSON.parse(JSON.stringify(state)));
    }
    async delete(id) {
        this.states.delete(id);
    }
    clear() {
        this.states.clear();
    }
}
//# sourceMappingURL=state-machine.js.map