import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLogger } from '@tide/utils';
import { register as registerMetrics, collectDefaultMetrics } from 'prom-client';

const logger = createLogger('gateway');

// Configuration
const PORT = process.env.GATEWAY_PORT || 4000;
const CORS_ORIGIN = (process.env.GATEWAY_CORS_ORIGIN || 'http://localhost:3000').split(',');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Metrics
collectDefaultMetrics({ register: registerMetrics });

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    service: 'gateway',
  });
});

// Metrics endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registerMetrics.contentType);
  res.end(await registerMetrics.metrics());
});

// Proxy to auth service
app.use('/auth', async (req, res) => {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
    const response = await fetch(`${authServiceUrl}${req.path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    logger.error('Proxy error', error as Error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Proxy error',
      timestamp: Date.now(),
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
    timestamp: Date.now(),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('Gateway started', { port: PORT });
});
