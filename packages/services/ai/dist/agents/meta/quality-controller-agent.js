/**
 * Quality Controller Agent
 * Validates responses for accuracy, completeness, and quality
 */
import { BaseAgent } from '../base-agent.js';
export class QualityControllerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'meta.quality',
            name: 'Quality Controller Agent',
            description: 'Validates response quality and accuracy',
            capabilities: ['response_validation', 'accuracy_checking', 'hallucination_detection'],
            defaultModel: 'gpt-5-mini',
            priority: 3,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are a quality control assistant. Validate this AI response for quality issues.

Return a JSON object with:
- accuracyCheck: { passed: boolean, issues: [], confidence: 0-1 }
- completenessCheck: { passed: boolean, missingElements: [], score: 0-1 }
- coherenceCheck: { passed: boolean, issues: [], readabilityScore: 0-1 }
- hallucinationCheck: { passed: boolean, suspiciousClaims: [], confidence: 0-1 }
- safetyCheck: { passed: boolean, concerns: [] }
- overallQuality: "excellent" | "good" | "fair" | "poor"
- improvementSuggestions: Array of specific suggestions
- shouldRetry: boolean

Response to validate:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.2,
            maxTokens: 700,
        });
        return this.parseJSON(result.content, {
            accuracyCheck: { passed: true, issues: [], confidence: 0.9 },
            completenessCheck: { passed: true, missingElements: [], score: 0.9 },
            coherenceCheck: { passed: true, issues: [], readabilityScore: 0.9 },
            hallucinationCheck: { passed: true, suspiciousClaims: [], confidence: 0.9 },
            safetyCheck: { passed: true, concerns: [] },
            overallQuality: 'good',
            improvementSuggestions: [],
            shouldRetry: false,
        });
    }
    calculateConfidence(output) {
        const checks = [
            output.accuracyCheck?.passed,
            output.completenessCheck?.passed,
            output.coherenceCheck?.passed,
            output.hallucinationCheck?.passed,
            output.safetyCheck?.passed,
        ];
        const passedCount = checks.filter(Boolean).length;
        return passedCount / checks.length;
    }
}
//# sourceMappingURL=quality-controller-agent.js.map