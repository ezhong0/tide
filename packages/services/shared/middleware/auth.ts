/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@tide/logger';

/**
 * JWT Configuration
 */
let jwtSecret: string | null = null;

/**
 * Initialize and validate JWT configuration at startup
 * Call this in your service's main initialization
 */
export function initializeAuth(): void {
  jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || null;

  if (!jwtSecret) {
    logger.error('CRITICAL: JWT_SECRET or SUPABASE_JWT_SECRET must be configured');
    throw new Error('JWT_SECRET or SUPABASE_JWT_SECRET environment variable is required');
  }

  if (jwtSecret.length < 32) {
    logger.error('CRITICAL: JWT secret must be at least 32 characters');
    throw new Error('JWT secret must be at least 32 characters for security');
  }

  logger.info('JWT authentication initialized successfully');
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * JWT Authentication Middleware
 * Validates JWT token from Authorization header
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // JWT secret should be initialized at startup
    if (!jwtSecret) {
      logger.error('JWT secret not initialized - call initializeAuth() at startup');
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication configuration error'
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, jwtSecret) as {
      sub?: string;
      email?: string;
      role?: string;
    };

    // Extract user information
    if (!decoded.sub) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token: missing user ID'
      });
    }

    // Attach user to request
    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    logger.error({ error }, 'Authentication error');
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without user
      return next();
    }

    const token = authHeader.substring(7);

    if (!jwtSecret) {
      // Configuration error - continue without user
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      sub?: string;
      email?: string;
      role?: string;
    };

    if (decoded.sub) {
      req.user = {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    // Token validation failed - continue without user
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Requires specific role(s) to access endpoint
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Helper to get user ID from request
 */
export const getUserId = (req: Request): string | undefined => {
  return req.user?.userId;
};

/**
 * Helper to require user ID from request
 */
export const requireUserId = (req: Request, res: Response): string | null => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'User ID not found in token'
    });
    return null;
  }

  return userId;
};
