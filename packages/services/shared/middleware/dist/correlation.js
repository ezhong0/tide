/**
 * Correlation ID Middleware
 * Adds unique correlation ID to each request for distributed tracing
 */
import { v4 as uuidv4 } from 'uuid';
import { logger as baseLogger } from '@tide/logger';
/**
 * Correlation ID Middleware
 * Extracts or generates a correlation ID for request tracing
 */
export const correlationId = (req, res, next) => {
    // Get correlation ID from header or generate new one
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    // Set correlation ID in response header for client tracking
    res.setHeader('X-Correlation-ID', req.correlationId);
    next();
};
/**
 * Correlation Logger Middleware
 * Creates a child logger with correlation ID for request-scoped logging
 * Must be used after correlationId middleware
 */
export const correlationLogger = (req, res, next) => {
    if (!req.correlationId) {
        // If correlation ID middleware wasn't used, generate one
        req.correlationId = uuidv4();
        res.setHeader('X-Correlation-ID', req.correlationId);
    }
    // Create child logger with correlation ID
    req.log = baseLogger.child({
        correlationId: req.correlationId,
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
    });
    // Log incoming request
    req.log.info({
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    }, 'Incoming request');
    // Log response on finish
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        req.log?.info({
            statusCode: res.statusCode,
            duration,
        }, 'Request completed');
    });
    next();
};
/**
 * Helper to propagate correlation ID in inter-service HTTP requests
 * Use this when making requests to other services
 */
export function getCorrelationHeaders(req) {
    return {
        'X-Correlation-ID': req.correlationId || uuidv4(),
    };
}
/**
 * Helper to create correlation headers for background jobs
 */
export function createCorrelationHeaders(correlationId) {
    return {
        'X-Correlation-ID': correlationId || uuidv4(),
    };
}
//# sourceMappingURL=correlation.js.map