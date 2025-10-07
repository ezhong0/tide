/**
 * Chain Builder
 * Constructs multi-step reasoning chains from requests
 */
import { createLogger } from '@tide/logger';
const logger = createLogger({ component: 'ChainBuilder' });
export class ChainBuilder {
    /**
     * Build a reasoning chain from request and agents
     */
    async build(request, agents, intents) {
        logger.debug('Building reasoning chain', {
            intentsCount: intents.length,
            agentsCount: agents.length
        });
        // Determine complexity
        const complexity = this.determineComplexity(request, intents);
        // Build chain links based on complexity
        const links = this.buildLinks(request, intents, agents, complexity);
        // Calculate dependencies
        this.calculateDependencies(links);
        const chainId = `chain-${Date.now()}`;
        return {
            chainId,
            totalSteps: links.length,
            links,
            estimatedDuration: links.reduce((sum, link) => sum + 5, 0), // 5s per step estimate
            complexity,
        };
    }
    /**
     * Determine complexity of reasoning required
     */
    determineComplexity(request, intents) {
        const content = request.content.toLowerCase();
        // Complex indicators
        if (content.includes('analyze') ||
            content.includes('compare') ||
            content.includes('evaluate') ||
            intents.length > 2) {
            return 'complex';
        }
        // Moderate indicators
        if (content.includes('explain') ||
            content.includes('summarize') ||
            intents.length > 1) {
            return 'moderate';
        }
        return 'simple';
    }
    /**
     * Build reasoning links
     */
    buildLinks(request, intents, agents, complexity) {
        const links = [];
        // Always start with context loading
        links.push({
            id: 'context-load',
            step: 1,
            description: 'Load and prepare context',
            agentTypes: ['intel.context'],
            dependencies: [],
            critical: true,
            input: request,
            expectedOutput: 'Relevant context loaded',
        });
        // Add intent-specific reasoning steps
        intents.forEach((intent, idx) => {
            const linkId = `intent-${intent.category}-${idx}`;
            links.push({
                id: linkId,
                step: links.length + 1,
                description: `Process ${intent.category} intent`,
                agentTypes: this.mapIntentToAgents(intent.category),
                dependencies: ['context-load'],
                critical: intent.confidence > 0.9,
                input: { intent, request },
                expectedOutput: `${intent.category} processed`,
            });
        });
        // For complex reasoning, add synthesis step
        if (complexity === 'complex') {
            links.push({
                id: 'synthesis',
                step: links.length + 1,
                description: 'Synthesize results from all agents',
                agentTypes: ['meta.quality'],
                dependencies: links.slice(1).map(l => l.id),
                critical: true,
                input: { allResults: true },
                expectedOutput: 'Synthesized analysis',
            });
        }
        // Always end with quality check
        links.push({
            id: 'quality-check',
            step: links.length + 1,
            description: 'Validate response quality',
            agentTypes: ['meta.quality'],
            dependencies: [links[links.length - 1].id],
            critical: false,
            input: { validateAll: true },
            expectedOutput: 'Quality validated',
        });
        return links;
    }
    /**
     * Calculate dependencies between links
     */
    calculateDependencies(links) {
        // Dependencies are already set in buildLinks
        // This method can be extended for more complex dependency analysis
        logger.debug('Calculated dependencies', {
            totalLinks: links.length,
            criticalLinks: links.filter(l => l.critical).length
        });
    }
    /**
     * Map intent to agent types
     */
    mapIntentToAgents(intent) {
        const mapping = {
            email_triage: ['email.triager', 'email.relationship'],
            email_compose: ['email.composer', 'email.analyzer'],
            email_reply: ['email.composer', 'email.analyzer'],
            calendar_schedule: ['calendar.scheduler'],
            calendar_optimize: ['calendar.optimizer'],
            task_create: ['task.orchestrator'],
            task_prioritize: ['task.prioritizer'],
            workflow_execute: ['task.orchestrator', 'task.automator'],
            question_answer: ['intel.context', 'intel.pattern'],
            decision_support: ['decision.analyzer', 'decision.recommender'],
            learning: ['intel.pattern', 'intel.predictor'],
        };
        return mapping[intent] || ['intel.context'];
    }
}
//# sourceMappingURL=chain-builder.js.map