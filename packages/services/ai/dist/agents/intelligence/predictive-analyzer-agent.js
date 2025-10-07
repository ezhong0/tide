/**
 * Predictive Analyzer Agent
 * Predicts next actions and proactively suggests assistance
 */
import { BaseAgent } from '../base-agent';
export class PredictiveAnalyzerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'intel.predictor',
            name: 'Predictive Analyzer Agent',
            description: 'Predicts needs and suggests proactive actions',
            capabilities: ['next_action_prediction', 'need_anticipation', 'proactive_suggestions'],
            defaultModel: 'gpt-5-mini',
            priority: 2,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const { currentTime, upcomingEvents, activeTasks } = task.context;
        const prompt = this.buildPrompt(`You are a predictive analysis assistant. Predict what the user will need next.

Current context:
- Time: ${new Date(currentTime).toISOString()}
- Upcoming events: ${upcomingEvents?.length || 0}
- Active tasks: ${activeTasks?.length || 0}

Return a JSON object with:
- nextActions: Array of { action: string, confidence: 0-1, timing: "now" | "5min" | "30min" | "1hour", reason: string }
- anticipatedNeeds: Array of { need: string, priority: "low" | "medium" | "high", prepTime: minutes }
- proactiveSuggestions: Array of { suggestion: string, benefit: string, effort: "low" | "medium" | "high" }
- contextualRecommendations: Array of context-aware recommendations
- riskAlerts: Array of potential issues to watch for

Analysis:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.5,
            maxTokens: 900,
        });
        return this.parseJSON(result.content, {
            nextActions: [],
            anticipatedNeeds: [],
            proactiveSuggestions: [],
            contextualRecommendations: [],
            riskAlerts: [],
        });
    }
    calculateConfidence(output) {
        const hasActions = output.nextActions?.length > 0;
        return hasActions ? 0.82 : 0.7;
    }
}
//# sourceMappingURL=predictive-analyzer-agent.js.map