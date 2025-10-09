/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per user/IP
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'RateLimiter' });

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
}

/**
 * Rate Limit Middleware
 *
 * Default: 100 requests per minute per user/IP
 */
export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 100,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      // Reset if window has passed
      if (!entry || entry.resetAt <= now) {
        entry = {
          count: 0,
          resetAt: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

        logger.warn('Rate limit exceeded', {
          key,
          count: entry.count,
          limit: maxRequests,
          retryAfter,
        });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
        });
      }

      // Add rate limit headers BEFORE calling next()
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
      res.setHeader('X-RateLimit-Reset', entry.resetAt.toString());

      // Handle conditional counting
      if (skipSuccessfulRequests || skipFailedRequests) {
        // Intercept response to conditionally increment counter
        const originalSend = res.send;
        res.send = function (body: any) {
          const statusCode = res.statusCode;
          const isSuccess = statusCode >= 200 && statusCode < 300;
          const shouldSkip =
            (skipSuccessfulRequests && isSuccess) ||
            (skipFailedRequests && !isSuccess);

          if (!shouldSkip) {
            entry.count++;
          }

          return originalSend.call(this, body);
        };
      } else {
        // Increment counter immediately for non-conditional counting
        entry.count++;
      }

      next();

    } catch (error) {
      logger.error('Rate limit middleware error', { error });
      // Don't block requests on rate limiter errors
      next();
    }
  };
};

/**
 * Default key generator
 * Uses userId if authenticated, otherwise IP address
 */
function defaultKeyGenerator(req: Request): string {
  // Prefer user ID if authenticated
  if (req.user?.userId) {
    return `user:${req.user.userId}`;
  }

  // Fall back to IP address
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per minute
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

/**
 * Moderate rate limiter for API endpoints
 * 100 requests per minute
 */
export const moderateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/**
 * Lenient rate limiter for read-only endpoints
 * 300 requests per minute
 */
export const lenientRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 300,
});

/**
 * Cleanup expired entries periodically
 * Call this every 5 minutes in production
 */
export const cleanupRateLimitStore = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug('Cleaned up rate limit store', { cleaned });
  }
};

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
