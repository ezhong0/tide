import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(__dirname, '../../../../.env') });
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { logger } from '@tide/logger';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error-handler';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const requestLogger = logger.child({
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  requestLogger.info('Request received');
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);

// Error handling (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.AUTH_SERVICE_PORT ? parseInt(process.env.AUTH_SERVICE_PORT) : 4001;

app.listen(PORT, () => {
  logger.info({ port: PORT, service: 'auth' }, 'Auth service started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
