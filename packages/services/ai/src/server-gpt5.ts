/**
 * Tide AI Service - GPT-5 Powered
 * Production server using GPT-5 function calling orchestrator
 */

import * as http from 'http';
import { createLogger } from '@tide/logger';
import { GPT5Orchestrator } from './orchestration/gpt5-orchestrator.js';
import { initializeTools, type ToolContext } from './tools/index.js';
import type { AIRequest, AIResponse } from '@tide/contracts';

const logger = createLogger({ component: 'TideAIService' });

export interface ServerConfig {
  port: number;
  openaiApiKey: string;
  model?: string; // gpt-5, gpt-5-mini, gpt-5-nano
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
  verbosity?: 'low' | 'medium' | 'high';
  includeIntelligenceTools?: boolean;
  includeCustomTools?: boolean;
}

/**
 * Tide AI Service Server
 */
export class TideAIServer {
  private server: http.Server;
  private orchestrator: GPT5Orchestrator;
  private config: ServerConfig;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = {
      port: config.port || parseInt(process.env.PORT || '3001', 10),
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY || '',
      model: config.model || process.env.GPT5_MODEL || 'gpt-5-mini',
      reasoningEffort: config.reasoningEffort || 'medium',
      verbosity: config.verbosity || 'medium',
      includeIntelligenceTools: config.includeIntelligenceTools ?? true,
      includeCustomTools: config.includeCustomTools ?? false,
    };

    // Validate API key
    if (!this.config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    // Initialize tools
    initializeTools({
      includeIntelligenceTools: this.config.includeIntelligenceTools,
      includeCustomTools: this.config.includeCustomTools,
    });

    // Initialize GPT-5 orchestrator
    this.orchestrator = new GPT5Orchestrator({
      apiKey: this.config.openaiApiKey,
      model: this.config.model,
      reasoningEffort: this.config.reasoningEffort,
      verbosity: this.config.verbosity,
    });

    // Create HTTP server
    this.server = http.createServer(this.handleRequest.bind(this));

    logger.info('Tide AI Service initialized', {
      model: this.config.model,
      toolsEnabled: {
        intelligence: this.config.includeIntelligenceTools,
        custom: this.config.includeCustomTools,
      },
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, '0.0.0.0', () => {
        const logData = {
          port: this.config.port,
          host: '0.0.0.0',
          endpoint: `http://0.0.0.0:${this.config.port}`,
          env: process.env.NODE_ENV || 'production',
          buildTimestamp: new Date().toISOString(),
          version: '2.0.2-redeploy',
        };
        logger.info('🚀🚀🚀 AI SERVICE NOW LISTENING - PORT=' + this.config.port, logData);
        console.log('=== RAILWAY DEBUG ===');
        console.log('Port:', this.config.port);
        console.log('Host: 0.0.0.0');
        console.log('Endpoint:', `http://0.0.0.0:${this.config.port}`);
        console.log('====================');
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          logger.error('Error stopping server', { error: err });
          reject(err);
        } else {
          logger.info('Tide AI Service stopped');
          resolve();
        }
      });
    });
  }

  /**
   * Handle HTTP requests
   */
  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const { method, url } = req;

    console.log(`=== REQUEST RECEIVED === ${method} ${url}`, new Date().toISOString());

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      console.log('OPTIONS request, sending 204');
      res.writeHead(204);
      res.end();
      return;
    }

    // Routes
    if (url === '/health' && method === 'GET') {
      console.log('Routing to health check handler');
      await this.handleHealth(res);
      return;
    }

    if (url === '/api/chat' && method === 'POST') {
      await this.handleChat(req, res);
      return;
    }

    // Legacy endpoint for backward compatibility
    if (url === '/process' && method === 'POST') {
      await this.handleChat(req, res);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  /**
   * Health check endpoint
   */
  private async handleHealth(res: http.ServerResponse): Promise<void> {
    console.log('=== HEALTH CHECK CALLED ===', new Date().toISOString());
    logger.info('Health check endpoint called');

    const health = {
      status: 'healthy',
      service: 'tide-ai',
      version: '2.0.0',
      orchestrator: 'gpt-5',
      model: this.config.model,
      timestamp: new Date().toISOString(),
      tools: {
        registered: (await import('./tools/registry.js')).toolRegistry.getToolNames().length,
        intelligence: this.config.includeIntelligenceTools,
        custom: this.config.includeCustomTools,
      },
    };

    console.log('=== HEALTH RESPONSE ===', JSON.stringify(health));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
    console.log('=== HEALTH CHECK COMPLETE ===');
  }

  /**
   * Chat endpoint - Main AI interaction
   */
  private async handleChat(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      // Parse request
      const body = await this.parseBody(req);
      const request: AIRequest = JSON.parse(body);

      // Validate request
      if (!request.userId || !request.content) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Bad request',
          message: 'userId and content are required',
        }));
        return;
      }

      logger.info('Processing chat request', {
        userId: request.userId,
        contentLength: request.content.length,
      });

      // Build tool context
      const context: ToolContext = {
        userId: request.userId,
        requestId: `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userEmail: request.context?.userEmail,
        timestamp: Date.now(),
      };

      // Process with GPT-5 orchestrator
      const response: AIResponse = await this.orchestrator.process(request, context);

      // Log success
      logger.info('Chat request completed', {
        requestId: response.requestId,
        tokensUsed: response.tokensUsed,
        executionTime: response.executionTime,
        toolsUsed: (response.metadata as any)?.toolsUsed?.length || 0,
      });

      // Send response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      logger.error('Chat request failed', { error });

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    }
  }

  /**
   * Parse request body
   */
  private parseBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        resolve(body);
      });

      req.on('error', (error) => {
        reject(error);
      });
    });
  }
}

/**
 * Start server if run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new TideAIServer();

  server.start().catch((error) => {
    logger.error('Failed to start server', { error });
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });
}
