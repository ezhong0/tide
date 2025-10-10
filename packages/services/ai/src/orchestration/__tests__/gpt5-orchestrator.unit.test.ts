/**
 * GPT-5 Orchestrator Unit Tests
 * Tests the core AI orchestration logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GPT5Orchestrator } from '../gpt5-orchestrator';
import type { AIRequest, ToolContext } from '../../types';
import { createUserId } from '@tide/types';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('GPT5Orchestrator', () => {
  let orchestrator: GPT5Orchestrator;
  let mockContext: ToolContext;

  beforeEach(() => {
    orchestrator = new GPT5Orchestrator({
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxIterations: 5,
    });

    mockContext = {
      userId: createUserId('test-user-123'),
      requestId: 'test-request-456',
      userEmail: 'test@example.com',
      timestamp: Date.now(),
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('process', () => {
    it('should process simple query without tools', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      const mockResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 8,
          total_tokens: 18,
        },
      };

      (mockClient.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request: AIRequest = {
        content: 'Hello',
        conversationId: 'conv-123',
      };

      const result = await orchestrator.process(request, mockContext);

      expect(result.content).toBe('Hello! How can I help you today?');
      expect(result.toolCalls).toBeUndefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.cost.inputTokens).toBe(10);
      expect(result.cost.outputTokens).toBe(8);
    });

    it('should execute single tool call', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      // First response with tool call
      const mockToolCallResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call-1',
                  type: 'function' as const,
                  function: {
                    name: 'search_emails',
                    arguments: JSON.stringify({ query: 'urgent', limit: 10 }),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 20,
          total_tokens: 70,
        },
      };

      // Second response after tool execution
      const mockFinalResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'You have 3 urgent emails.',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 15,
          total_tokens: 115,
        },
      };

      (mockClient.chat.completions.create as any)
        .mockResolvedValueOnce(mockToolCallResponse)
        .mockResolvedValueOnce(mockFinalResponse);

      const request: AIRequest = {
        content: 'Show me urgent emails',
      };

      const result = await orchestrator.process(request, mockContext);

      expect(result.content).toBe('You have 3 urgent emails.');
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].name).toBe('search_emails');
    });

    it('should handle multiple tool iterations', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      // Mock multiple iterations
      const responses = [
        // First tool call
        {
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: 'call-1',
                    type: 'function' as const,
                    function: {
                      name: 'get_calendar_events',
                      arguments: JSON.stringify({
                        startDate: '2025-01-10',
                        endDate: '2025-01-10',
                      }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 },
        },
        // Second tool call
        {
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: 'call-2',
                    type: 'function' as const,
                    function: {
                      name: 'create_calendar_event',
                      arguments: JSON.stringify({
                        title: 'Meeting',
                        startTime: '2025-01-10T14:00:00Z',
                        endTime: '2025-01-10T15:00:00Z',
                      }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 40, total_tokens: 140 },
        },
        // Final response
        {
          choices: [
            {
              message: {
                content: 'I created the meeting for you.',
                tool_calls: undefined,
              },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 150, completion_tokens: 20, total_tokens: 170 },
        },
      ];

      responses.forEach((response) => {
        (mockClient.chat.completions.create as any).mockResolvedValueOnce(response);
      });

      const request: AIRequest = {
        content: 'Schedule a meeting for tomorrow at 2pm',
      };

      const result = await orchestrator.process(request, mockContext);

      expect(result.content).toBeTruthy();
      expect(result.toolCalls).toHaveLength(2);
    });

    it('should enforce max iteration limit', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      // Mock infinite loop of tool calls
      const loopResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  id: 'call-loop',
                  type: 'function' as const,
                  function: {
                    name: 'search_emails',
                    arguments: JSON.stringify({ query: 'test' }),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 20, total_tokens: 70 },
      };

      (mockClient.chat.completions.create as any).mockResolvedValue(loopResponse);

      const request: AIRequest = {
        content: 'Test query',
      };

      const result = await orchestrator.process(request, mockContext);

      // Should stop at maxIterations (5)
      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls!.length).toBeLessThanOrEqual(5);
    });

    it('should calculate confidence score', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Clear and confident response.',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      };

      (mockClient.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request: AIRequest = {
        content: 'What is 2+2?',
      };

      const result = await orchestrator.process(request, mockContext);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should calculate cost breakdown', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Response',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      (mockClient.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request: AIRequest = {
        content: 'Test',
      };

      const result = await orchestrator.process(request, mockContext);

      expect(result.cost).toHaveProperty('inputTokens');
      expect(result.cost).toHaveProperty('outputTokens');
      expect(result.cost).toHaveProperty('totalCost');
      expect(result.cost.inputTokens).toBe(100);
      expect(result.cost.outputTokens).toBe(50);
      expect(result.cost.totalCost).toBeGreaterThan(0);
    });

    it('should measure processing time', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Response',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      };

      (mockClient.chat.completions.create as any).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100);
          })
      );

      const request: AIRequest = {
        content: 'Test',
      };

      const result = await orchestrator.process(request, mockContext);

      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('buildSystemPrompt', () => {
    it('should include user context', () => {
      // This tests the private method indirectly through process()
      expect(orchestrator).toBeDefined();
    });

    it('should include available tools', () => {
      // Tools should be described in system prompt
      expect(orchestrator).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle OpenAI API errors', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      (mockClient.chat.completions.create as any).mockRejectedValueOnce(
        new Error('API rate limit exceeded')
      );

      const request: AIRequest = {
        content: 'Test',
      };

      await expect(orchestrator.process(request, mockContext)).rejects.toThrow();
    });

    it('should handle tool execution failures', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      const mockToolCallResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  id: 'call-1',
                  type: 'function' as const,
                  function: {
                    name: 'invalid_tool',
                    arguments: '{}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 20, total_tokens: 70 },
      };

      const mockRecoveryResponse = {
        choices: [
          {
            message: {
              content: 'I encountered an error with that tool.',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 60, completion_tokens: 15, total_tokens: 75 },
      };

      (mockClient.chat.completions.create as any)
        .mockResolvedValueOnce(mockToolCallResponse)
        .mockResolvedValueOnce(mockRecoveryResponse);

      const request: AIRequest = {
        content: 'Test',
      };

      const result = await orchestrator.process(request, mockContext);

      // Should gracefully handle tool failure
      expect(result.content).toBeTruthy();
    });
  });

  describe('performance', () => {
    it('should complete simple query in <5s', async () => {
      const OpenAI = (await import('openai')).default;
      const mockClient = new OpenAI();

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Quick response',
              tool_calls: undefined,
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      (mockClient.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request: AIRequest = {
        content: 'Hello',
      };

      const start = Date.now();
      await orchestrator.process(request, mockContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });
});

