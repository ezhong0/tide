import { env, getAllowedOrigins } from './env';

/**
 * HTTP server configuration
 */
export const serverConfig = {
  port: env.PORT,
  cors: {
    origins: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
};

/**
 * WebSocket configuration
 *
 * Week 3 Alpha uses Supabase Realtime for WebSocket connections.
 * No custom WebSocket server is needed.
 */
