/**
 * Meeting Prep Agent
 * Generates meeting briefs, attendee insights, and talking points
 */
import { BaseAgent } from '../base-agent.js';
export class MeetingPrepAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'calendar.prep',
            name: 'Meeting Prep Agent',
            description: 'Generates meeting briefs and preparation materials',
            capabilities: ['brief_generation', 'context_gathering', 'agenda_creation'],
            defaultModel: 'gpt-5',
            priority: 3,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const prompt = this.buildPrompt(`You are a meeting preparation assistant. Create a comprehensive meeting brief.

Return a JSON object with:
- summary: Brief meeting overview (2-3 sentences)
- objectives: Array of meeting objectives
- attendeeInsights: Array of insights about attendees
- talkingPoints: Array of key discussion topics
- preparationTasks: Array of tasks to complete before meeting
- suggestedAgenda: Array of agenda items with time allocations
- relatedContext: Array of relevant background information

Meeting details:`, input, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.5,
            maxTokens: 1200,
        });
        return this.parseJSON(result.content, {
            summary: '',
            objectives: [],
            attendeeInsights: [],
            talkingPoints: [],
            preparationTasks: [],
            suggestedAgenda: [],
            relatedContext: [],
        });
    }
    calculateConfidence(output) {
        const hasContent = output.summary && output.objectives?.length > 0;
        return hasContent ? 0.88 : 0.7;
    }
}
//# sourceMappingURL=meeting-prep-agent.js.map