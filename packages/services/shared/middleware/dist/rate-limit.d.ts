/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per user/IP
 */
import { Request, Response, NextFunction } from 'express';
export interface RateLimitOptions {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
/**
 * Rate Limit Middleware
 *
 * Default: 100 requests per minute per user/IP
 */
export declare const rateLimit: (options?: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per minute
 */
export declare const strictRateLimit: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Moderate rate limiter for API endpoints
 * 100 requests per minute
 */
export declare const moderateRateLimit: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Lenient rate limiter for read-only endpoints
 * 300 requests per minute
 */
export declare const lenientRateLimit: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Cleanup expired entries periodically
 * Call this every 5 minutes in production
 */
export declare const cleanupRateLimitStore: () => void;
//# sourceMappingURL=rate-limit.d.ts.map