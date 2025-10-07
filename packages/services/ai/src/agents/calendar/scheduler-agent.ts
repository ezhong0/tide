/**
 * Scheduling Agent
 * Finds optimal meeting times and resolves conflicts
 */

import type { AgentTask, AgentConfig } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';

export class SchedulingAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'calendar.scheduler',
      name: 'Scheduling Agent',
      description: 'Finds optimal meeting times and resolves conflicts',
      capabilities: ['optimal_time_finding', 'conflict_resolution', 'travel_time'],
      defaultModel: 'gpt-5-mini',
      priority: 2,
      enabled: true,
    };
    super(config);
  }

  protected async run(task: AgentTask, context: AgentExecutionContext): Promise<any> {
    const { input } = task;
    const { upcomingEvents, userProfile } = task.context;

    const workingHours = userProfile?.workingHours || { start: 9, end: 17 };

    const prompt = this.buildPrompt(
      `You are a scheduling assistant. Find optimal meeting times based on the request.

Working Hours: ${workingHours.start}:00 - ${workingHours.end}:00
Current Time: ${new Date(task.context.currentTime).toISOString()}

Return a JSON object with:
- suggestedTimes: Array of { start, end, dayOfWeek, confidence, reason }
- conflicts: Array of identified conflicts
- travelTimeNeeded: boolean
- bufferTime: minutes needed before/after
- alternativeOptions: Array of backup time slots

Scheduling request:`,
      input,
      task.context
    );

    const result = await context.modelClient.complete(prompt, {
      temperature: 0.3,
      maxTokens: 800,
    });

    return this.parseJSON(result.content, {
      suggestedTimes: [],
      conflicts: [],
      travelTimeNeeded: false,
      bufferTime: 15,
      alternativeOptions: [],
    });
  }

  protected calculateConfidence(output: any): number {
    if (output.conflicts && output.conflicts.length === 0) {
      return 0.95;
    }
    return 0.85;
  }
}
