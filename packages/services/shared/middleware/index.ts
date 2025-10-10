/**
 * Tide Shared Middleware
 * Common middleware for all Tide backend services
 */

export {
  authenticateJWT,
  optionalAuth,
  requireRole,
  getUserId,
  requireUserId,
} from './auth.js';

export {
  rateLimit,
  strictRateLimit,
  moderateRateLimit,
  lenientRateLimit,
  cleanupRateLimitStore,
  type RateLimitOptions,
} from './rate-limit.js';

export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
} from './error-handler.js';

export {
  correlationId,
  correlationLogger,
  getCorrelationHeaders,
  createCorrelationHeaders,
} from './correlation.js';

export {
  performanceMonitor,
  measureAsync,
  Measure,
  queryTracker,
  QueryPerformanceTracker,
} from './performance.js';

export {
  validateRequest,
  sanitizeInput,
  validatePagination,
  requireHeaders,
  requireContentType,
  type ValidationSchemas,
} from './request-validator.js';

// Re-export auth initialization
export { initializeAuth } from './auth.js';
