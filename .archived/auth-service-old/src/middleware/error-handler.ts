import { Request, Response, NextFunction } from 'express';
import { logger } from '@tide/logger';
import { TideError } from '@tide/errors';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error | TideError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    method: req.method,
    path: req.path,
    body: req.body,
  }, 'Request error');

  // Handle TideError (our custom errors)
  if ('code' in error && 'statusCode' in error) {
    const tideError = error as TideError;
    return res.status(tideError.statusCode).json({
      error: {
        code: tideError.code,
        message: tideError.message,
        ...(tideError.metadata && { metadata: tideError.metadata }),
      },
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
