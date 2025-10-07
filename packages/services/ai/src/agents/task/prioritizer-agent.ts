/**
 * Task Prioritizer Agent
 * Prioritizes tasks based on importance, urgency, and impact
 */

import type { AgentTask, AgentConfig } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';

export class TaskPrioritizerAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'task.prioritizer',
      name: 'Task Prioritizer Agent',
      description: 'Prioritizes tasks based on importance, urgency, and impact',
      capabilities: ['importance_scoring', 'urgency_detection', 'impact_analysis'],
      defaultModel: 'gpt-5-nano',
      priority: 1,
      enabled: true,
    };
    super(config);
  }

  protected async run(task: AgentTask, context: AgentExecutionContext): Promise<any> {
    const { input } = task;
    const { activeTasks } = task.context;

    const prompt = this.buildPrompt(
      `You are a task prioritization assistant. Analyze the following tasks and prioritize them.

Return a JSON object with:
- prioritizedTasks: Array of tasks sorted by priority with { id, priority, urgency, importance, impact, reasoning }
- insights: Array of insights about the task list
- suggestions: Array of actionable suggestions

Tasks to prioritize:`,
      { tasks: activeTasks || [], newTask: input },
      task.context
    );

    const result = await context.modelClient.complete(prompt, {
      temperature: 0.3,
      maxTokens: 700,
    });

    return this.parseJSON(result.content, {
      prioritizedTasks: [],
      insights: [],
      suggestions: [],
    });
  }

  protected calculateConfidence(output: any): number {
    // Task prioritization is generally reliable
    return 0.9;
  }
}
