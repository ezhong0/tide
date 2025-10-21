/**
 * ServiceBase Lifecycle Tests
 * Verifies that all services properly extend ServiceBase
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express, { type Express } from 'express';
import { ServiceBase, type HealthStatus } from '@tide/base';

// Mock service for testing
class TestService extends ServiceBase {
  public initializeCalled = false;
  public setupRoutesCalled = false;
  public healthCheckCalled = false;

  constructor(port = 3999) {
    super({
      name: 'test-service',
      version: '1.0.0',
      port,
      shutdownTimeout: 1000, // Short timeout for tests
    });
  }

  protected async initialize(): Promise<void> {
    this.initializeCalled = true;
    this.logger.info('Test service initialized');
  }

  protected setupRoutes(app: Express): void {
    this.setupRoutesCalled = true;
    app.get('/test', (req, res) => {
      res.json({ message: 'test endpoint' });
    });
  }

  protected async healthCheck(): Promise<Partial<HealthStatus>> {
    this.healthCheckCalled = true;
    return {
      checks: {
        testComponent: {
          status: 'up',
          details: { test: true },
        },
      },
    };
  }

  // Expose protected methods for testing
  public async testStop(): Promise<void> {
    return this.stop();
  }

  public getConfig() {
    return this.config;
  }
}

describe('ServiceBase Lifecycle', () => {
  let service: TestService;
  let app: Express;

  beforeEach(() => {
    app = express();
    service = new TestService();
  });

  afterEach(async () => {
    try {
      await service.testStop();
    } catch (error) {
      // Service might not be running
    }
  });

  describe('Initialization', () => {
    it('should call initialize method on start', async () => {
      expect(service.initializeCalled).toBe(false);

      const startPromise = service.start(app);

      // Wait a bit for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.initializeCalled).toBe(true);

      await service.testStop();
    });

    it('should call setupRoutes method on start', async () => {
      expect(service.setupRoutesCalled).toBe(false);

      const startPromise = service.start(app);

      // Wait a bit for setup
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.setupRoutesCalled).toBe(true);

      await service.testStop();
    });

    it('should preserve service configuration', () => {
      const config = service.getConfig();

      expect(config.name).toBe('test-service');
      expect(config.version).toBe('1.0.0');
      expect(config.port).toBe(3999);
      expect(config.shutdownTimeout).toBe(1000);
    });
  });

  describe('Health Check Endpoint', () => {
    it('should setup health check endpoint automatically', async () => {
      const startPromise = service.start(app);

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 200));

      // Test health endpoint
      const response = await fetch('http://localhost:3999/health');
      const health = await response.json() as HealthStatus;

      expect(response.status).toBe(200);
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('test-service');
      expect(health.version).toBe('1.0.0');
      expect(health.uptime).toBeGreaterThan(0);

      await service.testStop();
    });

    it('should include custom health checks', async () => {
      const startPromise = service.start(app);

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 200));

      const response = await fetch('http://localhost:3999/health');
      const health = await response.json() as HealthStatus;

      expect(health.checks).toBeDefined();
      expect(health.checks?.testComponent).toBeDefined();
      expect(health.checks?.testComponent.status).toBe('up');

      await service.testStop();
    });

    it('should call healthCheck method', async () => {
      const startPromise = service.start(app);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(service.healthCheckCalled).toBe(false);

      await fetch('http://localhost:3999/health');

      expect(service.healthCheckCalled).toBe(true);

      await service.testStop();
    });
  });

  describe('Custom Routes', () => {
    it('should setup custom routes', async () => {
      const startPromise = service.start(app);

      await new Promise(resolve => setTimeout(resolve, 200));

      const response = await fetch('http://localhost:3999/test');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('test endpoint');

      await service.testStop();
    });
  });

  describe('Graceful Shutdown', () => {
    it('should stop gracefully', async () => {
      const startPromise = service.start(app);

      await new Promise(resolve => setTimeout(resolve, 200));

      await expect(service.testStop()).resolves.not.toThrow();
    });

    it('should cleanup resources on stop', async () => {
      let cleanupCalled = false;

      service.registerResource({
        name: 'test-resource',
        cleanup: async () => {
          cleanupCalled = true;
        },
      });

      const startPromise = service.start(app);
      await new Promise(resolve => setTimeout(resolve, 200));

      await service.testStop();

      expect(cleanupCalled).toBe(true);
    });

    it('should handle shutdown timeout', async () => {
      service.registerResource({
        name: 'slow-resource',
        cleanup: async () => {
          // Simulate slow cleanup
          await new Promise(resolve => setTimeout(resolve, 5000));
        },
      });

      const startPromise = service.start(app);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should timeout after 1 second (configured in constructor)
      const stopStart = Date.now();
      await expect(service.testStop()).rejects.toThrow();
      const stopDuration = Date.now() - stopStart;

      // Should be close to 1000ms timeout
      expect(stopDuration).toBeGreaterThan(900);
      expect(stopDuration).toBeLessThan(2000);
    });
  });

  describe('Resource Management', () => {
    it('should register resources', async () => {
      let resourceRegistered = false;

      service.registerResource({
        name: 'test-resource',
        cleanup: async () => {
          resourceRegistered = true;
        },
      });

      const startPromise = service.start(app);
      await new Promise(resolve => setTimeout(resolve, 200));

      await service.testStop();

      expect(resourceRegistered).toBe(true);
    });

    it('should cleanup multiple resources', async () => {
      const cleanupFlags = { res1: false, res2: false, res3: false };

      service.registerResource({
        name: 'resource1',
        cleanup: async () => { cleanupFlags.res1 = true; },
      });

      service.registerResource({
        name: 'resource2',
        cleanup: async () => { cleanupFlags.res2 = true; },
      });

      service.registerResource({
        name: 'resource3',
        cleanup: async () => { cleanupFlags.res3 = true; },
      });

      const startPromise = service.start(app);
      await new Promise(resolve => setTimeout(resolve, 200));

      await service.testStop();

      expect(cleanupFlags.res1).toBe(true);
      expect(cleanupFlags.res2).toBe(true);
      expect(cleanupFlags.res3).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      class FailingService extends TestService {
        protected async initialize(): Promise<void> {
          throw new Error('Initialization failed');
        }
      }

      const failingService = new FailingService(4000);
      const app = express();

      await expect(failingService.start(app)).rejects.toThrow('Initialization failed');
    });

    it('should prevent starting during shutdown', async () => {
      const startPromise = service.start(app);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Start shutdown
      const stopPromise = service.testStop();

      // Try to start again during shutdown
      const app2 = express();
      await expect(service.start(app2)).rejects.toThrow('Cannot start service during shutdown');

      await stopPromise;
    });
  });
});
