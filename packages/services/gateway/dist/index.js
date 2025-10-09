import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from './simple-logger.js';
import { moderateRateLimit, errorHandler, notFoundHandler, } from '@tide/middleware';
/**
 * API Gateway (REST Proxy)
 *
 * For Alpha: Simple REST proxy to backend services with authentication
 * GraphQL gateway will be added in later weeks
 */
const app = express();
// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
// Body parsing
app.use(express.json({ limit: '10mb' }));
// Rate limiting (100 req/min per user)
app.use(moderateRateLimit);
// Request logging
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.userId,
    }, 'Incoming request');
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '0.1.0',
        mode: 'rest-proxy',
    });
});
// Service URLs from environment
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3003';
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
const CALENDAR_SERVICE_URL = process.env.CALENDAR_SERVICE_URL || 'http://localhost:3002';
const WORKFLOW_SERVICE_URL = process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3004';
// Proxy routes to backend services
app.use('/api/ai', createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '' },
    timeout: 60000, // 60 second timeout
    proxyTimeout: 60000,
}));
app.use('/api/email', createProxyMiddleware({
    target: EMAIL_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/email': '' },
    timeout: 60000, // 60 second timeout for OAuth flows
    proxyTimeout: 60000,
}));
app.use('/api/calendar', createProxyMiddleware({
    target: CALENDAR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/calendar': '' },
    timeout: 60000, // 60 second timeout
    proxyTimeout: 60000,
}));
app.use('/api/workflow', createProxyMiddleware({
    target: WORKFLOW_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/workflow': '' },
    timeout: 60000, // 60 second timeout
    proxyTimeout: 60000,
}));
// Root endpoint - landing page
app.get('/', (req, res) => {
    res.json({
        name: 'Tide API Gateway',
        version: '0.1.0',
        mode: 'rest-proxy',
        status: 'healthy',
        endpoints: {
            health: '/health',
            services: '/api/services',
            ai: '/api/ai/*',
            email: '/api/email/*',
            calendar: '/api/calendar/*',
            workflow: '/api/workflow/*',
        },
        documentation: 'https://github.com/ezhong0/tide',
    });
});
// Services info endpoint
app.get('/api/services', (req, res) => {
    res.json({
        services: {
            ai: { url: AI_SERVICE_URL, path: '/api/ai' },
            email: { url: EMAIL_SERVICE_URL, path: '/api/email' },
            calendar: { url: CALENDAR_SERVICE_URL, path: '/api/calendar' },
            workflow: { url: WORKFLOW_SERVICE_URL, path: '/api/workflow' },
        },
    });
});
// GraphQL endpoint placeholder
app.all('/graphql', (req, res) => {
    res.status(501).json({
        error: 'GraphQL not yet implemented',
        message: 'Alpha deployment uses REST proxy. GraphQL coming in later weeks.',
        hint: 'Use /api/{service} endpoints instead',
    });
});
// 404 handler - must be registered before error handler
app.use(notFoundHandler);
// Error handler - must be registered LAST
app.use(errorHandler);
// Start server
const PORT = parseInt(process.env.GATEWAY_PORT || '4000', 10);
app.listen(PORT, () => {
    logger.info({
        port: PORT,
        service: 'gateway',
        mode: 'rest-proxy',
        services: {
            ai: AI_SERVICE_URL,
            email: EMAIL_SERVICE_URL,
            calendar: CALENDAR_SERVICE_URL,
            workflow: WORKFLOW_SERVICE_URL,
        },
    }, 'API Gateway started');
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
//# sourceMappingURL=index.js.map