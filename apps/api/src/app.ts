import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastify, { FastifyInstance } from 'fastify';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { registerSentryWithFastify } from './config/monitoring.js';
import { register as metricsRegister } from './config/metrics.js';
import { registerSwagger } from './config/swagger.js';
import { wsService } from './services/websocket.js';

/**
 * Create and configure Fastify application
 */
export async function createApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger,
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    trustProxy: true,
  });

  // Register Sentry error tracking
  registerSentryWithFastify(app);

  // Register Swagger/OpenAPI documentation (before routes)
  if (env.NODE_ENV !== 'production') {
    await registerSwagger(app);
  }

  // Register WebSocket server
  await wsService.register(app);

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // CORS configuration
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: env.CORS_CREDENTIALS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    cache: 10000, // Store rate limit data for 10k unique IPs
    allowList: ['127.0.0.1'], // Whitelist localhost
    redis: undefined, // TODO: Add Redis for distributed rate limiting
    keyGenerator: (request) => {
      return request.headers['x-forwarded-for'] as string || request.ip;
    },
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    };
  });

  // Metrics endpoint (Prometheus format)
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metricsRegister.contentType);
    return metricsRegister.metrics();
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(
      {
        err: error,
        requestId: request.id,
        method: request.method,
        url: request.url,
      },
      'Request error'
    );

    // Don't expose internal errors in production
    const statusCode = error.statusCode || 500;
    const message =
      statusCode >= 500 && env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;

    reply.status(statusCode).send({
      error: {
        message,
        statusCode,
        ...(env.NODE_ENV === 'development' && { stack: error.stack }),
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        message: 'Route not found',
        statusCode: 404,
        path: request.url,
      },
    });
  });

  // Request logging
  app.addHook('onRequest', async (request) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        headers: {
          'user-agent': request.headers['user-agent'],
        },
      },
      'Incoming request'
    );
  });

  // Response logging
  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.getResponseTime(),
      },
      'Request completed'
    );
  });

  return app;
}
