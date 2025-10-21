/**
 * Behavior Validation Tests
 *
 * Data-driven tests that verify expected behavior for known scenarios.
 * Test cases are defined in function-calling-scenarios.json
 *
 * To add new test cases, just add them to the JSON file.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { GPT5Orchestrator } from '../../orchestration/gpt5-orchestrator.js';
import { toolRegistry, initializeTools, type ToolContext } from '../../tools/index.js';
import type { AIRequest } from '@tide/contracts';
import scenarios from './function-calling-scenarios.json';

const SKIP_TESTS = process.env.SKIP_E2E_TESTS === 'true';
const API_KEY = process.env.OPENAI_API_KEY;

interface TestScenario {
  id: string;
  description: string;
  input: string;
  expectedTool?: string;
  expectedTools?: string[];
  expectedParams?: Record<string, any>;
  notExpectedTools?: string[];
  expectedInResponse?: string;
  allowAnyResponse?: boolean;
  minResponseLength?: number;
  minIterations?: number;
}

describe.skipIf(SKIP_TESTS || !API_KEY)('Behavior Validation Tests', () => {
  let orchestrator: GPT5Orchestrator;
  let mockContext: ToolContext;

  beforeAll(() => {
    toolRegistry.clear();
    initializeTools({
      includeIntelligenceTools: false,
      includeCustomTools: false,
    });

    mockBackendServices();

    orchestrator = new GPT5Orchestrator({
      apiKey: API_KEY!,
      model: 'gpt-4-turbo',
      maxIterations: 5,
    });

    mockContext = {
      userId: 'behavior-test-user',
      requestId: 'behavior-test-request',
      userEmail: 'test@tide.ai',
      timestamp: Date.now(),
    };
  });

  // Generate test cases from scenarios
  scenarios.scenarios.forEach((scenario: TestScenario) => {
    it(`[${scenario.id}] ${scenario.description}`, async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: scenario.input,
        context: {},
      };

      const response = await orchestrator.process(request, {
        ...mockContext,
        requestId: `${scenario.id}-${Date.now()}`,
      });

      // Validate expected single tool
      if (scenario.expectedTool) {
        expect(
          response.metadata?.toolsUsed,
          `Expected tool '${scenario.expectedTool}' to be called`
        ).toContain(scenario.expectedTool);
      }

      // Validate expected multiple tools
      if (scenario.expectedTools) {
        scenario.expectedTools.forEach(tool => {
          expect(
            response.metadata?.toolsUsed,
            `Expected tool '${tool}' to be called`
          ).toContain(tool);
        });
      }

      // Validate tools that should NOT be called
      if (scenario.notExpectedTools) {
        scenario.notExpectedTools.forEach(tool => {
          expect(
            response.metadata?.toolsUsed,
            `Tool '${tool}' should NOT be called`
          ).not.toContain(tool);
        });
      }

      // Validate no tools called (for direct responses)
      if (scenario.expectedTools?.length === 0) {
        expect(
          response.metadata?.toolsUsed.length,
          'No tools should be called for this query'
        ).toBe(0);
      }

      // Validate parameters
      if (scenario.expectedParams) {
        const execution = response.metadata?.executionLog.find(
          (log: any) => log.tool === scenario.expectedTool
        );

        expect(execution, `Execution log for '${scenario.expectedTool}' not found`).toBeDefined();

        Object.entries(scenario.expectedParams).forEach(([key, expectedValue]) => {
          const actualValue = execution.args[key];

          // Special handling for different validation types
          if (expectedValue === 'date') {
            expect(actualValue, `${key} should be a valid date`).toBeTruthy();
            expect(
              () => new Date(actualValue).toISOString(),
              `${key} should be ISO date`
            ).not.toThrow();
          } else if (expectedValue === 'today' || expectedValue === 'tomorrow') {
            // Just verify it's a date, don't validate exact value
            expect(actualValue, `${key} should be present`).toBeTruthy();
          } else if (Array.isArray(expectedValue)) {
            expect(Array.isArray(actualValue), `${key} should be an array`).toBe(true);
            // Check that actual contains expected items (fuzzy match)
            expectedValue.forEach(expectedItem => {
              const found = actualValue.some((item: string) =>
                item.toLowerCase().includes(expectedItem.toLowerCase())
              );
              expect(found, `${key} should contain '${expectedItem}'`).toBe(true);
            });
          } else if (typeof expectedValue === 'string') {
            // Fuzzy string matching
            const actualStr = String(actualValue).toLowerCase();
            const expectedStr = String(expectedValue).toLowerCase();
            expect(
              actualStr.includes(expectedStr) || expectedStr.includes(actualStr),
              `${key}: expected '${actualValue}' to match '${expectedValue}'`
            ).toBe(true);
          } else {
            expect(actualValue, `${key} mismatch`).toBe(expectedValue);
          }
        });
      }

      // Validate response content
      if (scenario.expectedInResponse) {
        expect(
          response.content.toLowerCase(),
          `Response should mention '${scenario.expectedInResponse}'`
        ).toContain(scenario.expectedInResponse.toLowerCase());
      }

      // Validate minimum response length
      if (scenario.minResponseLength) {
        expect(
          response.content.length,
          `Response should be at least ${scenario.minResponseLength} characters`
        ).toBeGreaterThanOrEqual(scenario.minResponseLength);
      }

      // Validate minimum iterations (for multi-step tasks)
      if (scenario.minIterations) {
        expect(
          response.metadata?.iterations,
          `Should have at least ${scenario.minIterations} iterations`
        ).toBeGreaterThanOrEqual(scenario.minIterations);
      }

      // Always validate that we got a response
      if (!scenario.allowAnyResponse) {
        expect(response.content, 'Response content should not be empty').toBeTruthy();
        expect(response.content.length, 'Response should be meaningful').toBeGreaterThan(10);
      }
    }, 30000); // 30 second timeout for API calls
  });
});

/**
 * Mock backend services
 */
function mockBackendServices() {
  const originalFetch = global.fetch;

  (global as any).fetch = async (url: string, options?: any) => {
    // Mock all backend service responses
    if (url.includes('/api/emails/search')) {
      return {
        ok: true,
        json: async () => ({
          emails: [{ id: '1', subject: 'Test', from: 'test@example.com' }],
          count: 1,
        }),
      };
    }

    if (url.includes('/api/emails/compose')) {
      return {
        ok: true,
        json: async () => ({
          body: 'Composed email body',
          subject: 'Test Subject',
        }),
      };
    }

    if (url.includes('/api/emails/send')) {
      return {
        ok: true,
        json: async () => ({ messageId: 'msg-123' }),
      };
    }

    if (url.includes('/api/emails/categorize')) {
      return {
        ok: true,
        json: async () => ({
          results: [{ emailId: '1', category: 'important', priority: 8 }],
        }),
      };
    }

    if (url.includes('/api/calendar/events')) {
      if (options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            id: 'event-123',
            title: 'Created Event',
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          events: [
            {
              id: '1',
              title: 'Team Meeting',
              startTime: '2025-10-21T14:00:00Z',
              endTime: '2025-10-21T15:00:00Z',
            },
          ],
        }),
      };
    }

    if (url.includes('/api/calendar/find-slots')) {
      return {
        ok: true,
        json: async () => ({
          slots: [
            {
              startTime: '2025-10-22T14:00:00Z',
              endTime: '2025-10-22T14:30:00Z',
              score: 0.9,
            },
          ],
        }),
      };
    }

    if (url.includes('/api/calendar/analyze')) {
      return {
        ok: true,
        json: async () => ({
          summary: 'Calendar analysis results',
          busyHours: 32,
          freeHours: 8,
        }),
      };
    }

    if (url.includes('/api/tasks')) {
      if (options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            id: 'task-123',
            title: 'Created Task',
            status: 'pending',
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          tasks: [
            { id: 'task-1', title: 'Test Task', priority: 'high', status: 'pending' },
          ],
        }),
      };
    }

    if (url.includes('/api/tasks/') && url.includes('/status')) {
      return {
        ok: true,
        json: async () => ({
          id: 'task-123',
          status: 'completed',
        }),
      };
    }

    if (url.includes('/api/tasks/prioritize')) {
      return {
        ok: true,
        json: async () => ({
          prioritized: [{ id: 'task-1', priority: 9, reasoning: 'Most urgent' }],
        }),
      };
    }

    return originalFetch?.(url, options) || {
      ok: false,
      statusText: 'Service not available',
    };
  };
}
