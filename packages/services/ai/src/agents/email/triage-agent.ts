/**
 * Email Triage Agent
 * Analyzes emails and determines priority, urgency, and classification
 */

import type { AgentTask, AgentConfig } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';

export class EmailTriageAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'email.triager',
      name: 'Email Triage Agent',
      description: 'Analyzes emails for priority, urgency, and classification',
      capabilities: ['priority_detection', 'urgency_analysis', 'sender_importance'],
      defaultModel: 'gpt-5-nano',
      priority: 1,
      enabled: true,
    };
    super(config);
  }

  protected async run(task: AgentTask, context: AgentExecutionContext): Promise<any> {
    const { input } = task;

    const prompt = this.buildPrompt(
      `You are an email triage assistant. Analyze the following email and classify it.

Return a JSON object with:
- priority: "low" | "normal" | "high"
- urgency: "low" | "normal" | "high"
- category: "work" | "personal" | "promotional" | "social" | "spam"
- requiresResponse: boolean
- estimatedResponseTime: number (in minutes)
- actionItems: string[] (list of action items extracted from email)
- sentiment: "positive" | "neutral" | "negative"

Email to analyze:`,
      input,
      task.context
    );

    const result = await context.modelClient.complete(prompt, {
      temperature: 0.3,
      maxTokens: 500,
    });

    return this.parseJSON(result.content, {
      priority: 'normal',
      urgency: 'normal',
      category: 'work',
      requiresResponse: false,
      estimatedResponseTime: 0,
      actionItems: [],
      sentiment: 'neutral',
    });
  }

  protected calculateConfidence(output: any): number {
    // Higher confidence for clearer classifications
    if (output.priority === 'high' || output.urgency === 'high') {
      return 0.9;
    }
    return 0.85;
  }
}
