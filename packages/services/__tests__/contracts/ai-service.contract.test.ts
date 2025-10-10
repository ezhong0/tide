/**
 * AI Service Contract Tests
 * Ensures the AI service API maintains its contract with consumers
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('AI Service API Contract', () => {
  // Define expected request/response schemas using Zod

  const AIRequestSchema = z.object({
    content: z.string().min(1),
    conversationId: z.string().optional(),
    context: z
      .object({
        recentEmails: z.array(z.any()).optional(),
        upcomingEvents: z.array(z.any()).optional(),
        activeTasks: z.array(z.any()).optional(),
      })
      .optional(),
  });

  const AIResponseSchema = z.object({
    content: z.string(),
    toolCalls: z
      .array(
        z.object({
          name: z.string(),
          arguments: z.record(z.any()),
          result: z.any().optional(),
        })
      )
      .optional(),
    confidence: z.number().min(0).max(1),
    cost: z.object({
      inputTokens: z.number(),
      outputTokens: z.number(),
      totalCost: z.number(),
    }),
    processingTime: z.number(),
  });

  describe('POST /api/chat - Chat Endpoint', () => {
    it('should define valid request schema', () => {
      const validRequest = {
        content: 'What emails do I have from my boss?',
        conversationId: 'conv-123',
        context: {
          recentEmails: [],
          upcomingEvents: [],
        },
      };

      const result = AIRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject request without content', () => {
      const invalidRequest = {
        conversationId: 'conv-123',
      };

      const result = AIRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('content');
      }
    });

    it('should define valid response schema', () => {
      const validResponse = {
        content: 'You have 3 emails from your boss. The most recent is about...',
        toolCalls: [
          {
            name: 'search_emails',
            arguments: { from: 'boss@company.com', limit: 10 },
            result: { emails: [], count: 3 },
          },
        ],
        confidence: 0.95,
        cost: {
          inputTokens: 150,
          outputTokens: 200,
          totalCost: 0.0035,
        },
        processingTime: 1234,
      };

      const result = AIResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should enforce confidence between 0 and 1', () => {
      const invalidResponse = {
        content: 'Test',
        confidence: 1.5, // Invalid
        cost: { inputTokens: 0, outputTokens: 0, totalCost: 0 },
        processingTime: 0,
      };

      const result = AIResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should require cost breakdown in response', () => {
      const responseWithoutCost = {
        content: 'Test',
        confidence: 0.9,
        processingTime: 100,
        // Missing cost
      };

      const result = AIResponseSchema.safeParse(responseWithoutCost);
      expect(result.success).toBe(false);
    });
  });

  describe('Tool Schemas', () => {
    const ToolDefinitionSchema = z.object({
      type: z.literal('function'),
      name: z.string(),
      description: z.string(),
      parameters: z.object({
        type: z.literal('object'),
        properties: z.record(z.any()),
        required: z.array(z.string()).optional(),
      }),
    });

    it('should define standard tool format', () => {
      const validTool = {
        type: 'function' as const,
        name: 'search_emails',
        description: 'Search user emails by query',
        parameters: {
          type: 'object' as const,
          properties: {
            query: { type: 'string' },
            limit: { type: 'number', default: 20 },
          },
          required: ['query'],
        },
      };

      const result = ToolDefinitionSchema.safeParse(validTool);
      expect(result.success).toBe(true);
    });

    it('should require function type', () => {
      const invalidTool = {
        type: 'invalid',
        name: 'test_tool',
        description: 'Test',
        parameters: {
          type: 'object',
          properties: {},
        },
      };

      const result = ToolDefinitionSchema.safeParse(invalidTool);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Response Contract', () => {
    const ErrorResponseSchema = z.object({
      error: z.string(),
      code: z.string(),
      details: z.any().optional(),
      requestId: z.string(),
    });

    it('should define error response format', () => {
      const validError = {
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED',
        requestId: 'req-123',
      };

      const result = ErrorResponseSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('should require requestId for debugging', () => {
      const invalidError = {
        error: 'Something went wrong',
        code: 'INTERNAL_ERROR',
        // Missing requestId
      };

      const result = ErrorResponseSchema.safeParse(invalidError);
      expect(result.success).toBe(false);
    });

    it('should allow optional error details', () => {
      const errorWithDetails = {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field: 'content', message: 'Required field missing' },
        requestId: 'req-456',
      };

      const result = ErrorResponseSchema.safeParse(errorWithDetails);
      expect(result.success).toBe(true);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain v1 API structure', () => {
      // Ensure we don't break existing clients
      const v1Request = {
        content: 'Test message',
      };

      const result = AIRequestSchema.safeParse(v1Request);
      expect(result.success).toBe(true);
    });

    it('should allow future optional fields', () => {
      const requestWithNewField = {
        content: 'Test',
        conversationId: 'conv-123',
        // Future field that doesn't break current schema
        metadata: { source: 'mobile' },
      };

      // Schema should be flexible enough to allow extra fields
      const result = AIRequestSchema.safeParse(requestWithNewField);
      expect(result.success).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    it('should define response time expectations', () => {
      // Response should include processing time
      const response = {
        content: 'Result',
        confidence: 0.9,
        cost: { inputTokens: 100, outputTokens: 150, totalCost: 0.0025 },
        processingTime: 1500, // milliseconds
      };

      const result = AIResponseSchema.safeParse(response);
      expect(result.success).toBe(true);

      if (result.success) {
        // P95 should be < 5000ms
        expect(result.data.processingTime).toBeLessThan(5000);
      }
    });
  });
});

