/**
 * Base Agent Class
 * All specialized agents extend this base class
 */

import { createLogger } from '@tide/logger';
import type {
  AgentType,
  AgentConfig,
  AgentTask,
  AgentResult,
  ModelFamily,
} from '@tide/contracts';
import type { ModelClient, AgentExecutionContext } from '../types/index.js';

const logger = createLogger({ component: 'BaseAgent' });

export abstract class BaseAgent {
  protected logger: ReturnType<typeof createLogger>;

  constructor(protected config: AgentConfig) {
    this.logger = createLogger({ component: `Agent`, agentType: config.type });
  }

  /**
   * Execute the agent's task
   */
  async execute(task: AgentTask, context: AgentExecutionContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      this.logger.debug('Executing agent task', {
        agentType: this.config.type,
        requestId: context.requestId,
      });

      // Run the agent-specific logic
      const output = await this.run(task, context);

      const executionTime = Date.now() - startTime;

      this.logger.info('Agent task completed', {
        agentType: this.config.type,
        executionTime,
        requestId: context.requestId,
      });

      return {
        agentType: this.config.type,
        output,
        confidence: this.calculateConfidence(output),
        executionTime,
        tokensUsed: 0, // Will be tracked by model client
        model: this.config.defaultModel,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('Agent task failed', {
        agentType: this.config.type,
        error,
        requestId: context.requestId,
      });

      return {
        agentType: this.config.type,
        output: null,
        confidence: 0,
        executionTime,
        tokensUsed: 0,
        model: this.config.defaultModel,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Agent-specific execution logic (implemented by subclasses)
   */
  protected abstract run(task: AgentTask, context: AgentExecutionContext): Promise<any>;

  /**
   * Calculate confidence score for the output
   */
  protected calculateConfidence(output: any): number {
    // Default implementation - subclasses can override
    if (!output) return 0;
    return 0.8; // Default confidence
  }

  /**
   * Build a prompt for the model
   */
  protected buildPrompt(instruction: string, data: any, context: AgentTask['context']): string {
    const parts: string[] = [instruction];

    // Add context if available
    if (context.currentTime) {
      const date = new Date(context.currentTime);
      parts.push(`\nCurrent time: ${date.toISOString()}`);
    }

    if (context.timezone) {
      parts.push(`Timezone: ${context.timezone}`);
    }

    // Add the data
    if (typeof data === 'string') {
      parts.push(`\n${data}`);
    } else {
      parts.push(`\n${JSON.stringify(data, null, 2)}`);
    }

    return parts.join('\n');
  }

  /**
   * Parse JSON response safely
   */
  protected parseJSON<T>(text: string, fallback: T): T {
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      this.logger.warn('Failed to parse JSON response', { error });
      return fallback;
    }
  }
}
