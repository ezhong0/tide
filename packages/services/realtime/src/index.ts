import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(__dirname, '../../../../.env') });
import express, { Express } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@tide/logger';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/error-handler';
import { ConnectionManager } from './websocket/connection-manager';

const app: Express = express();
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/realtime'
});

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

// Error handling (must be last)
app.use(errorHandler);

// Initialize connection manager
const connectionManager = new ConnectionManager(wss);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  logger.info({ path: req.url }, 'New WebSocket connection');
  connectionManager.handleConnection(ws, req);
});

// Start server
const PORT = process.env.REALTIME_SERVICE_PORT ? parseInt(process.env.REALTIME_SERVICE_PORT) : 4002;

server.listen(PORT, () => {
  logger.info({
    port: PORT,
    service: 'realtime',
    wsPath: '/realtime'
  }, 'Realtime service started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

export default app;
