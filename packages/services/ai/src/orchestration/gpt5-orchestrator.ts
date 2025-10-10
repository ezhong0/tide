/**
 * GPT-5 Orchestrator
 * Main orchestration engine using GPT-5 function calling
 */

import OpenAI from 'openai';
import { createLogger } from '@tide/logger';
import { thresholds, timeouts } from '@tide/config';
import { withTimeout } from '@tide/utils';
import { toolRegistry, type ToolContext, type ToolExecutionLog } from '../tools/index.js';
import type { AIRequest, AIResponse } from '@tide/contracts';

const logger = createLogger({ component: 'GPT5Orchestrator' });

export interface GPT5OrchestratorConfig {
  apiKey: string;
  model?: string; // Default: 'gpt-5-mini'
  maxIterations?: number;
  temperature?: number;
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high'; // GPT-5 reasoning depth
  verbosity?: 'low' | 'medium' | 'high'; // GPT-5 answer length control
}

export class GPT5Orchestrator {
  private client: OpenAI;
  private model: string;
  private maxIterations: number;
  private temperature: number;
  private reasoningEffort: 'minimal' | 'low' | 'medium' | 'high';
  private verbosity: 'low' | 'medium' | 'high';

  constructor(config: GPT5OrchestratorConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || 'gpt-5-mini'; // gpt-5, gpt-5-mini, gpt-5-nano
    this.maxIterations = config.maxIterations !== undefined ? config.maxIterations : thresholds.ai.maxIterations;
    this.temperature = config.temperature !== undefined ? config.temperature : thresholds.ai.temperature;
    this.reasoningEffort = config.reasoningEffort || thresholds.ai.reasoningEffort;
    this.verbosity = config.verbosity || thresholds.ai.verbosity;

    logger.info('GPT5Orchestrator initialized', {
      model: this.model,
      maxIterations: this.maxIterations,
      reasoningEffort: this.reasoningEffort,
      verbosity: this.verbosity,
    });
  }

  /**
   * Process a request using GPT-5 function calling
   */
  async process(request: AIRequest, context: ToolContext): Promise<AIResponse> {
    const startTime = Date.now();
    const executionLog: ToolExecutionLog[] = [];

    try {
      // Build conversation messages
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(context),
        },
        {
          role: 'user',
          content: request.content,
        },
      ];

      // Convert tools to OpenAI format
      const tools = this.convertToolsToOpenAIFormat();

      logger.info('Starting GPT-5 orchestration', {
        requestId: context.requestId,
        userId: context.userId,
        toolsAvailable: tools.length,
      });

      let response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools,
        tool_choice: 'auto',
        temperature: this.temperature,
        // Note: reasoning_effort and verbosity are not yet supported in OpenAI SDK
        // Will be enabled when SDK is updated
      });

      let iterations = 0;
      let toolCalls = response.choices[0].message.tool_calls || [];

      // Execute tools iteratively
      while (toolCalls.length > 0 && iterations < this.maxIterations) {
        iterations++;

        logger.debug('GPT-5 iteration', {
          iteration: iterations,
          toolCalls: toolCalls.length,
        });

        // Add assistant's message (with tool calls) to conversation
        messages.push(response.choices[0].message);

        // Execute all tool calls (GPT-5 decides parallel vs sequential)
        const toolResults = await Promise.all(
          toolCalls.map(async (call) => {
            const toolStartTime = Date.now();
            const args = JSON.parse(call.function.arguments);

            try {
              logger.info('Executing tool', {
                tool: call.function.name,
                args,
              });

              // Execute tool with timeout protection
              const result = await withTimeout(
                toolRegistry.execute(call.function.name, args, context),
                timeouts.toolExecution,
                `Tool: ${call.function.name}`
              );

              const log: ToolExecutionLog = {
                tool: call.function.name,
                args,
                result: result.result,
                success: result.success,
                error: result.error,
                executionTime: Date.now() - toolStartTime,
                timestamp: Date.now(),
              };

              executionLog.push(log);

              return {
                tool_call_id: call.id,
                role: 'tool' as const,
                content: JSON.stringify(result.result || { error: result.error }),
              };
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              logger.error('Tool execution failed', {
                tool: call.function.name,
                error: errorMessage,
              });

              const log: ToolExecutionLog = {
                tool: call.function.name,
                args,
                error: errorMessage,
                success: false,
                executionTime: Date.now() - toolStartTime,
                timestamp: Date.now(),
              };

              executionLog.push(log);

              return {
                tool_call_id: call.id,
                role: 'tool' as const,
                content: JSON.stringify({ error: errorMessage }),
              };
            }
          })
        );

        // Add tool results to conversation
        messages.push(...toolResults);

        // Get next response from GPT-5
        response = await this.client.chat.completions.create({
          model: this.model,
          messages,
          tools,
          tool_choice: 'auto',
          temperature: this.temperature,
        });

        toolCalls = response.choices[0].message.tool_calls || [];
      }

      // Final response
      const content = response.choices[0].message.content || '';
      const executionTime = Date.now() - startTime;

      logger.info('GPT-5 orchestration complete', {
        requestId: context.requestId,
        iterations,
        toolsExecuted: executionLog.length,
        executionTime,
      });

      return {
        requestId: context.requestId,
        content,
        intents: this.extractIntentsFromLog(executionLog),
        suggestedActions: [],
        confidence: this.calculateConfidence(executionLog),
        model: {
          primary: 'gpt-5' as any,
          aggregation: 'single' as any,
          reasoning: `Used GPT-5 with ${executionLog.length} tool calls across ${iterations} iterations`,
        },
        tokensUsed: response.usage?.total_tokens || 0,
        cost: this.calculateCost(response.usage?.total_tokens || 0),
        executionTime,
        timestamp: Date.now(),
        metadata: {
          executionLog,
          iterations,
          toolsUsed: Array.from(new Set(executionLog.map(log => log.tool))),
        },
      };
    } catch (error) {
      logger.error('GPT-5 orchestration failed', {
        error,
        requestId: context.requestId,
      });

      throw error;
    }
  }

  /**
   * Build system prompt for GPT-5
   */
  private buildSystemPrompt(context: ToolContext): string {
    const currentTime = new Date(context.timestamp).toISOString();

    return `You are Tide, an AI Chief of Staff assistant. You help users manage their emails, calendar, and tasks efficiently.

Current context:
- Current time: ${currentTime}
- User ID: ${context.userId}
${context.userEmail ? `- User email: ${context.userEmail}` : ''}

Guidelines:
1. **Use tools proactively** to get information and complete tasks
2. **Call multiple tools in parallel** when they don't depend on each other
3. **Always confirm** before taking destructive actions (delete, send email)
4. **Be concise but thorough** in your responses
5. **If a tool fails**, try an alternative approach or explain the issue
6. **Provide context** for your actions so users understand what you're doing

Available tools:
- Email: search_emails, compose_email, send_email, categorize_emails
- Calendar: get_calendar_events, create_calendar_event, find_meeting_times, analyze_calendar_load
- Tasks: create_task, get_tasks, prioritize_tasks, update_task_status

You can call tools multiple times and combine results intelligently. Always prioritize user needs and efficiency.`;
  }

  /**
   * Convert tools to OpenAI function calling format
   */
  private convertToolsToOpenAIFormat(): OpenAI.Chat.ChatCompletionTool[] {
    const tools = toolRegistry.getAll();

    return tools.map(tool => {
      if (tool.type === 'custom') {
        // Custom tools accept free-form text input
        return {
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: 'object',
              properties: {
                input: {
                  type: 'string',
                  description: 'Free-form input for the custom tool',
                },
              },
              required: ['input'],
            },
          },
        };
      }

      // Standard function tools
      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters!,
        },
      };
    });
  }

  /**
   * Extract intents from execution log
   */
  private extractIntentsFromLog(executionLog: ToolExecutionLog[]): any[] {
    const intents: any[] = [];
    const toolCategories = new Set<string>();

    for (const log of executionLog) {
      const [category] = log.tool.split('_');
      toolCategories.add(category);
    }

    // Map tool categories to intent categories
    const categoryMap: Record<string, string> = {
      search: 'email_triage',
      compose: 'email_compose',
      send: 'email_compose',
      get: 'question_answer',
      create: 'task_create',
      find: 'calendar_schedule',
      analyze: 'question_answer',
      prioritize: 'task_prioritize',
    };

    for (const category of toolCategories) {
      const intentCategory = categoryMap[category] || 'question_answer';

      intents.push({
        category: intentCategory,
        confidence: 0.9,
        entities: [],
      });
    }

    return intents;
  }

  /**
   * Calculate confidence based on tool execution success
   */
  private calculateConfidence(executionLog: ToolExecutionLog[]): number {
    if (executionLog.length === 0) return 0.5;

    const successCount = executionLog.filter(log => log.success).length;
    return successCount / executionLog.length;
  }

  /**
   * Calculate cost based on tokens (GPT-5 pricing)
   */
  private calculateCost(tokens: number): number {
    // GPT-5 pricing varies by model:
    // gpt-5: ~$0.015/1K input, ~$0.06/1K output (avg: ~$0.0375/1K)
    // gpt-5-mini: ~$0.008/1K input, ~$0.024/1K output (avg: ~$0.016/1K)
    // gpt-5-nano: ~$0.003/1K input, ~$0.012/1K output (avg: ~$0.0075/1K)
    let costPer1K = 0.016; // Default to gpt-5-mini pricing

    if (this.model.includes('gpt-5-nano')) {
      costPer1K = 0.0075;
    } else if (this.model.includes('gpt-5-mini')) {
      costPer1K = 0.016;
    } else if (this.model.includes('gpt-5')) {
      costPer1K = 0.0375;
    }

    return (tokens / 1000) * costPer1K;
  }
}
