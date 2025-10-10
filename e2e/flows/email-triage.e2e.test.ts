/**
 * Email Triage E2E Test
 * Tests the complete email triage flow
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

describe('Email Triage E2E Flow', () => {
  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await teardown();
  });

  it('should complete full email triage flow', async () => {
    const context = getE2EContext();
    const testData = await createTestData(context);

    try {
      const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';

      // Step 1: Fetch emails
      const fetchResponse = await makeAuthenticatedRequest(
        context,
        `${emailServiceUrl}/api/emails/search`,
        {
          method: 'POST',
          body: JSON.stringify({
            userId: context.testUserId,
            limit: 10,
          }),
        }
      );

      expect(fetchResponse.ok).toBe(true);
      const { emails } = await fetchResponse.json();
      expect(emails).toBeInstanceOf(Array);

      // Step 2: Triage emails
      if (emails.length > 0) {
        const emailIds = emails.map((e: any) => e.id);

        const triageResponse = await makeAuthenticatedRequest(
          context,
          `${emailServiceUrl}/api/emails/triage`,
          {
            method: 'POST',
            body: JSON.stringify({
              userId: context.testUserId,
              emailIds,
            }),
          }
        );

        expect(triageResponse.ok).toBe(true);
        const { results } = await triageResponse.json();
        expect(results).toHaveLength(emailIds.length);

        // Step 3: Verify triage results
        results.forEach((result: any) => {
          expect(result).toHaveProperty('emailId');
          expect(result).toHaveProperty('category');
          expect(result).toHaveProperty('priority');
          expect(result).toHaveProperty('urgency');
          expect(result.intelligence.importance).toBeGreaterThanOrEqual(0);
          expect(result.intelligence.importance).toBeLessThanOrEqual(1);
        });
      }
    } finally {
      await cleanupTestData(context, testData);
    }
  }, 30000); // 30s timeout for E2E

  it('should measure end-to-end latency', async () => {
    const context = getE2EContext();
    const testData = await createTestData(context);

    try {
      const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';

      const start = Date.now();

      // Complete flow: Fetch → Triage
      const fetchResponse = await makeAuthenticatedRequest(
        context,
        `${emailServiceUrl}/api/emails/search`,
        {
          method: 'POST',
          body: JSON.stringify({
            userId: context.testUserId,
            limit: 10,
          }),
        }
      );

      const { emails } = await fetchResponse.json();

      if (emails.length > 0) {
        await makeAuthenticatedRequest(context, `${emailServiceUrl}/api/emails/triage`, {
          method: 'POST',
          body: JSON.stringify({
            userId: context.testUserId,
            emailIds: emails.map((e: any) => e.id).slice(0, 5),
          }),
        });
      }

      const duration = Date.now() - start;

      // End-to-end latency should be < 5s for small batches
      expect(duration).toBeLessThan(5000);
    } finally {
      await cleanupTestData(context, testData);
    }
  }, 30000);
});

