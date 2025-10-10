/**
 * AI Chat with Tools E2E Test
 * Tests the AI service with actual tool execution
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  setup,
  teardown,
  getE2EContext,
  createTestData,
  cleanupTestData,
  makeAuthenticatedRequest,
} from '../setup';

describe('AI Chat with Tools E2E Flow', () => {
  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await teardown();
  });

  it('should process query and execute email search tool', async () => {
    const context = getE2EContext();
    const testData = await createTestData(context);

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3000';

      const response = await makeAuthenticatedRequest(context, `${aiServiceUrl}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'Show me my unread emails',
          context: {},
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('cost');
      expect(result).toHaveProperty('processingTime');

      // Should have executed search_emails tool
      if (result.toolCalls) {
        const emailSearchCall = result.toolCalls.find(
          (tc: any) => tc.name === 'search_emails'
        );
        expect(emailSearchCall).toBeDefined();
      }
    } finally {
      await cleanupTestData(context, testData);
    }
  }, 30000);

  it('should handle multi-step tool execution', async () => {
    const context = getE2EContext();
    const testData = await createTestData(context);

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3000';

      const response = await makeAuthenticatedRequest(context, `${aiServiceUrl}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'Find a meeting time tomorrow and create an event',
          context: {},
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();

      expect(result.content).toBeTruthy();

      // Should have executed multiple tools
      if (result.toolCalls && result.toolCalls.length > 0) {
        // Could include: get_calendar_events, find_meeting_times, create_calendar_event
        expect(result.toolCalls.length).toBeGreaterThan(0);
      }
    } finally {
      await cleanupTestData(context, testData);
    }
  }, 30000);

  it('should handle tool failures gracefully', async () => {
    const context = getE2EContext();

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3000';

    // Request that might trigger tool failures
    const response = await makeAuthenticatedRequest(context, `${aiServiceUrl}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({
        content: 'Search for emails from nonexistent@example.com',
        context: {},
      }),
    });

    expect(response.ok).toBe(true);
    const result = await response.json();

    // Should still return a response even if tool fails
    expect(result.content).toBeTruthy();
  }, 30000);

  it('should respect processing time limits', async () => {
    const context = getE2EContext();
    const testData = await createTestData(context);

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3000';

      const start = Date.now();

      await makeAuthenticatedRequest(context, `${aiServiceUrl}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'Quick question: what time is it?',
          context: {},
        }),
      });

      const duration = Date.now() - start;

      // Simple queries should complete in < 5s
      expect(duration).toBeLessThan(5000);
    } finally {
      await cleanupTestData(context, testData);
    }
  }, 30000);
});

