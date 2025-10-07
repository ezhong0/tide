/**
 * AI Service HTTP Server
 * Provides health checks and direct API endpoints
 */

import * as http from 'http';
import { createLogger } from '@tide/logger';
import { AIOrchestrator } from './orchestration/ai-orchestrator';
import type { AIRequest } from '@tide/contracts';

const logger = createLogger({ component: 'AIServer' });

export class AIServer {
  private server: http.Server;
  private orchestrator: AIOrchestrator;
  private port: number;

  constructor(port = 3003) {
    this.port = port;
    this.orchestrator = new AIOrchestrator();
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        logger.info(`AI Service listening on port ${this.port}`);
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
          logger.info('Server stopped');
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

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check endpoint
    if (url === '/health' && method === 'GET') {
      this.handleHealth(res);
      return;
    }

    // AI processing endpoint
    if (url === '/process' && method === 'POST') {
      await this.handleProcess(req, res);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  /**
   * Handle health check
   */
  private handleHealth(res: http.ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'ai-service',
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Handle AI processing request
   */
  private async handleProcess(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      // Parse request body
      const body = await this.parseBody(req);
      const aiRequest: AIRequest = JSON.parse(body);

      logger.info('Processing AI request', { userId: aiRequest.userId });

      // Process with orchestrator
      const response = await this.orchestrator.process(aiRequest);

      // Send response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      logger.error('Error processing request', { error });

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
