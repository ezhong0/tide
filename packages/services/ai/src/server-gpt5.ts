/**
 * Tide AI Service - GPT-5 Powered
 * Production server using GPT-5 function calling orchestrator
 */

import express, { type Request, type Response } from 'express';
import { ServiceBase, type HealthStatus } from '@tide/base';
import { GPT5Orchestrator } from './orchestration/gpt5-orchestrator.js';
import { initializeTools, type ToolContext } from './tools/index.js';
import type { AIRequest, AIResponse } from '@tide/contracts';

export interface ServerConfig {
  port: number;
  anthropicApiKey: string;
  model?: string; // claude-haiku-4-5 (default), claude-sonnet-4-5
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
  verbosity?: 'low' | 'medium' | 'high';
  includeIntelligenceTools?: boolean;
  includeCustomTools?: boolean;
}

/**
 * Tide AI Service Server
 */
export class TideAIServer extends ServiceBase {
  private orchestrator!: GPT5Orchestrator;
  private aiConfig: ServerConfig;

  constructor(serverConfig: Partial<ServerConfig> = {}) {
    // Prepare config before calling super
    const aiConfig: ServerConfig = {
      port: serverConfig.port || parseInt(process.env.PORT || '3001', 10),
      anthropicApiKey: serverConfig.anthropicApiKey || process.env.ANTHROPIC_API_KEY || '',
      // Use Claude Haiku 4.5 as default (fast, cost-effective, great coding performance)
      model: serverConfig.model || process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      reasoningEffort: serverConfig.reasoningEffort || 'medium',
      verbosity: serverConfig.verbosity || 'medium',
      // Disable intelligence tools by default to avoid complex agent dependencies
      includeIntelligenceTools: serverConfig.includeIntelligenceTools ?? (process.env.ENABLE_INTELLIGENCE_TOOLS === 'true'),
      includeCustomTools: serverConfig.includeCustomTools ?? false,
    };

    super({
      name: 'tide-ai-gpt5',
      version: '2.0.2',
      port: aiConfig.port,
      shutdownTimeout: 10000,
    });

    this.aiConfig = aiConfig;
  }

  /**
   * Initialize orchestrator and tools
   */
  protected async initialize(): Promise<void> {
    this.logger.debug('TideAIServer initialization starting', {
      config: this.aiConfig,
      hasApiKey: !!this.aiConfig.anthropicApiKey,
    });

    // Validate API key
    if (!this.aiConfig.anthropicApiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not configured - service will be limited');
      // Don't throw error, allow service to start for health checks
      // Actual AI requests will fail gracefully
    }

    // Initialize tools
    this.logger.debug('Initializing tools');
    try {
      initializeTools({
        includeIntelligenceTools: this.aiConfig.includeIntelligenceTools,
        includeCustomTools: this.aiConfig.includeCustomTools,
      });
      this.logger.info('Tools initialized successfully');
    } catch (error) {
      this.logger.fatal({ error }, 'FATAL: Tool initialization failed');
      throw error;
    }

    // Initialize Claude orchestrator (use dummy key if not configured)
    this.logger.debug('Initializing Claude orchestrator');
    try {
      this.orchestrator = new GPT5Orchestrator({
        apiKey: this.aiConfig.anthropicApiKey || 'sk-dummy-key-for-startup',
        model: this.aiConfig.model,
        reasoningEffort: this.aiConfig.reasoningEffort,
        verbosity: this.aiConfig.verbosity,
      });
      this.logger.info('Orchestrator initialized successfully');
    } catch (error) {
      this.logger.fatal({ error }, 'FATAL: Orchestrator initialization failed');
      throw error;
    }

    this.logger.info('Tide AI Service initialized', {
      model: this.aiConfig.model,
      toolsEnabled: {
        intelligence: this.aiConfig.includeIntelligenceTools,
        custom: this.aiConfig.includeCustomTools,
      },
    });
  }

  /**
   * Setup routes
   */
  protected setupRoutes(app: express.Application): void {
    // JSON parsing middleware
    app.use(express.json({ limit: '10mb' }));

    // CORS middleware
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }

      next();
    });

    // Main chat endpoint
    app.post('/api/chat', this.handleChat.bind(this));

    this.logger.info('Routes configured');
  }

  /**
   * Health check
   */
  protected async healthCheck(): Promise<Partial<HealthStatus>> {
    const { toolRegistry } = await import('./tools/registry.js');
    const toolCount = toolRegistry.getToolNames().length;

    return {
      checks: {
        orchestrator: {
          status: 'up',
          details: {
            type: 'claude-haiku-4-5',
            model: this.aiConfig.model,
            hasApiKey: !!this.aiConfig.anthropicApiKey,
          },
        },
        tools: {
          status: 'up',
          details: {
            registered: toolCount,
            intelligence: this.aiConfig.includeIntelligenceTools,
            custom: this.aiConfig.includeCustomTools,
          },
        },
      },
    };
  }

  /**
   * Chat endpoint - Main AI interaction
   */
  private async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const request: AIRequest = req.body;

      // Validate request
      if (!request.userId || !request.content) {
        res.status(400).json({
          error: 'Bad request',
          message: 'userId and content are required',
        });
        return;
      }

      this.logger.info('Processing chat request', {
        userId: request.userId,
        contentLength: request.content.length,
      });

      // Extract JWT token from Authorization header for service-to-service auth
      const authHeader = req.headers.authorization;
      const jwtToken = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : undefined;

      // Build tool context
      const context: ToolContext = {
        userId: request.userId,
        requestId: `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userEmail: request.context?.userEmail,
        jwtToken,
        timestamp: Date.now(),
      };

      // Process with GPT-5 orchestrator
      const response: AIResponse = await this.orchestrator.process(request, context);

      // Log success
      this.logger.info('Chat request completed', {
        requestId: response.requestId,
        tokensUsed: response.tokensUsed,
        executionTime: response.executionTime,
        toolsUsed: (response.metadata as any)?.toolsUsed?.length || 0,
      });

      // Send response
      res.json(response);
    } catch (error) {
      this.logger.error('Chat request failed', { error });

      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
