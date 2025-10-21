/**
 * AI Service Integration Tests
 * Verifies GPT-5 orchestrator and endpoint functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { TideAIServer } from '@tide/ai-service';
import type { AIRequest, AIResponse } from '@tide/contracts';

describe('AI Service - GPT-5 Only', () => {
  let server: TideAIServer;
  let serverPort: number;

  beforeAll(async () => {
    // Use a test port
    serverPort = 3991;

    server = new TideAIServer({
      port: serverPort,
      openaiApiKey: process.env.OPENAI_API_KEY || 'test-key',
      model: 'gpt-5-mini',
      includeIntelligenceTools: false,
      includeCustomTools: false,
    });

    const app = express();
    await server.start(app);

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    // Cleanup
    try {
      await (server as any).stop();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Server Configuration', () => {
    it('should start with GPT-5 configuration', async () => {
      const response = await fetch(`http://localhost:${serverPort}/health`);
      const health = await response.json();

      expect(response.status).toBe(200);
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('tide-ai-gpt5');
      expect(health.version).toBe('2.0.2');
    });

    it('should expose orchestrator health check', async () => {
      const response = await fetch(`http://localhost:${serverPort}/health`);
      const health = await response.json();

      expect(health.checks).toBeDefined();
      expect(health.checks.orchestrator).toBeDefined();
      expect(health.checks.orchestrator.status).toBe('up');
      expect(health.checks.orchestrator.details.type).toBe('gpt-5');
      expect(health.checks.orchestrator.details.model).toBe('gpt-5-mini');
    });

    it('should expose tools health check', async () => {
      const response = await fetch(`http://localhost:${serverPort}/health`);
      const health = await response.json();

      expect(health.checks.tools).toBeDefined();
      expect(health.checks.tools.status).toBe('up');
      expect(typeof health.checks.tools.details.registered).toBe('number');
    });
  });

  describe('API Endpoints', () => {
    it('should have /api/chat endpoint', async () => {
      const request: AIRequest = {
        userId: 'test-user' as any,
        content: 'Hello, this is a test',
        context: {
          userEmail: 'test@example.com',
        },
        timestamp: Date.now(),
      };

      const response = await fetch(`http://localhost:${serverPort}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      // May fail if no API key, but endpoint should exist
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should NOT have legacy /process endpoint', async () => {
      const response = await fetch(`http://localhost:${serverPort}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test', type: 'test' }),
      });

      // Should return 404 for unknown endpoint
      expect(response.status).toBe(404);
    });

    it('should validate request format', async () => {
      const invalidRequest = {
        // Missing userId and content
        context: {},
      };

      const response = await fetch(`http://localhost:${serverPort}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBe('Bad request');
    });

    it('should handle CORS preflight', async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/chat`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('Request Format', () => {
    it('should accept modern request format', async () => {
      const request: AIRequest = {
        userId: 'test-user-123' as any,
        content: 'What is the weather today?',
        context: {
          userEmail: 'user@example.com',
          timezone: 'America/New_York',
        },
        timestamp: Date.now(),
      };

      const response = await fetch(`http://localhost:${serverPort}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      // Should accept the request (may fail if no API key)
      expect([200, 500]).toContain(response.status);
    });

    it('should reject legacy request format', async () => {
      const legacyRequest = {
        userId: 'test-user',
        type: 'daily_summary',
        input: { some: 'data' },
      };

      const response = await fetch(`http://localhost:${serverPort}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacyRequest),
      });

      // Should reject because missing 'content' field
      expect(response.status).toBe(400);
    });
  });

  describe('Migration Verification', () => {
    it('should not export legacy components', () => {
      const aiService = require('@tide/ai-service');

      // Should export GPT-5 components
      expect(aiService.TideAIServer).toBeDefined();
      expect(aiService.GPT5Orchestrator).toBeDefined();
      expect(aiService.initializeTools).toBeDefined();
      expect(aiService.toolRegistry).toBeDefined();

      // Should NOT export legacy components
      expect(aiService.AIServer).toBeUndefined();
      expect(aiService.AIOrchestrator).toBeUndefined();
      expect(aiService.MultiModelRouter).toBeUndefined();
      expect(aiService.SwarmCoordinator).toBeUndefined();
      expect(aiService.IntentDetector).toBeUndefined();
    });

    it('should have no USE_LEGACY_ORCHESTRATOR environment variable support', () => {
      // Even if we set this, it shouldn't affect behavior
      process.env.USE_LEGACY_ORCHESTRATOR = 'true';

      const server2 = new TideAIServer({
        port: 3992,
        openaiApiKey: 'test',
      });

      // Should always use GPT-5 orchestrator
      expect((server2 as any).orchestrator).toBeDefined();
      expect((server2 as any).orchestrator.constructor.name).toBe('GPT5Orchestrator');

      delete process.env.USE_LEGACY_ORCHESTRATOR;
    });
  });

  describe('ServiceBase Integration', () => {
    it('should extend ServiceBase', () => {
      expect(server).toBeInstanceOf(TideAIServer);
      // Check that it has ServiceBase methods
      expect(typeof (server as any).stop).toBe('function');
      expect(typeof (server as any).registerResource).toBe('function');
    });

    it('should support graceful shutdown', async () => {
      // Create a new server instance for this test
      const testServer = new TideAIServer({
        port: 3993,
        openaiApiKey: 'test',
      });

      const app = express();
      await testServer.start(app);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should shutdown without errors
      await expect((testServer as any).stop()).resolves.not.toThrow();
    });
  });
});
