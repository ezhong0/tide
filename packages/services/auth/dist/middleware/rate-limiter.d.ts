/**
 * Rate limiter for authentication endpoints
 *
 * Protects against brute force attacks by limiting:
 * - 5 requests per 15 minutes per IP for login/register
 * - 10 requests per 15 minutes per IP for token refresh
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const tokenRefreshLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General rate limiter for all auth endpoints
 * More lenient than auth-specific limiters
 */
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rate-limiter.d.ts.map