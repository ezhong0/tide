/**
 * Relationship Agent
 * Tracks and analyzes professional relationships
 */
import { BaseAgent } from '../base-agent.js';
export class RelationshipAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'email.relationship',
            name: 'Relationship Agent',
            description: 'Tracks and analyzes professional relationships',
            capabilities: ['contact_mapping', 'interaction_history', 'importance_scoring'],
            defaultModel: 'gpt-5-nano',
            priority: 1,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const { recentEmails } = task.context;
        const prompt = this.buildPrompt(`You are a relationship analysis assistant. Analyze the relationship with this contact.

Return a JSON object with:
- importanceScore: 0-1 score indicating relationship importance
- relationshipType: "colleague" | "client" | "vendor" | "leadership" | "external"
- communicationFrequency: "daily" | "weekly" | "monthly" | "rarely"
- sentimentTrend: "positive" | "neutral" | "negative"
- interactionPattern: Description of typical interactions
- keyTopics: Array of common discussion topics
- recommendations: Array of relationship management suggestions

Contact analysis:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.4,
            maxTokens: 600,
        });
        return this.parseJSON(result.content, {
            importanceScore: 0.5,
            relationshipType: 'colleague',
            communicationFrequency: 'weekly',
            sentimentTrend: 'neutral',
            interactionPattern: '',
            keyTopics: [],
            recommendations: [],
        });
    }
    calculateConfidence(output) {
        return 0.85;
    }
}
//# sourceMappingURL=relationship-agent.js.map