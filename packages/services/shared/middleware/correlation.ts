/**
 * Request Correlation Middleware
 * Adds correlation IDs to requests for distributed tracing
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'CorrelationMiddleware' });

// Extend Express Request type to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Correlation ID Middleware
 *
 * Features:
 * - Generates unique correlation ID for each request
 * - Preserves existing correlation ID from headers
 * - Adds correlation ID to response headers
 * - Enables request tracing across services
 *
 * Headers:
 * - X-Correlation-ID: Incoming correlation ID
 * - X-Request-ID: Outgoing correlation ID (for compatibility)
 */
export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check for existing correlation ID from upstream
  const incomingCorrelationId =
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    req.headers['request-id'];

  // Generate or use existing correlation ID
  const correlationId = typeof incomingCorrelationId === 'string'
    ? incomingCorrelationId
    : randomUUID();

  // Attach to request object
  req.correlationId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', correlationId); // For compatibility

  // Log request with correlation
  logger.info({
    correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Request received');

  // Track response time
  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error' :
                  res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]({
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    }, 'Request completed');
  });

  next();
};

/**
 * Get correlation ID from request
 * Use this in services to propagate correlation to downstream calls
 */
export function getCorrelationId(req: Request): string | undefined {
  return req.correlationId;
}

/**
 * Create headers with correlation ID for outgoing requests
 *
 * Example:
 * ```typescript
 * const headers = createCorrelatedHeaders(req);
 * await fetch(url, { headers });
 * ```
 */
export function createCorrelatedHeaders(
  req: Request,
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    'X-Correlation-ID': req.correlationId || randomUUID(),
    ...additionalHeaders,
  };
}
