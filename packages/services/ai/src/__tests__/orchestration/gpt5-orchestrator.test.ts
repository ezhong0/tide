/**
 * GPT-5 Orchestrator Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GPT5Orchestrator } from '../../orchestration/gpt5-orchestrator.js';
import { toolRegistry } from '../../tools/registry.js';
import type { TideTool, ToolContext } from '../../tools/types.js';
import type { AIRequest } from '@tide/contracts';

// Create a shared mock function that all tests can access
const mockCreate = vi.fn();

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe('GPT5Orchestrator', () => {
  let orchestrator: GPT5Orchestrator;
  let mockContext: ToolContext;

  beforeEach(() => {
    // Clear tool registry
    toolRegistry.clear();

    // Reset mock
    mockCreate.mockReset();

    orchestrator = new GPT5Orchestrator({
      apiKey: 'test-api-key',
      model: 'gpt-5-mini',
    });

    mockContext = {
      userId: 'test-user',
      requestId: 'test-request',
      timestamp: Date.now(),
    };
  });

  describe('process', () => {
    it('handles simple request without tool calls', async () => {
      const request: AIRequest = {
        userId: 'test-user',
        content: 'Hello, how are you?',
        context: {},
      };

      // Mock OpenAI response
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'I\'m doing well, thank you!',
              tool_calls: null,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          total_tokens: 50,
        },
      });

      const response = await orchestrator.process(request, mockContext);

      expect(response.content).toBe('I\'m doing well, thank you!');
      expect(response.requestId).toBe(mockContext.requestId);
      expect(response.tokensUsed).toBe(50);
    });

    it('executes tool calls and continues conversation', async () => {
      // Register a test tool
      const searchTool: TideTool = {
        type: 'function',
        name: 'search_test',
        description: 'Search for test data',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
        handler: async (params) => ({
          results: [`Result for: ${params.query}`],
        }),
      };

      toolRegistry.register(searchTool);

      const request: AIRequest = {
        userId: 'test-user',
        content: 'Search for documents',
        context: {},
      };

      // First call: GPT decides to call tool
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'search_test',
                    arguments: JSON.stringify({ query: 'documents' }),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { total_tokens: 100 },
      });

      // Second call: GPT responds with results
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'I found 1 document for you.',
              tool_calls: null,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { total_tokens: 150 },
      });

      const response = await orchestrator.process(request, mockContext);

      expect(response.content).toBe('I found 1 document for you.');
      expect(response.metadata).toHaveProperty('executionLog');
      expect((response.metadata as any).executionLog).toHaveLength(1);
      expect((response.metadata as any).executionLog[0].tool).toBe('search_test');
      expect((response.metadata as any).executionLog[0].success).toBe(true);
    });

    it('handles tool execution errors gracefully', async () => {
      // Register a failing tool
      const failingTool: TideTool = {
        type: 'function',
        name: 'failing_tool',
        description: 'Always fails',
        handler: async () => {
          throw new Error('Tool error');
        },
      };

      toolRegistry.register(failingTool);

      const request: AIRequest = {
        userId: 'test-user',
        content: 'Use the failing tool',
        context: {},
      };

      // First call: GPT calls failing tool
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_456',
                  type: 'function',
                  function: {
                    name: 'failing_tool',
                    arguments: JSON.stringify({}),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { total_tokens: 80 },
      });

      // Second call: GPT handles error
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'I encountered an error with that tool.',
              tool_calls: null,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { total_tokens: 120 },
      });

      const response = await orchestrator.process(request, mockContext);

      expect(response.content).toBe('I encountered an error with that tool.');
      expect((response.metadata as any).executionLog[0].success).toBe(false);
      expect((response.metadata as any).executionLog[0].error).toContain('Tool error');
    });

    it('stops after max iterations', async () => {
      const orchestratorWithLowMax = new GPT5Orchestrator({
        apiKey: 'test-api-key',
        model: 'gpt-5-mini',
        maxIterations: 2,
      });

      const request: AIRequest = {
        userId: 'test-user',
        content: 'Infinite loop test',
        context: {},
      };

      // Always return tool calls (infinite loop)
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_loop',
                  type: 'function',
                  function: {
                    name: 'search_test',
                    arguments: JSON.stringify({ query: 'loop' }),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { total_tokens: 50 },
      });

      // Register tool
      toolRegistry.register({
        type: 'function',
        name: 'search_test',
        description: 'Test',
        handler: async () => ({ ok: true }),
      });

      const response = await orchestratorWithLowMax.process(request, mockContext);

      // Should stop at max iterations
      expect((response.metadata as any).iterations).toBe(2);
    });
  });

  describe('confidence calculation', () => {
    it('calculates confidence based on tool success rate', async () => {
      // Register mixed success tools
      toolRegistry.register({
        type: 'function',
        name: 'success_tool',
        description: 'Succeeds',
        handler: async () => ({ ok: true }),
      });

      toolRegistry.register({
        type: 'function',
        name: 'fail_tool',
        description: 'Fails',
        handler: async () => {
          throw new Error('Fail');
        },
      });

      const request: AIRequest = {
        userId: 'test-user',
        content: 'Test confidence',
        context: {},
      };

      // Call both tools
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_1',
                  type: 'function',
                  function: {
                    name: 'success_tool',
                    arguments: JSON.stringify({}),
                  },
                },
                {
                  id: 'call_2',
                  type: 'function',
                  function: {
                    name: 'fail_tool',
                    arguments: JSON.stringify({}),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { total_tokens: 100 },
      });

      // Final response
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Mixed results',
              tool_calls: null,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { total_tokens: 120 },
      });

      const response = await orchestrator.process(request, mockContext);

      // 1 success out of 2 = 0.5 confidence
      expect(response.confidence).toBe(0.5);
    });
  });
});
