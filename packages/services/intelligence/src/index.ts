import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { ServiceBase, type HealthStatus } from '@tide/base';
import { SupabaseConnectionManager } from '@tide/database';
import {
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import intelligenceRoutes from './routes/intelligence.routes.js';

/**
 * Intelligence Service
 * Aggregates data from all services to provide daily snapshots and intelligence
 * Extends ServiceBase for graceful shutdown and resource management
 */
class IntelligenceService extends ServiceBase {
  constructor() {
    super({
      name: 'intelligence',
      version: '0.1.0',
      port: env.PORT || 3002,
      shutdownTimeout: 10000,
    });
  }

  protected async initialize(): Promise<void> {
    // Register database cleanup
    this.registerResource({
      name: 'database',
      cleanup: async () => {
        await SupabaseConnectionManager.cleanup();
      },
    });

    this.logger.info('Intelligence service initialized successfully');
  }

  protected setupRoutes(app: express.Application): void {
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(moderateRateLimit);

    // Request logging
    app.use((req, res, next) => {
      this.logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.userId,
      }, 'Incoming request');
      next();
    });

    // Intelligence routes
    app.use('/intelligence', intelligenceRoutes);

    // 404 handler - must be before error handler
    app.use(notFoundHandler);

    // Error handler - must be last
    app.use(errorHandler);
  }

  protected async healthCheck(): Promise<Partial<HealthStatus>> {
    const dbStatus = SupabaseConnectionManager.getStatus();

    return {
      checks: {
        database: {
          status: dbStatus.serviceRole ? 'up' : 'down',
          details: dbStatus,
        },
      },
    };
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = express();
  const service = new IntelligenceService();

  service.start(app).catch((error) => {
    console.error('Failed to start intelligence service:', error);
    process.exit(1);
  });
}

export { IntelligenceService };
export { DailySnapshotAggregator } from './aggregators/daily-snapshot-aggregator.js';
export * from './types/index.js';
