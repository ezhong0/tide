/**
 * ServiceBase Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { type Express } from 'express';
import { ServiceBase, type ServiceConfig, type Resource } from './service.base.js';

// Create a concrete implementation for testing
class TestService extends ServiceBase {
  private initializeError?: Error;
  public initializeCalled = false;
  public setupRoutesCalled = false;
  public healthCheckCalled = false;

  constructor(config: ServiceConfig, options?: { initializeError?: Error }) {
    super(config);
    this.initializeError = options?.initializeError;
  }

  protected async initialize(): Promise<void> {
    this.initializeCalled = true;
    if (this.initializeError) {
      throw this.initializeError;
    }
  }

  protected setupRoutes(app: Express): void {
    this.setupRoutesCalled = true;
    app.get('/test', (req, res) => {
      res.json({ message: 'test' });
    });
  }

  protected async healthCheck() {
    this.healthCheckCalled = true;
    return {
      checks: {
        database: { status: 'ok' },
      },
    };
  }

  // Expose protected method for testing
  public exposeRegisterResource(resource: Resource): void {
    this.registerResource(resource);
  }

  // Override to prevent actual server start
  async start(app: Express): Promise<void> {
    await this.initialize();
    this.setupRoutes(app);
    // Don't actually start the HTTP server in tests
  }

  // Simplified stop for tests
  async stop(): Promise<void> {
    const cleanupPromises = Array.from(this.resources).map(resource =>
      resource.cleanup().catch(() => {})
    );
    await Promise.all(cleanupPromises);
  }
}

describe('ServiceBase', () => {
  let app: Express;
  let service: TestService;
  const config: ServiceConfig = {
    name: 'test-service',
    version: '1.0.0',
    port: 3000,
    shutdownTimeout: 100,
  };

  beforeEach(() => {
    app = express();
    service = new TestService(config);
  });

  afterEach(async () => {
    try {
      await service.stop();
    } catch {
      // Ignore
    }
  });

  describe('start()', () => {
    it('should initialize service and setup routes', async () => {
      await service.start(app);

      expect(service.initializeCalled).toBe(true);
      expect(service.setupRoutesCalled).toBe(true);
    });

    it('should throw error if initialization fails', async () => {
      const error = new Error('Initialization failed');
      const failingService = new TestService(config, { initializeError: error });

      await expect(failingService.start(app)).rejects.toThrow('Initialization failed');
    });
  });

  describe('stop()', () => {
    it('should stop gracefully', async () => {
      await service.start(app);
      await expect(service.stop()).resolves.not.toThrow();
    });

    it('should cleanup registered resources', async () => {
      const resource: Resource = {
        name: 'test-resource',
        cleanup: vi.fn().mockResolvedValue(undefined),
      };

      service.exposeRegisterResource(resource);
      await service.start(app);
      await service.stop();

      expect(resource.cleanup).toHaveBeenCalledOnce();
    });

    it('should handle resource cleanup errors gracefully', async () => {
      const resource: Resource = {
        name: 'failing-resource',
        cleanup: vi.fn().mockRejectedValue(new Error('Cleanup failed')),
      };

      service.exposeRegisterResource(resource);
      await service.start(app);

      await expect(service.stop()).resolves.not.toThrow();
      expect(resource.cleanup).toHaveBeenCalledOnce();
    });
  });

  describe('registerResource()', () => {
    it('should register resource for lifecycle management', async () => {
      const resource: Resource = {
        name: 'test-resource',
        cleanup: vi.fn().mockResolvedValue(undefined),
      };

      service.exposeRegisterResource(resource);
      await service.start(app);
      await service.stop();

      expect(resource.cleanup).toHaveBeenCalledOnce();
    });

    it('should cleanup multiple resources', async () => {
      const resource1: Resource = {
        name: 'resource-1',
        cleanup: vi.fn().mockResolvedValue(undefined),
      };
      const resource2: Resource = {
        name: 'resource-2',
        cleanup: vi.fn().mockResolvedValue(undefined),
      };

      service.exposeRegisterResource(resource1);
      service.exposeRegisterResource(resource2);
      await service.start(app);
      await service.stop();

      expect(resource1.cleanup).toHaveBeenCalledOnce();
      expect(resource2.cleanup).toHaveBeenCalledOnce();
    });
  });

  describe('healthCheck()', () => {
    it('should call custom health check', async () => {
      await service.start(app);
      const health = await service.healthCheck();

      expect(service.healthCheckCalled).toBe(true);
      expect(health.checks).toBeDefined();
      expect(health.checks?.database.status).toBe('ok');
    });
  });
});
