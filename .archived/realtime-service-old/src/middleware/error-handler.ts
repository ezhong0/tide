import { Request, Response, NextFunction } from 'express';
import { logger } from '@tide/logger';
import { TideError } from '@tide/errors';

export function errorHandler(
  error: Error | TideError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  }, 'Request error');

  // Handle TideError
  if (error instanceof TideError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Handle generic errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
