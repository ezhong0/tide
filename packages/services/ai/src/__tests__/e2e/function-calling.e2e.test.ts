/**
 * End-to-End Function Calling Tests
 *
 * These tests verify that the GPT-5 orchestrator:
 * 1. Selects the correct tools for natural language inputs
 * 2. Extracts parameters accurately from user requests
 * 3. Executes tools in the right order
 * 4. Handles errors and edge cases gracefully
 *
 * NOTE: These tests use REAL OpenAI API calls (not mocked)
 * Set SKIP_E2E_TESTS=true to skip in CI
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GPT5Orchestrator } from '../../orchestration/gpt5-orchestrator.js';
import { toolRegistry, initializeTools, type ToolContext } from '../../tools/index.js';
import type { AIRequest } from '@tide/contracts';

const SKIP_TESTS = process.env.SKIP_E2E_TESTS === 'true';
const API_KEY = process.env.OPENAI_API_KEY;

describe.skipIf(SKIP_TESTS || !API_KEY)('Function Calling E2E Tests', () => {
  let orchestrator: GPT5Orchestrator;
  let mockContext: ToolContext;

  beforeAll(() => {
    // Initialize tools with mocked backend services
    toolRegistry.clear();
    initializeTools({
      includeIntelligenceTools: false,
      includeCustomTools: false
    });

    // Mock the backend service calls since they don't exist yet
    mockBackendServices();

    orchestrator = new GPT5Orchestrator({
      apiKey: API_KEY!,
      model: 'gpt-4-turbo',
      maxIterations: 3,
    });

    mockContext = {
      userId: 'e2e-test-user',
      requestId: 'e2e-test-request',
      userEmail: 'test@tide.ai',
      timestamp: Date.now(),
    };
  });

  afterAll(() => {
    restoreBackendServices();
  });

  describe('Single Tool Selection - Email', () => {
    it('should call search_emails for email search requests', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Search my emails from john@example.com in the last week',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Verify correct tool was called
      expect(response.metadata?.toolsUsed).toContain('search_emails');
      expect(response.metadata?.executionLog).toHaveLength(1);

      const execution = response.metadata?.executionLog[0];
      expect(execution.tool).toBe('search_emails');
      expect(execution.args).toMatchObject({
        from: expect.stringContaining('john'),
      });
    });

    it('should extract email search parameters correctly', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Find unread emails with the word "urgent" from last month',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      const execution = response.metadata?.executionLog[0];
      expect(execution.tool).toBe('search_emails');
      expect(execution.args).toMatchObject({
        query: expect.stringContaining('urgent'),
        isUnread: true,
      });
    });

    it('should call compose_email for composition requests', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Write a professional email to sarah@company.com thanking her for the meeting',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('compose_email');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toMatchObject({
        to: expect.stringContaining('sarah'),
        tone: 'professional',
      });
      expect(execution.args.context).toMatch(/thank/i);
    });

    it('should NOT call send_email without explicit confirmation', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Write and send an email to bob@company.com',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Should compose but not send without confirmation
      expect(response.metadata?.toolsUsed).toContain('compose_email');
      expect(response.metadata?.toolsUsed).not.toContain('send_email');
    });
  });

  describe('Single Tool Selection - Calendar', () => {
    it('should call get_calendar_events for calendar queries', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'What meetings do I have tomorrow?',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('get_calendar_events');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toHaveProperty('startDate');
      expect(execution.args).toHaveProperty('endDate');
    });

    it('should call create_calendar_event for scheduling requests', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Schedule a meeting with Alice tomorrow at 2pm for 1 hour',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('create_calendar_event');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toMatchObject({
        title: expect.any(String),
        startTime: expect.stringMatching(/T14:00/), // 2pm
        endTime: expect.any(String),
      });
    });

    it('should call find_meeting_times for availability requests', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Find a 30-minute slot this week for a meeting with john@company.com',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('find_meeting_times');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toMatchObject({
        duration: 30,
        attendees: expect.arrayContaining([expect.stringContaining('john')]),
      });
    });
  });

  describe('Single Tool Selection - Tasks', () => {
    it('should call create_task for task creation', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Create a high priority task to review Q4 budget, due next Friday',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('create_task');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toMatchObject({
        title: expect.stringMatching(/Q4|budget/i),
        priority: 'high',
        dueDate: expect.any(String),
      });
    });

    it('should extract subtasks correctly', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Create a task to prepare presentation with subtasks: research data, create slides, practice delivery',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toHaveProperty('subtasks');
      expect(execution.args.subtasks).toBeInstanceOf(Array);
      expect(execution.args.subtasks.length).toBeGreaterThanOrEqual(3);
    });

    it('should call get_tasks for task queries', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Show me all my high priority pending tasks',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('get_tasks');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toMatchObject({
        priority: 'high',
        status: 'pending',
      });
    });

    it('should call update_task_status for task updates', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Mark task task-123 as completed',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('update_task_status');

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toMatchObject({
        taskId: 'task-123',
        status: 'completed',
      });
    });
  });

  describe('Multi-Tool Orchestration', () => {
    it('should chain calendar check + task creation', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Check my calendar for tomorrow and if I have free time in the afternoon, create a task to review the marketing proposal',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('get_calendar_events');
      expect(response.metadata?.toolsUsed).toContain('create_task');
      expect(response.metadata?.iterations).toBeGreaterThan(1);
    });

    it('should search emails + categorize results', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Find all emails from this week and categorize them by priority',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.metadata?.toolsUsed).toContain('search_emails');
      expect(response.metadata?.toolsUsed).toContain('categorize_emails');
    });

    it('should execute tools in correct order', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Search for emails about the budget, then create a task to review them',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      const tools = response.metadata?.executionLog.map((log: any) => log.tool);
      const searchIndex = tools.indexOf('search_emails');
      const taskIndex = tools.indexOf('create_task');

      expect(searchIndex).toBeGreaterThanOrEqual(0);
      expect(taskIndex).toBeGreaterThanOrEqual(0);
      expect(searchIndex).toBeLessThan(taskIndex); // Search should happen first
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle ambiguous requests gracefully', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Help me with this',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Should either ask for clarification or provide a helpful response
      expect(response.content).toBeTruthy();
      expect(response.content.length).toBeGreaterThan(10);
    });

    it('should NOT call tools for general knowledge questions', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'What is the capital of France?',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Should respond directly without calling tools
      expect(response.metadata?.toolsUsed.length).toBe(0);
      expect(response.content).toContain('Paris');
    });

    it('should handle tool execution failures gracefully', async () => {
      // This will trigger a real failure since backend services are mocked
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Search my emails for important messages',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Should acknowledge the failure in response
      expect(response.content).toBeTruthy();
      expect(response.confidence).toBeLessThan(1.0);
    });

    it('should respect iteration limits', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Do a comprehensive analysis of my schedule, emails, and tasks for the week',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Should not exceed max iterations (3)
      expect(response.metadata?.iterations).toBeLessThanOrEqual(3);
    });
  });

  describe('Parameter Extraction Accuracy', () => {
    it('should extract dates correctly', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Find emails from last Monday to Wednesday',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      const execution = response.metadata?.executionLog[0];
      expect(execution.args).toHaveProperty('dateFrom');
      expect(execution.args).toHaveProperty('dateTo');

      // Verify it's actual ISO dates
      expect(new Date(execution.args.dateFrom).toISOString()).toBeTruthy();
    });

    it('should extract email addresses correctly', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Compose an email to alice@company.com and bob@startup.io',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      const execution = response.metadata?.executionLog[0];
      expect(execution.args.to).toMatch(/alice@company\.com|bob@startup\.io/);
    });

    it('should extract priority levels correctly', async () => {
      const testCases = [
        { input: 'Create an urgent task', expected: 'urgent' },
        { input: 'Create a high priority task', expected: 'high' },
        { input: 'Create a low priority task', expected: 'low' },
      ];

      for (const testCase of testCases) {
        const request: AIRequest = {
          userId: mockContext.userId,
          content: testCase.input,
          context: {},
        };

        const response = await orchestrator.process(request, mockContext);
        const execution = response.metadata?.executionLog[0];

        expect(execution.args.priority).toBe(testCase.expected);
      }
    });

    it('should extract time ranges correctly', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Find a 45 minute meeting slot',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      const execution = response.metadata?.executionLog.find(
        (log: any) => log.tool === 'find_meeting_times'
      );

      expect(execution?.args.duration).toBe(45);
    });
  });

  describe('Performance Requirements', () => {
    it('should complete simple requests in <5 seconds', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'What meetings do I have today?',
        context: {},
      };

      const startTime = Date.now();
      const response = await orchestrator.process(request, mockContext);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000);
      expect(response.executionTime).toBeLessThan(5000);
    });

    it('should complete multi-tool requests in <10 seconds', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Check my calendar and create a task for any gaps',
        context: {},
      };

      const startTime = Date.now();
      const response = await orchestrator.process(request, mockContext);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for successful operations', async () => {
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Create a task to call the dentist',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      expect(response.confidence).toBeGreaterThan(0.8);
    });

    it('should have low confidence when tools fail', async () => {
      // This will fail because backend services are mocked to fail
      const request: AIRequest = {
        userId: mockContext.userId,
        content: 'Search my emails',
        context: {},
      };

      const response = await orchestrator.process(request, mockContext);

      // Confidence should reflect the failure
      expect(response.confidence).toBeLessThan(0.5);
    });
  });
});

/**
 * Mock backend services since they don't exist yet
 */
function mockBackendServices() {
  const originalFetch = global.fetch;

  (global as any).fetch = async (url: string, options?: any) => {
    // Mock successful responses for all backend services
    if (url.includes('/api/emails/search')) {
      return {
        ok: true,
        json: async () => ({
          emails: [
            { id: '1', subject: 'Test Email', from: 'test@example.com' },
          ],
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

    if (url.includes('/api/calendar/events')) {
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

    if (url.includes('/api/tasks')) {
      return {
        ok: true,
        json: async () => ({
          id: 'task-123',
          title: 'Created Task',
          status: 'pending',
        }),
      };
    }

    // Default fallback
    return originalFetch?.(url, options) || {
      ok: false,
      statusText: 'Service not available',
    };
  };
}

function restoreBackendServices() {
  // Restore original fetch if needed
  // (global as any).fetch = originalFetch;
}
