/**
 * Decision Analyzer Agent
 * Analyzes complex decisions with pros/cons and impact assessment
 */
import { BaseAgent } from '../base-agent.js';
export class DecisionAnalyzerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'decision.analyzer',
            name: 'Decision Analyzer Agent',
            description: 'Analyzes complex decisions and assesses impact',
            capabilities: ['option_generation', 'risk_assessment', 'impact_prediction'],
            defaultModel: 'gpt-5',
            priority: 3,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are a decision analysis assistant. Perform comprehensive analysis of this decision.

Return a JSON object with:
- decision: Brief description of the decision
- options: Array of { option: string, pros: [], cons: [], estimatedImpact: string, feasibility: 0-1 }
- riskAssessment: { risks: [], mitigation: [], overallRisk: "low" | "medium" | "high" }
- impactAnalysis: {
    shortTerm: string,
    longTerm: string,
    stakeholders: Array of affected parties,
    resources: Array of required resources
  }
- recommendations: Array of recommended approaches with reasoning
- additionalConsiderations: Array of factors to consider
- confidenceLevel: Overall confidence in analysis (0-1)

Decision to analyze:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.6,
            maxTokens: 1200,
        });
        return this.parseJSON(result.content, {
            decision: '',
            options: [],
            riskAssessment: {},
            impactAnalysis: {},
            recommendations: [],
            additionalConsiderations: [],
            confidenceLevel: 0.75,
        });
    }
    calculateConfidence(output) {
        return output.confidenceLevel || 0.8;
    }
}
//# sourceMappingURL=decision-analyzer-agent.js.map