/**
 * Correlation Middleware Unit Tests
 * Tests correlation ID generation and propagation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  correlationId,
  correlationLogger,
  getCorrelationHeaders,
  createCorrelationHeaders,
} from '../correlation';

describe('Correlation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
    };

    mockRes = {
      setHeader: vi.fn(),
      on: vi.fn(),
    };

    mockNext = vi.fn() as any;

    vi.clearAllMocks();
  });

  describe('correlationId middleware', () => {
    it('should generate correlation ID if not provided', () => {
      correlationId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.correlationId).toBeTruthy();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-Correlation-ID',
        mockReq.correlationId
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing correlation ID from header', () => {
      const existingId = 'existing-correlation-id';
      mockReq.headers = {
        'x-correlation-id': existingId,
      };

      correlationId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.correlationId).toBe(existingId);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Correlation-ID', existingId);
    });

    it('should call next middleware', () => {
      correlationId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('correlationLogger middleware', () => {
    it('should create child logger with correlation ID', () => {
      mockReq.correlationId = 'test-correlation-id';

      correlationLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.log).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate correlation ID if not set', () => {
      correlationLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.correlationId).toBeTruthy();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-Correlation-ID',
        mockReq.correlationId
      );
    });

    it('should log request completion on response finish', () => {
      correlationLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });

  describe('getCorrelationHeaders', () => {
    it('should return headers with correlation ID from request', () => {
      mockReq.correlationId = 'test-id';

      const headers = getCorrelationHeaders(mockReq as Request);

      expect(headers).toEqual({
        'X-Correlation-ID': 'test-id',
      });
    });

    it('should generate new correlation ID if request has none', () => {
      const headers = getCorrelationHeaders(mockReq as Request);

      expect(headers['X-Correlation-ID']).toBeTruthy();
    });
  });

  describe('createCorrelationHeaders', () => {
    it('should use provided correlation ID', () => {
      const headers = createCorrelationHeaders('custom-id');

      expect(headers).toEqual({
        'X-Correlation-ID': 'custom-id',
      });
    });

    it('should generate new correlation ID if not provided', () => {
      const headers = createCorrelationHeaders();

      expect(headers['X-Correlation-ID']).toBeTruthy();
      expect(typeof headers['X-Correlation-ID']).toBe('string');
    });
  });
});

