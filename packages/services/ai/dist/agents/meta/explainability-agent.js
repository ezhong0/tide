/**
 * Explainability Agent
 * Generates clear explanations for AI decisions and reasoning
 */
import { BaseAgent } from '../base-agent';
export class ExplainabilityAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'meta.explainer',
            name: 'Explainability Agent',
            description: 'Explains AI reasoning in clear terms',
            capabilities: ['reasoning_explanation', 'decision_justification', 'transparency'],
            defaultModel: 'gpt-5-nano',
            priority: 1,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are an explainability assistant. Create clear explanations for AI decisions.

Return a JSON object with:
- shortExplanation: Brief 1-2 sentence explanation
- detailedExplanation: Comprehensive explanation of the reasoning
- keyFactors: Array of { factor: string, impact: "high" | "medium" | "low", description: string }
- alternatives: Array of alternative approaches considered and why they weren't chosen
- confidence: Explanation of confidence level
- assumptions: Array of assumptions made
- limitations: Any limitations or caveats
- userFriendlyVersion: Explanation in simple, non-technical language

Decision/response to explain:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.5,
            maxTokens: 800,
        });
        return this.parseJSON(result.content, {
            shortExplanation: '',
            detailedExplanation: '',
            keyFactors: [],
            alternatives: [],
            confidence: '',
            assumptions: [],
            limitations: [],
            userFriendlyVersion: '',
        });
    }
    calculateConfidence(output) {
        const hasExplanation = output.shortExplanation && output.detailedExplanation;
        return hasExplanation ? 0.95 : 0.8;
    }
}
//# sourceMappingURL=explainability-agent.js.map