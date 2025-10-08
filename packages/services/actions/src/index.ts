import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@tide/logger';
import {
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import actionsRoutes from './routes/actions.routes.js';

/**
 * Actions Service
 * Manages action suggestions, approvals, and execution
 */
class ActionsService {
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
        service: 'actions',
        timestamp: new Date().toISOString(),
      });
    });

    // Actions routes
    this.app.use('/actions', actionsRoutes);

    // 404 handler - must be before error handler
    this.app.use(notFoundHandler);

    // Error handler - must be last
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    const port = process.env.ACTIONS_SERVICE_PORT || 3006;

    this.app.listen(port, () => {
      logger.info({ port, service: 'actions' }, 'Actions service started');
    });
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new ActionsService();
  service.start().catch((error) => {
    logger.error({ error }, 'Failed to start actions service');
    process.exit(1);
  });
}

export { ActionsService };
export { ActionExecutor } from './executor/action-executor.js';
export { ActionSuggester } from './suggestions/action-suggester.js';
export { CapabilityMatrix } from './executor/capability-matrix.js';
export * from './types/index.js';
