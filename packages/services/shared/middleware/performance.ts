/**
 * Performance Monitoring Middleware
 * Tracks request duration and adds performance headers
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'PerformanceMonitor' });

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  endpoint: string;
  method: string;
  statusCode?: number;
  userId?: string;
}

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
export function performanceMonitor(options: {
  slowRequestThreshold?: number; // Log warning if request takes longer (ms)
  includeHeaders?: boolean; // Include timing headers in response
} = {}) {
  const {
    slowRequestThreshold = 1000, // 1 second default
    includeHeaders = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Store start time in request for later access
    (req as any).performanceStartTime = startTime;

    // Hook into response finish event
    const originalEnd = res.end.bind(res);
    res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Add performance headers
      if (includeHeaders) {
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', (req as any).requestId || 'unknown');
      }

      // Log metrics
      const metrics: PerformanceMetrics = {
        startTime,
        endTime,
        duration,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        userId: (req as any).user?.userId,
      };

      // Log slow requests
      if (duration > slowRequestThreshold) {
        logger.warn('Slow request detected', {
          ...metrics,
          threshold: slowRequestThreshold,
        });
      } else {
        logger.debug('Request completed', metrics);
      }

      // Restore original end function and call it
      // Need to handle various overloads of res.end()
      if (typeof chunk === 'function') {
        // end(callback)
        return originalEnd(chunk) as Response;
      } else if (typeof encoding === 'function') {
        // end(chunk, callback)
        return originalEnd(chunk, encoding) as Response;
      } else if (callback) {
        // end(chunk, encoding, callback)
        return originalEnd(chunk, encoding, callback) as Response;
      } else if (encoding) {
        // end(chunk, encoding)
        return originalEnd(chunk, encoding) as Response;
      } else if (chunk !== undefined) {
        // end(chunk)
        return originalEnd(chunk) as Response;
      } else {
        // end()
        return originalEnd() as Response;
      }
    };

    next();
  };
}

/**
 * Utility to measure async function execution time
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    logger.debug('Async operation completed', { label, duration });
    
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Async operation failed', { label, duration, error });
    throw error;
  }
}

/**
 * Decorator for measuring method execution time
 */
export function Measure(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.debug('Method executed', { method: methodLabel, duration });
        
        return result;
      } catch (error) {
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
  private queries: Map<string, { count: number; totalDuration: number; maxDuration: number }> = new Map();

  track(query: string, duration: number): void {
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

  reset(): void {
    this.queries.clear();
  }
}

// Singleton instance for global query tracking
export const queryTracker = new QueryPerformanceTracker();

