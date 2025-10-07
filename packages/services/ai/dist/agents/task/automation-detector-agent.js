/**
 * Automation Detector Agent
 * Identifies patterns and suggests automation opportunities
 */
import { BaseAgent } from '../base-agent';
export class AutomationDetectorAgent extends BaseAgent {
    constructor() {
        const config = {
            type: 'task.automator',
            name: 'Automation Detector Agent',
            description: 'Identifies automation opportunities',
            capabilities: ['pattern_recognition', 'automation_suggestion', 'workflow_creation'],
            defaultModel: 'gpt-5-mini',
            priority: 2,
            enabled: true,
        };
        super(config);
    }
    async run(task, context) {
        const { input } = task;
        const { activeTasks } = task.context;
        const prompt = this.buildPrompt(`You are an automation detection assistant. Analyze tasks to identify automation opportunities.

Return a JSON object with:
- patterns: Array of { pattern: string, frequency: number, confidence: 0-1 }
- automationOpportunities: Array of {
    name: string,
    description: string,
    estimatedTimeSaved: minutes per week,
    complexity: "low" | "medium" | "high",
    steps: Array of automation steps,
    triggers: Array of automation triggers,
    roi: estimated return on investment
  }
- repetitiveTasks: Array of tasks that repeat regularly
- manualProcesses: Array of processes that could be automated
- recommendations: Prioritized list of automation suggestions

Task analysis:`, { input, recentTasks: activeTasks || [] }, task.context);
        const result = await context.modelClient.complete(prompt, {
            temperature: 0.5,
            maxTokens: 900,
        });
        return this.parseJSON(result.content, {
            patterns: [],
            automationOpportunities: [],
            repetitiveTasks: [],
            manualProcesses: [],
            recommendations: [],
        });
    }
    calculateConfidence(output) {
        const hasOpportunities = output.automationOpportunities?.length > 0;
        return hasOpportunities ? 0.85 : 0.75;
    }
}
//# sourceMappingURL=automation-detector-agent.js.map