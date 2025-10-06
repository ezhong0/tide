import 'dotenv/config';
import express from 'express';
import { createExpressEndpoints } from '@ts-rest/express';
import { authContract } from '@tide/contracts';
import { createLogger } from '@tide/utils';
import { EventBus } from '@tide/event-bus';
import { DatabaseClient } from './db/client.js';
import { JWTService } from './utils/jwt.js';
import { PasswordService } from './utils/password.js';
import { AuthService } from './service.js';
import { register as registerMetrics, collectDefaultMetrics } from 'prom-client';

const logger = createLogger('auth-service');

// Configuration
const PORT = process.env.AUTH_SERVICE_PORT || 4001;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://tide:tide_dev_password@localhost:5432/tide';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:29092').split(',');

// Initialize services
const db = new DatabaseClient({ connectionString: DATABASE_URL });
const jwtService = new JWTService(JWT_SECRET);
const passwordService = new PasswordService();
const eventBus = new EventBus({
  brokers: KAFKA_BROKERS,
  clientId: 'auth-service',
  groupId: 'auth-service-group',
});
const authService = new AuthService(db, jwtService, passwordService, eventBus);

// Initialize Express app
const app = express();
app.use(express.json());

// Metrics
collectDefaultMetrics({ register: registerMetrics });

// Health check
app.get('/health', async (_req, res) => {
  const dbHealthy = await db.healthCheck();
  const healthy = dbHealthy;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: Date.now(),
    services: {
      database: dbHealthy,
    },
  });
});

// Metrics endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registerMetrics.contentType);
  res.end(await registerMetrics.metrics());
});

// Create ts-rest endpoints
createExpressEndpoints(authContract, authService.getRouter(), app, {
  logInitialization: false,
  jsonQuery: true,
  responseValidation: true,
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', err, {
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp: Date.now(),
  });
});

// Start server
async function start() {
  try {
    // Connect to event bus
    await eventBus.connect();
    logger.info('Connected to event bus');

    // Start Express server
    app.listen(PORT, () => {
      logger.info('Auth service started', { port: PORT });
    });
  } catch (error) {
    logger.error('Failed to start service', error as Error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await eventBus.disconnect();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await eventBus.disconnect();
  await db.close();
  process.exit(0);
});

start();
