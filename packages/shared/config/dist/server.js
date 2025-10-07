"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketConfig = exports.serverConfig = void 0;
const env_1 = require("./env");
/**
 * HTTP server configuration
 */
exports.serverConfig = {
    port: env_1.env.PORT,
    cors: {
        origins: (0, env_1.getAllowedOrigins)(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    },
    rateLimit: {
        windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    },
};
/**
 * WebSocket server configuration
 */
exports.websocketConfig = {
    port: env_1.env.WEBSOCKET_PORT,
    cors: {
        origins: (0, env_1.getWebSocketOrigins)(),
        credentials: true,
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    maxHttpBufferSize: 1e6, // 1MB
    transports: ['websocket', 'polling'],
};
