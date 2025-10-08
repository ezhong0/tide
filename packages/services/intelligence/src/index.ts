import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@tide/logger';
import {
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import intelligenceRoutes from './routes/intelligence.routes.js';

/**
 * Intelligence Service
 * Aggregates data from all services to provide daily snapshots and intelligence
 */
class IntelligenceService {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());

    // Rate limiting (100 req/min)
    this.app.use(moderateRateLimit);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userId: req.user?.userId,
        },
        'Incoming request'
      );
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'intelligence',
        timestamp: new Date().toISOString(),
      });
    });

    // Intelligence routes
    this.app.use('/intelligence', intelligenceRoutes);

    // 404 handler - must be before error handler
    this.app.use(notFoundHandler);

    // Error handler - must be last
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    const port = process.env.INTELLIGENCE_SERVICE_PORT || 3002;

    this.app.listen(port, () => {
      logger.info({ port, service: 'intelligence' }, 'Intelligence service started');
    });
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new IntelligenceService();
  service.start().catch((error) => {
    logger.error({ error }, 'Failed to start intelligence service');
    process.exit(1);
  });
}

export { IntelligenceService };
export { DailySnapshotAggregator } from './aggregators/daily-snapshot-aggregator.js';
export * from './types/index.js';
