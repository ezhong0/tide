import rateLimit from 'express-rate-limit';
import { logger } from '@tide/logger';

/**
 * Rate limiter for authentication endpoints
 *
 * Protects against brute force attacks by limiting:
 * - 5 requests per 15 minutes per IP for login/register
 * - 10 requests per 15 minutes per IP for token refresh
 */

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        method: req.method,
      },
      'Rate limit exceeded for authentication'
    );

    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
      retryAfter: '15 minutes',
    });
  },
  // Skip rate limiting for successful requests (only count failed attempts)
  skip: (req, res) => {
    // This runs after the response, so we can check the status
    return res.statusCode < 400;
  },
});

export const tokenRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // More lenient for token refresh
  message: 'Too many token refresh requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
      },
      'Rate limit exceeded for token refresh'
    );

    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many token refresh requests from this IP, please try again after 15 minutes',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * General rate limiter for all auth endpoints
 * More lenient than auth-specific limiters
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests from this IP, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});
