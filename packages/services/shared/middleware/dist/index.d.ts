/**
 * Tide Shared Middleware
 * Common middleware for all Tide backend services
 */
export { authenticateJWT, optionalAuth, requireRole, getUserId, requireUserId, } from './auth.js';
export { rateLimit, strictRateLimit, moderateRateLimit, lenientRateLimit, cleanupRateLimitStore, type RateLimitOptions, } from './rate-limit.js';
export { errorHandler, notFoundHandler, asyncHandler, APIError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError, TooManyRequestsError, InternalServerError, ServiceUnavailableError, } from './error-handler.js';
export { correlationId, correlationLogger, getCorrelationHeaders, createCorrelationHeaders, } from './correlation.js';
export { initializeAuth } from './auth.js';
//# sourceMappingURL=index.d.ts.map