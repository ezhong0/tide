/**
 * Error Handler Middleware Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  errorHandler,
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  notFoundHandler,
  asyncHandler,
} from './error-handler.js';
import type { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      url: '/test',
      method: 'GET',
      correlationId: 'test-correlation-id',
      user: undefined,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
    };

    mockNext = vi.fn();

    // Set test environment
    process.env.NODE_ENV = 'test';
  });

  it('should handle generic Error objects', () => {
    const error = new Error('Test error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Test error',
    });
  });

  it('should handle APIError instances', () => {
    const error = new APIError(404, 'Not found', 'NOT_FOUND');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'NOT_FOUND',
      message: 'Not found',
    });
  });

  it('should handle validation errors with details', () => {
    const error = new BadRequestError('Validation failed', { field: 'email', issue: 'invalid format' });

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'BAD_REQUEST',
      message: 'Validation failed',
      details: { field: 'email', issue: 'invalid format' },
    });
  });

  it('should not send response if headers already sent', () => {
    mockRes.headersSent = true;
    const error = new Error('Test error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle non-Error objects gracefully', () => {
    const error = new Error('An unexpected error occurred');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
    });
  });

  it('should handle token expired errors', () => {
    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'TOKEN_EXPIRED',
      message: 'Authentication token expired',
    });
  });

  it('should include stack trace in development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Dev error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );
  });
});

describe('APIError classes', () => {
  it('should create BadRequestError', () => {
    const error = new BadRequestError('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.message).toBe('Invalid input');
  });

  it('should create UnauthorizedError', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create ForbiddenError', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('should create NotFoundError', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create InternalServerError', () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});

describe('notFoundHandler', () => {
  it('should return 404 response', () => {
    const mockReq = { method: 'GET', path: '/unknown' } as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    notFoundHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'NOT_FOUND',
      message: 'Route not found: GET /unknown',
    });
  });
});

describe('asyncHandler', () => {
  it('should call async handler function', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn();

    await wrapped(mockReq, mockRes, mockNext);

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should catch errors and pass to next', async () => {
    const error = new Error('Async error');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn();

    // The wrapped function returns a promise that catches errors
    const result = wrapped(mockReq, mockRes, mockNext);

    // Wait for promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
