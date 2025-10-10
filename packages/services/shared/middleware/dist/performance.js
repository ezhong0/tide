/**
 * Performance Monitoring Middleware
 * Tracks request duration and adds performance headers
 */
import { createLogger } from '@tide/logger';
const logger = createLogger({ component: 'PerformanceMonitor' });
/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
export function performanceMonitor(options = {}) {
    const { slowRequestThreshold = 1000, // 1 second default
    includeHeaders = true, } = options;
    return (req, res, next) => {
        const startTime = Date.now();
        // Store start time in request for later access
        req.performanceStartTime = startTime;
        // Hook into response finish event
        const originalEnd = res.end.bind(res);
        res.end = function (chunk, encoding, callback) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Add performance headers
            if (includeHeaders) {
                res.setHeader('X-Response-Time', `${duration}ms`);
                res.setHeader('X-Request-ID', req.requestId || 'unknown');
            }
            // Log metrics
            const metrics = {
                startTime,
                endTime,
                duration,
                endpoint: req.path,
                method: req.method,
                statusCode: res.statusCode,
                userId: req.user?.userId,
            };
            // Log slow requests
            if (duration > slowRequestThreshold) {
                logger.warn('Slow request detected', {
                    ...metrics,
                    threshold: slowRequestThreshold,
                });
            }
            else {
                logger.debug('Request completed', metrics);
            }
            // Restore original end function and call it
            // Need to handle various overloads of res.end()
            if (typeof chunk === 'function') {
                // end(callback)
                return originalEnd(chunk);
            }
            else if (typeof encoding === 'function') {
                // end(chunk, callback)
                return originalEnd(chunk, encoding);
            }
            else if (callback) {
                // end(chunk, encoding, callback)
                return originalEnd(chunk, encoding, callback);
            }
            else if (encoding) {
                // end(chunk, encoding)
                return originalEnd(chunk, encoding);
            }
            else if (chunk !== undefined) {
                // end(chunk)
                return originalEnd(chunk);
            }
            else {
                // end()
                return originalEnd();
            }
        };
        next();
    };
}
/**
 * Utility to measure async function execution time
 */
export async function measureAsync(fn, label) {
    const startTime = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - startTime;
        logger.debug('Async operation completed', { label, duration });
        return { result, duration };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Async operation failed', { label, duration, error });
        throw error;
    }
}
/**
 * Decorator for measuring method execution time
 */
export function Measure(label) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const methodLabel = label || `${target.constructor.name}.${propertyKey}`;
        descriptor.value = async function (...args) {
            const startTime = Date.now();
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;
                logger.debug('Method executed', { method: methodLabel, duration });
                return result;
            }
            catch (error) {
                const duration = Date.now() - startTime;
                logger.error('Method execution failed', {
                    method: methodLabel,
                    duration,
                    error
                });
                throw error;
            }
        };
        return descriptor;
    };
}
/**
 * Track database query performance
 */
export class QueryPerformanceTracker {
    queries = new Map();
    track(query, duration) {
        const existing = this.queries.get(query) || { count: 0, totalDuration: 0, maxDuration: 0 };
        this.queries.set(query, {
            count: existing.count + 1,
            totalDuration: existing.totalDuration + duration,
            maxDuration: Math.max(existing.maxDuration, duration),
        });
        // Log slow queries
        if (duration > 100) {
            logger.warn('Slow query detected', { query, duration });
        }
    }
    getStats() {
        const stats = Array.from(this.queries.entries()).map(([query, data]) => ({
            query,
            count: data.count,
            averageDuration: data.totalDuration / data.count,
            maxDuration: data.maxDuration,
        }));
        return stats.sort((a, b) => b.averageDuration - a.averageDuration);
    }
    reset() {
        this.queries.clear();
    }
}
// Singleton instance for global query tracking
export const queryTracker = new QueryPerformanceTracker();
//# sourceMappingURL=performance.js.map