/**
 * Recommendation Engine Agent
 * Generates personalized recommendations based on context and history
 */
import { BaseAgent } from '../base-agent';
export class RecommendationEngineAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'decision.recommender',
            name: 'Recommendation Engine Agent',
            description: 'Generates personalized recommendations',
            capabilities: ['recommendation_generation', 'confidence_scoring', 'explanation'],
            defaultModel: 'gpt-5-mini',
            priority: 2,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are a recommendation assistant. Generate personalized recommendations.

Return a JSON object with:
- recommendations: Array of {
    id: string,
    recommendation: string,
    reasoning: string,
    confidence: 0-1,
    priority: "low" | "medium" | "high",
    expectedBenefit: string,
    implementation: { difficulty: "easy" | "medium" | "hard", steps: [] }
  }
- alternativeApproaches: Array of alternative recommendations
- tradeoffs: Analysis of tradeoffs between options
- userAlignment: How well this aligns with user preferences (0-1)

Request for recommendations:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.6,
            maxTokens: 900,
        });
        return this.parseJSON(result.content, {
            recommendations: [],
            alternativeApproaches: [],
            tradeoffs: '',
            userAlignment: 0.8,
        });
    }
    calculateConfidence(output) {
        const hasRecommendations = output.recommendations?.length > 0;
        const avgConfidence = output.recommendations?.reduce((sum, r) => sum + (r.confidence || 0), 0) / (output.recommendations?.length || 1);
        return hasRecommendations ? avgConfidence : 0.75;
    }
}
//# sourceMappingURL=recommendation-engine-agent.js.map