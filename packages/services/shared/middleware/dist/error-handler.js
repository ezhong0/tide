/**
 * Error Handling Middleware
 * Standardized error responses across all services
 */
import { createLogger } from '@tide/logger';
const logger = createLogger({ component: 'ErrorHandler' });
/**
 * Standard API Error
 */
export class APIError extends Error {
    statusCode;
    message;
    code;
    details;
    constructor(statusCode, message, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.details = details;
        this.name = 'APIError';
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Common API Errors
 */
export class BadRequestError extends APIError {
    constructor(message = 'Bad Request', details) {
        super(400, message, 'BAD_REQUEST', details);
    }
}
export class UnauthorizedError extends APIError {
    constructor(message = 'Unauthorized', details) {
        super(401, message, 'UNAUTHORIZED', details);
    }
}
export class ForbiddenError extends APIError {
    constructor(message = 'Forbidden', details) {
        super(403, message, 'FORBIDDEN', details);
    }
}
export class NotFoundError extends APIError {
    constructor(message = 'Resource not found', details) {
        super(404, message, 'NOT_FOUND', details);
    }
}
export class ConflictError extends APIError {
    constructor(message = 'Conflict', details) {
        super(409, message, 'CONFLICT', details);
    }
}
export class ValidationError extends APIError {
    constructor(message = 'Validation failed', details) {
        super(422, message, 'VALIDATION_ERROR', details);
    }
}
export class TooManyRequestsError extends APIError {
    constructor(message = 'Too many requests', details) {
        super(429, message, 'TOO_MANY_REQUESTS', details);
    }
}
export class InternalServerError extends APIError {
    constructor(message = 'Internal server error', details) {
        super(500, message, 'INTERNAL_SERVER_ERROR', details);
    }
}
export class ServiceUnavailableError extends APIError {
    constructor(message = 'Service unavailable', details) {
        super(503, message, 'SERVICE_UNAVAILABLE', details);
    }
}
/**
 * Error Handler Middleware
 * Must be registered LAST in the middleware chain
 */
export const errorHandler = (err, req, res, next) => {
    // Default error response
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details = undefined;
    // Handle APIError instances
    if (err instanceof APIError) {
        statusCode = err.statusCode;
        errorCode = err.code || 'API_ERROR';
        message = err.message;
        details = err.details;
    }
    // Handle Validation Errors (Zod, Joi, etc.)
    else if (err.name === 'ZodError' || err.name === 'ValidationError') {
        statusCode = 422;
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = err.errors || err.details;
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'TOKEN_EXPIRED';
        message = 'Authentication token expired';
    }
    // Handle generic errors
    else {
        message = err.message || message;
    }
    // Log error
    if (statusCode >= 500) {
        logger.error('Server error', {
            error: err.message,
            stack: err.stack,
            statusCode,
            errorCode,
            url: req.url,
            method: req.method,
            userId: req.user?.userId,
        });
    }
    else {
        logger.warn('Client error', {
            error: err.message,
            statusCode,
            errorCode,
            url: req.url,
            method: req.method,
            userId: req.user?.userId,
        });
    }
    // Send error response
    const errorResponse = {
        error: errorCode,
        message,
    };
    if (details) {
        errorResponse.details = details;
    }
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
/**
 * 404 Not Found Handler
 * Register this before the error handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route not found: ${req.method} ${req.path}`,
    });
};
/**
 * Async Route Handler Wrapper
 * Automatically catches errors from async route handlers
 *
 * Usage:
 *   app.get('/users', asyncHandler(async (req, res) => {
 *     const users = await getUsers();
 *     res.json(users);
 *   }));
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=error-handler.js.map