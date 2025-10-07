import { describe, it, expect, beforeAll } from 'vitest';
import { IntelligenceOrchestrator } from '../../orchestration/intelligence-orchestrator';
import { ContextBuilder } from '../../intelligence/context-builder';
import { IntentClassifier } from '../../intelligence/intent-classifier';
import { ModelRouter } from '../../models/model-router';
import type { IntelligenceRequest, UserContext } from '../../types';
import { createUserId } from '@tide/types';

/**
 * AI Service Integration Tests
 *
 * Tests critical AI flows:
 * - Intelligence orchestration
 * - Context building
 * - Intent classification
 * - Model routing
 */

describe('AI Service - Critical Flows', () => {
  let orchestrator: IntelligenceOrchestrator;
  let contextBuilder: ContextBuilder;
  let intentClassifier: IntentClassifier;
  let modelRouter: ModelRouter;

  const mockUserId = createUserId('test_user_1');

  beforeAll(() => {
    orchestrator = new IntelligenceOrchestrator();
    contextBuilder = new ContextBuilder();
    intentClassifier = new IntentClassifier();
    modelRouter = new ModelRouter();
  });

  describe('Intelligence Orchestration', () => {
    it('should process simple query', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'What are my top priorities for today?',
        context: {
          timestamp: new Date(),
          source: 'mobile_app',
        },
      };

      const response = await orchestrator.process(request);

      expect(response).toBeTruthy();
      expect(response.answer).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.sources).toBeTruthy();
    });

    it('should handle email composition request', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'Help me write a professional email declining a meeting',
        context: {
          timestamp: new Date(),
          source: 'email_app',
          emailContext: {
            originalEmail: {
              subject: 'Meeting invitation',
              from: 'colleague@company.com',
              body: 'Can we meet tomorrow at 3pm?',
            },
          },
        },
      };

      const response = await orchestrator.process(request);

      expect(response.answer).toBeTruthy();
      expect(response.answer).toContain('unfortunately');
      expect(response.confidence).toBeGreaterThan(0.7);
    });

    it('should handle calendar query', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'When is my next meeting?',
        context: {
          timestamp: new Date(),
          source: 'calendar_app',
        },
      };

      const response = await orchestrator.process(request);

      expect(response.answer).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should complete orchestration in <2s', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'What should I focus on today?',
        context: {
          timestamp: new Date(),
          source: 'mobile_app',
        },
      };

      const startTime = Date.now();
      await orchestrator.process(request);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Context Building', () => {
    it('should build user context from recent activity', async () => {
      const userContext = await contextBuilder.buildContext(mockUserId, {
        includeEmails: true,
        includeCalendar: true,
        includeTasks: true,
        timeWindow: '24h',
      });

      expect(userContext).toBeTruthy();
      expect(userContext.userId).toBe(mockUserId);
      expect(userContext.recentActivity).toBeTruthy();
    });

    it('should prioritize relevant context', async () => {
      const context = await contextBuilder.buildContext(mockUserId, {
        query: 'What meetings do I have today?',
        includeCalendar: true,
        timeWindow: '24h',
      });

      expect(context.relevantData).toBeTruthy();
      expect(context.relevantData.calendar).toBeTruthy();
    });

    it('should limit context size', async () => {
      const context = await contextBuilder.buildContext(mockUserId, {
        includeEmails: true,
        includeCalendar: true,
        includeTasks: true,
        timeWindow: '7d',
      });

      // Context should be reasonable size (< 100KB)
      const contextSize = JSON.stringify(context).length;
      expect(contextSize).toBeLessThan(100000);
    });
  });

  describe('Intent Classification', () => {
    it('should classify email intent', async () => {
      const query = 'Reply to this email saying I cannot attend';
      const intent = await intentClassifier.classify(query);

      expect(intent.primary).toBe('email_composition');
      expect(intent.confidence).toBeGreaterThan(0.8);
      expect(intent.entities).toContain('decline');
    });

    it('should classify scheduling intent', async () => {
      const query = 'Schedule a meeting with John next Tuesday at 2pm';
      const intent = await intentClassifier.classify(query);

      expect(intent.primary).toBe('scheduling');
      expect(intent.confidence).toBeGreaterThan(0.8);
      expect(intent.entities).toContain('next_tuesday');
      expect(intent.entities).toContain('2pm');
    });

    it('should classify query intent', async () => {
      const query = 'What are my top priorities this week?';
      const intent = await intentClassifier.classify(query);

      expect(intent.primary).toBe('query');
      expect(intent.confidence).toBeGreaterThan(0.7);
    });

    it('should handle ambiguous queries', async () => {
      const query = 'Help me with this';
      const intent = await intentClassifier.classify(query);

      expect(intent.primary).toBeTruthy();
      expect(intent.confidence).toBeLessThan(0.6); // Low confidence for ambiguous
    });

    it('should classify intents quickly (<100ms)', async () => {
      const query = 'What meetings do I have today?';
      const startTime = Date.now();

      await intentClassifier.classify(query);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Model Routing', () => {
    it('should route simple queries to fast model', async () => {
      const request = {
        query: 'What is my next meeting?',
        complexity: 'simple' as const,
      };

      const model = await modelRouter.selectModel(request);

      expect(model.provider).toBe('openai');
      expect(model.model).toBe('gpt-3.5-turbo'); // Fast model for simple queries
    });

    it('should route complex tasks to powerful model', async () => {
      const request = {
        query: 'Analyze my email patterns and suggest optimizations',
        complexity: 'complex' as const,
      };

      const model = await modelRouter.selectModel(request);

      expect(model.provider).toBeTruthy();
      expect(['gpt-4', 'claude-3-opus']).toContain(model.model);
    });

    it('should respect model preferences', async () => {
      const request = {
        query: 'Write a detailed email',
        complexity: 'moderate' as const,
        preferences: {
          provider: 'anthropic' as const,
        },
      };

      const model = await modelRouter.selectModel(request);

      expect(model.provider).toBe('anthropic');
    });

    it('should handle model fallback', async () => {
      const request = {
        query: 'Test query',
        complexity: 'simple' as const,
      };

      // Should not throw even if primary model is unavailable
      const model = await modelRouter.selectModel(request);
      expect(model).toBeTruthy();
    });
  });

  describe('Learning and Adaptation', () => {
    it('should record user feedback', async () => {
      const feedback = {
        userId: mockUserId,
        requestId: 'test_request_1',
        rating: 5,
        feedback: 'Great response',
        timestamp: new Date(),
      };

      // Should not throw
      await expect(
        orchestrator.recordFeedback(feedback)
      ).resolves.not.toThrow();
    });

    it('should track model performance', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'Test query for performance tracking',
        context: {
          timestamp: new Date(),
          source: 'test',
        },
      };

      const response = await orchestrator.process(request);

      expect(response.metadata).toBeTruthy();
      expect(response.metadata.modelUsed).toBeTruthy();
      expect(response.metadata.latency).toBeGreaterThan(0);
    });
  });

  describe('Integration Success Criteria', () => {
    it('should handle multi-step reasoning', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query:
          'What are my highest priority tasks that I can complete before my next meeting?',
        context: {
          timestamp: new Date(),
          source: 'mobile_app',
        },
      };

      const response = await orchestrator.process(request);

      expect(response.answer).toBeTruthy();
      expect(response.reasoning).toBeTruthy();
      expect(response.reasoning.steps).toBeTruthy();
      expect(response.reasoning.steps.length).toBeGreaterThan(1);
    });

    it('should provide source attribution', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'Who did I email most this week?',
        context: {
          timestamp: new Date(),
          source: 'analytics',
        },
      };

      const response = await orchestrator.process(request);

      expect(response.sources).toBeTruthy();
      expect(response.sources.length).toBeGreaterThan(0);
      expect(response.sources[0]).toHaveProperty('type');
      expect(response.sources[0]).toHaveProperty('reference');
    });

    it('should meet latency targets', async () => {
      const simpleRequest: IntelligenceRequest = {
        userId: mockUserId,
        query: 'What time is my next meeting?',
        context: {
          timestamp: new Date(),
          source: 'mobile_app',
        },
      };

      const startTime = Date.now();
      await orchestrator.process(simpleRequest);
      const duration = Date.now() - startTime;

      // Simple queries should complete in <1s
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const requests: IntelligenceRequest[] = Array.from({ length: 5 }, (_, i) => ({
        userId: mockUserId,
        query: `Test query ${i}`,
        context: {
          timestamp: new Date(),
          source: 'test',
        },
      }));

      const startTime = Date.now();

      const responses = await Promise.all(
        requests.map(req => orchestrator.process(req))
      );

      const duration = Date.now() - startTime;

      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.answer).toBeTruthy();
      });

      // Should handle 5 concurrent requests in <3s
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: '', // Empty query
        context: {
          timestamp: new Date(),
          source: 'test',
        },
      };

      await expect(orchestrator.process(request)).rejects.toThrow();
    });

    it('should provide fallback responses', async () => {
      const request: IntelligenceRequest = {
        userId: mockUserId,
        query: 'asdfghjkl qwertyuiop', // Nonsensical query
        context: {
          timestamp: new Date(),
          source: 'test',
        },
      };

      const response = await orchestrator.process(request);

      expect(response.answer).toBeTruthy();
      expect(response.confidence).toBeLessThan(0.5);
    });
  });
});
