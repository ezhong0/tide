/**
 * Agent Swarm Coordinator
 * Manages the lifecycle and coordination of all agents
 */
import { createLogger } from '@tide/logger';
// Import agents - Week 0
import { EmailTriageAgent } from './email/triage-agent';
import { EmailComposerAgent } from './email/composer-agent';
import { CalendarOptimizerAgent } from './calendar/optimizer-agent';
import { TaskPrioritizerAgent } from './task/prioritizer-agent';
import { ContextManagerAgent } from './intelligence/context-manager-agent';
// Import agents - Week 1
import { SchedulingAgent } from './calendar/scheduler-agent';
import { MeetingPrepAgent } from './calendar/meeting-prep-agent';
import { RelationshipAgent } from './email/relationship-agent';
import { EmailAnalyzerAgent } from './email/analyzer-agent';
import { WorkflowOrchestratorAgent } from './task/workflow-orchestrator-agent';
import { AutomationDetectorAgent } from './task/automation-detector-agent';
import { PatternLearnerAgent } from './intelligence/pattern-learner-agent';
import { PredictiveAnalyzerAgent } from './intelligence/predictive-analyzer-agent';
import { DecisionAnalyzerAgent } from './decision/decision-analyzer-agent';
import { RecommendationEngineAgent } from './decision/recommendation-engine-agent';
import { QualityControllerAgent } from './meta/quality-controller-agent';
import { ExplainabilityAgent } from './meta/explainability-agent';
const logger = createLogger({ component: 'SwarmCoordinator' });
export class SwarmCoordinator {
    constructor() {
        this.agents = new Map();
        this.registerAgents();
    }
    /**
     * Register all available agents
     */
    registerAgents() {
        // Email agents (Week 0)
        this.register(new EmailTriageAgent());
        this.register(new EmailComposerAgent());
        // Email agents (Week 1)
        this.register(new RelationshipAgent());
        this.register(new EmailAnalyzerAgent());
        // Calendar agents (Week 0)
        this.register(new CalendarOptimizerAgent());
        // Calendar agents (Week 1)
        this.register(new SchedulingAgent());
        this.register(new MeetingPrepAgent());
        // Task agents (Week 0)
        this.register(new TaskPrioritizerAgent());
        // Task agents (Week 1)
        this.register(new WorkflowOrchestratorAgent());
        this.register(new AutomationDetectorAgent());
        // Intelligence agents (Week 0)
        this.register(new ContextManagerAgent());
        // Intelligence agents (Week 1)
        this.register(new PatternLearnerAgent());
        this.register(new PredictiveAnalyzerAgent());
        // Decision agents (Week 1)
        this.register(new DecisionAnalyzerAgent());
        this.register(new RecommendationEngineAgent());
        // Meta agents (Week 1)
        this.register(new QualityControllerAgent());
        this.register(new ExplainabilityAgent());
        logger.info('Registered agents', { count: this.agents.size });
    }
    /**
     * Register a single agent
     */
    register(agent) {
        const config = agent.config;
        if (config && config.enabled) {
            this.agents.set(config.type, agent);
            logger.debug('Registered agent', { type: config.type });
        }
    }
    /**
     * Select agents based on detected intents
     */
    selectAgents(intents) {
        const selectedAgents = [];
        const selectedTypes = new Set();
        for (const intent of intents) {
            const agentTypes = this.mapIntentToAgents(intent.category);
            for (const agentType of agentTypes) {
                if (!selectedTypes.has(agentType)) {
                    const agent = this.agents.get(agentType);
                    if (agent) {
                        selectedAgents.push(agent);
                        selectedTypes.add(agentType);
                    }
                }
            }
        }
        // Always include context manager
        if (!selectedTypes.has('intel.context')) {
            const contextAgent = this.agents.get('intel.context');
            if (contextAgent) {
                selectedAgents.push(contextAgent);
            }
        }
        logger.debug('Selected agents', {
            intents: intents.map(i => i.category),
            agents: Array.from(selectedTypes),
        });
        return selectedAgents;
    }
    /**
     * Map intent to agent types
     */
    mapIntentToAgents(intent) {
        const mapping = {
            email_triage: ['email.triager'],
            email_compose: ['email.composer'],
            email_reply: ['email.composer'],
            calendar_schedule: ['calendar.scheduler'],
            calendar_optimize: ['calendar.optimizer'],
            task_create: ['task.orchestrator'],
            task_prioritize: ['task.prioritizer'],
            workflow_execute: ['task.orchestrator'],
            question_answer: ['intel.context'],
            decision_support: ['decision.analyzer'],
            learning: ['intel.pattern'],
        };
        return mapping[intent] || [];
    }
    /**
     * Execute multiple agents in parallel
     */
    async executeParallel(tasks, context) {
        logger.debug('Executing agents in parallel', { count: tasks.length });
        const promises = tasks.map(async (task) => {
            const agent = this.agents.get(task.agentType);
            if (!agent) {
                logger.warn('Agent not found', { agentType: task.agentType });
                return {
                    agentType: task.agentType,
                    output: null,
                    confidence: 0,
                    executionTime: 0,
                    tokensUsed: 0,
                    model: 'gpt-5-mini',
                    error: 'Agent not found',
                };
            }
            return agent.execute(task, context);
        });
        return Promise.all(promises);
    }
    /**
     * Execute agents with dependency management
     */
    async executeDAG(tasks, context) {
        logger.debug('Executing agents with dependencies', { count: tasks.length });
        const results = new Map();
        const completed = new Set();
        // Build task ID mapping
        const taskMap = new Map();
        tasks.forEach((task, index) => {
            const taskId = `${task.agentType}-${index}`;
            taskMap.set(taskId, task);
        });
        // Execute tasks respecting dependencies
        for (const [taskId, task] of Array.from(taskMap.entries())) {
            // Wait for dependencies
            if (task.dependencies) {
                await this.waitForDependencies(task.dependencies, completed);
            }
            // Execute task
            const agent = this.agents.get(task.agentType);
            if (agent) {
                const result = await agent.execute(task, context);
                results.set(taskId, result);
                completed.add(taskId);
            }
        }
        return Array.from(results.values());
    }
    /**
     * Wait for dependencies to complete
     */
    async waitForDependencies(dependencies, completed) {
        const checkInterval = 100; // ms
        const maxWait = 30000; // 30 seconds
        const startTime = Date.now();
        while (!dependencies.every(dep => completed.has(dep))) {
            if (Date.now() - startTime > maxWait) {
                throw new Error('Dependency timeout');
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
    }
    /**
     * Get agent by type
     */
    getAgent(type) {
        return this.agents.get(type);
    }
    /**
     * List all registered agents
     */
    listAgents() {
        return Array.from(this.agents.keys());
    }
}
//# sourceMappingURL=swarm-coordinator.js.map