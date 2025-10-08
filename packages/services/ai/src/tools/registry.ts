/**
 * Tool Registry
 * Central registry for all GPT-5 callable tools
 */

import { createLogger } from '@tide/logger';
import type { TideTool, ToolContext, ToolExecutionResult } from './types.js';

const logger = createLogger({ component: 'ToolRegistry' });

export class ToolRegistry {
  private tools: Map<string, TideTool> = new Map();

  /**
   * Register a tool
   */
  register(tool: TideTool): void {
    if (this.tools.has(tool.name)) {
      logger.warn('Tool already registered, overwriting', { name: tool.name });
    }

    this.tools.set(tool.name, tool);
    logger.info('Tool registered', {
      name: tool.name,
      type: tool.type,
    });
  }

  /**
   * Register multiple tools at once
   */
  registerAll(tools: TideTool[]): void {
    tools.forEach(tool => this.register(tool));
  }

  /**
   * Get a tool by name
   */
  get(name: string): TideTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): TideTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Execute a tool
   */
  async execute(
    name: string,
    params: any,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const tool = this.tools.get(name);

    if (!tool) {
      logger.error('Tool not found', { name });
      return {
        success: false,
        error: `Tool not found: ${name}`,
        executionTime: Date.now() - startTime,
      };
    }

    try {
      logger.debug('Executing tool', {
        name,
        params,
        userId: context.userId,
      });

      const result = await tool.handler(params, context);
      const executionTime = Date.now() - startTime;

      logger.info('Tool executed successfully', {
        name,
        executionTime,
        userId: context.userId,
      });

      return {
        success: true,
        result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error('Tool execution failed', {
        name,
        error,
        executionTime,
        userId: context.userId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Clear all tools (mainly for testing)
   */
  clear(): void {
    this.tools.clear();
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
