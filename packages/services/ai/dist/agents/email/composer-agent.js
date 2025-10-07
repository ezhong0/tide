/**
 * Email Composer Agent
 * Drafts emails with tone matching and context awareness
 */
import { BaseAgent } from '../base-agent.js';
export class EmailComposerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'email.composer',
            name: 'Email Composer Agent',
            description: 'Drafts emails with tone matching and context awareness',
            capabilities: ['tone_matching', 'context_aware_writing', 'multi_draft'],
            defaultModel: 'gpt-5-mini',
            priority: 2,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const { userProfile } = task.context;
        const style = userProfile?.communicationStyle || {
            formality: 0.7,
            brevity: 0.6,
            preferredTone: 'professional',
        };
        const prompt = this.buildPrompt(`You are an email composition assistant. Draft an email based on the following request.

Communication Style:
- Formality level: ${style.formality * 100}%
- Brevity preference: ${style.brevity * 100}%
- Preferred tone: ${style.preferredTone}

Request:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.7,
            maxTokens: 1000,
        });
        return {
            draft: result.content.trim(),
            tone: style.preferredTone,
            wordCount: result.content.split(/\s+/).length,
            suggestions: [],
        };
    }
    calculateConfidence(output) {
        // Longer emails might need more review
        if (output.wordCount > 200) {
            return 0.75;
        }
        return 0.85;
    }
}
//# sourceMappingURL=composer-agent.js.map