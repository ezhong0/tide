/**
 * Email Analyzer Agent
 * Deep analysis of email content for sentiment, requests, and commitments
 */
import { BaseAgent } from '../base-agent';
export class EmailAnalyzerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'email.analyzer',
            name: 'Email Analyzer Agent',
            description: 'Analyzes emails for sentiment, requests, and commitments',
            capabilities: ['sentiment_analysis', 'request_extraction', 'commitment_detection'],
            defaultModel: 'gpt-5-nano',
            priority: 1,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are an email analysis assistant. Perform deep analysis of this email.

Return a JSON object with:
- sentiment: { overall: "positive" | "neutral" | "negative", confidence: 0-1, nuances: string }
- requests: Array of { request: string, deadline: string | null, priority: "low" | "medium" | "high" }
- commitments: Array of { commitment: string, from: "sender" | "recipient", deadline: string | null }
- actionItems: Array of explicit action items
- topics: Array of main topics discussed
- tone: "formal" | "casual" | "urgent" | "friendly" | "professional"
- emotionalCues: Array of detected emotional indicators

Email to analyze:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.3,
            maxTokens: 700,
        });
        return this.parseJSON(result.content, {
            sentiment: { overall: 'neutral', confidence: 0.8, nuances: '' },
            requests: [],
            commitments: [],
            actionItems: [],
            topics: [],
            tone: 'professional',
            emotionalCues: [],
        });
    }
    calculateConfidence(output) {
        return output.sentiment?.confidence || 0.85;
    }
}
//# sourceMappingURL=analyzer-agent.js.map