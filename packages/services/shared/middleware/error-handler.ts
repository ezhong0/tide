/**
 * Error Handling Middleware
 * Standardized error responses across all services
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'ErrorHandler' });

/**
 * Standard API Error
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common API Errors
 */
export class BadRequestError extends APIError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(401, message, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(403, message, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(404, message, 'NOT_FOUND', details);
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Conflict', details?: any) {
    super(409, message, 'CONFLICT', details);
  }
}

export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}

export class TooManyRequestsError extends APIError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(429, message, 'TOO_MANY_REQUESTS', details);
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details);
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(message: string = 'Service unavailable', details?: any) {
    super(503, message, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Error Handler Middleware
 * Must be registered LAST in the middleware chain
 */
export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

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
    details = (err as any).errors || (err as any).details;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
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
  } else {
    logger.warn('Client error', {
      error: err.message,
      statusCode,
      errorCode,
      url: req.url,
      method: req.method,
      userId: req.user?.userId,
    });
  }

  // Check if headers have already been sent
  if (res.headersSent) {
    logger.warn('Headers already sent, cannot send error response', {
      statusCode,
      errorCode,
      url: req.url,
      method: req.method,
    });
    return next(err);
  }

  // Send error response
  const errorResponse: any = {
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
export const notFoundHandler = (req: Request, res: Response) => {
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
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
