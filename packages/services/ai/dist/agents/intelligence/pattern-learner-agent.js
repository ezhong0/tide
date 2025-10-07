/**
 * Pattern Learner Agent
 * Detects and learns behavioral patterns from user interactions
 */
import { BaseAgent } from '../base-agent.js';
export class PatternLearnerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'intel.pattern',
            name: 'Pattern Learner Agent',
            description: 'Detects behavioral patterns and preferences',
            capabilities: ['behavior_analysis', 'preference_detection', 'routine_mapping'],
            defaultModel: 'gpt-5-mini',
            priority: 1,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are a pattern learning assistant. Analyze user behavior to detect patterns.

Return a JSON object with:
- temporalPatterns: Array of { time: string, action: string, frequency: number, confidence: 0-1 }
- sequencePatterns: Array of { trigger: string, sequence: [], frequency: number }
- preferencePatterns: Array of { category: string, preference: string, confidence: 0-1 }
- contextualPatterns: Array of { context: string, likelyAction: string, confidence: 0-1 }
- workingStyleInsights: { preferredWorkTimes: [], focusPatterns: [], communicationStyle: {} }
- learningConfidence: Overall confidence in pattern detection (0-1)

Interaction history for analysis:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.4,
            maxTokens: 800,
        });
        return this.parseJSON(result.content, {
            temporalPatterns: [],
            sequencePatterns: [],
            preferencePatterns: [],
            contextualPatterns: [],
            workingStyleInsights: {},
            learningConfidence: 0.7,
        });
    }
    calculateConfidence(output) {
        return output.learningConfidence || 0.75;
    }
}
//# sourceMappingURL=pattern-learner-agent.js.map