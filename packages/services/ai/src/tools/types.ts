/**
 * Tool System Types for GPT-5 Function Calling
 */

import type { Request } from 'express';

/**
 * Context provided to tools during execution
 */
export interface ToolContext {
  userId: string;
  requestId: string;
  userEmail?: string;
  timestamp: number;
}

/**
 * Base tool definition
 */
export interface TideTool {
  type: 'function' | 'custom';
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties: Record<string, ParameterDefinition>;
    required?: string[];
  };
  handler: (params: any, context: ToolContext) => Promise<any>;
}

/**
 * Parameter definition for function tools
 */
export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: ParameterDefinition;
  properties?: Record<string, ParameterDefinition>;
  required?: string[];
  minimum?: number;
  maximum?: number;
}

/**
 * Result from tool execution
 */
export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
}

/**
 * Log entry for tool execution
 */
export interface ToolExecutionLog {
  tool: string;
  args: any;
  result?: any;
  error?: string;
  success: boolean;
  executionTime: number;
  timestamp: number;
}
