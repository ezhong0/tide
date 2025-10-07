/**
 * Context Manager Agent
 * Loads and manages contextual information for AI requests
 */
import { BaseAgent } from '../base-agent';
export class ContextManagerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'intel.context',
            name: 'Context Manager Agent',
            description: 'Loads and manages contextual information',
            capabilities: ['context_loading', 'relevance_filtering', 'memory_management'],
            defaultModel: 'gpt-5-nano',
            priority: 0, // Always runs first
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const aiContext = task.context;
        const prompt = this.buildPrompt(`You are a context analysis assistant. Analyze the request and identify what context is relevant.

Return a JSON object with:
- relevantContext: Array of context types needed ["emails", "calendar", "tasks", "contacts", "documents"]
- temporalContext: { timeframe, references }
- entities: Array of mentioned entities { type, value }
- requiredData: Array of data that should be loaded

User request:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.2,
            maxTokens: 500,
        });
        const parsed = this.parseJSON(result.content, {
            relevantContext: [],
            temporalContext: {},
            entities: [],
            requiredData: [],
        });
        // Merge with existing context
        return {
            ...parsed,
            loadedContext: {
                previousMessages: aiContext.previousMessages || [],
                recentEmails: aiContext.recentEmails || [],
                upcomingEvents: aiContext.upcomingEvents || [],
                activeTasks: aiContext.activeTasks || [],
            },
        };
    }
    calculateConfidence(output) {
        // Context loading is deterministic
        return 0.95;
    }
}
//# sourceMappingURL=context-manager-agent.js.map