/**
 * Auth Middleware Unit Tests
 * Tests JWT authentication and authorization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticateJWT, initializeAuth } from '../auth';

// Mock classes for JWT errors
class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

class JsonWebTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

// Mock JWT verification
const mockVerify = vi.fn();

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: mockVerify,
    TokenExpiredError,
    JsonWebTokenError,
  },
  verify: mockVerify,
  TokenExpiredError,
  JsonWebTokenError,
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-for-security';
    
    try {
      initializeAuth();
    } catch (e) {
      // Already initialized
    }

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn() as any;

    vi.clearAllMocks();
  });

  describe('authenticateJWT', () => {
    it('should authenticate valid JWT token', () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockPayload = {
        sub: 'user-123',
        email: 'user@example.com',
      };

      mockVerify.mockReturnValueOnce(mockPayload);

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        userId: 'user-123',
        email: 'user@example.com',
        role: undefined,
      });
    });

    it('should reject request without authorization header', () => {
      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid bearer token format', () => {
      mockReq.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      mockReq.headers = {
        authorization: 'Bearer expired-token',
      };

      mockVerify.mockImplementationOnce(() => {
        throw new TokenExpiredError('Token expired');
      });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    });

    it('should reject malformed token', () => {
      mockReq.headers = {
        authorization: 'Bearer malformed.token',
      };

      mockVerify.mockImplementationOnce(() => {
        throw new JsonWebTokenError('Invalid token');
      });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should extract user ID from token sub claim', () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockPayload = {
        sub: 'user-456',
        email: 'test@example.com',
      };

      mockVerify.mockReturnValueOnce(mockPayload);

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user?.userId).toBe('user-456');
    });

    it('should handle missing sub claim', () => {
      mockReq.headers = {
        authorization: 'Bearer token-without-sub',
      };

      const mockPayload = {
        email: 'test@example.com',
        // Missing sub
      };

      mockVerify.mockReturnValueOnce(mockPayload);

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token: missing user ID',
      });
    });
  });

  describe('security', () => {
    it('should verify token signature', () => {
      mockReq.headers = {
        authorization: 'Bearer tampered-token',
      };

      mockVerify.mockImplementationOnce(() => {
        throw new JsonWebTokenError('Invalid signature');
      });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should use environment JWT secret', () => {
      mockReq.headers = {
        authorization: 'Bearer token',
      };

      mockVerify.mockReturnValueOnce({
        sub: 'user-123',
        email: 'test@example.com',
      });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockVerify).toHaveBeenCalled();
    });
  });
});

