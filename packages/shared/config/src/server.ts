import { env, getAllowedOrigins, getWebSocketOrigins } from './env';

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
 * WebSocket server configuration
 */
export const websocketConfig = {
  port: env.WEBSOCKET_PORT,
  cors: {
    origins: getWebSocketOrigins(),
    credentials: true,
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  maxHttpBufferSize: 1e6, // 1MB
  transports: ['websocket', 'polling'],
};
