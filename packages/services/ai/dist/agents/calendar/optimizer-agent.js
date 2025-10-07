/**
 * Calendar Optimizer Agent
 * Optimizes calendar schedules for focus time and efficiency
 */
import { BaseAgent } from '../base-agent.js';
export class CalendarOptimizerAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'calendar.optimizer',
            name: 'Calendar Optimizer Agent',
            description: 'Optimizes schedules for focus time and efficiency',
            capabilities: ['schedule_optimization', 'focus_time_protection', 'batch_similar'],
            defaultModel: 'gpt-5-mini',
            priority: 2,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const { upcomingEvents, userProfile } = task.context;
        const workingHours = userProfile?.workingHours || { start: 9, end: 17 };
        const prompt = this.buildPrompt(`You are a calendar optimization assistant. Analyze the schedule and suggest optimizations.

Working Hours: ${workingHours.start}:00 - ${workingHours.end}:00

Return a JSON object with:
- suggestions: Array of optimization suggestions with { type, description, impact, timeSlots }
- focusTimeBlocks: Array of suggested focus time blocks with { start, end, reason }
- conflicts: Array of identified conflicts
- efficiency Score: 0-100

Current schedule:`, { events: upcomingEvents || [], input }, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.4,
            maxTokens: 800,
        });
        return this.parseJSON(result.content, {
            suggestions: [],
            focusTimeBlocks: [],
            conflicts: [],
            efficiencyScore: 50,
        });
    }
    calculateConfidence(output) {
        // Higher confidence with more data
        if (output.suggestions && output.suggestions.length > 0) {
            return 0.88;
        }
        return 0.75;
    }
}
//# sourceMappingURL=optimizer-agent.js.map