import jwt from 'jsonwebtoken';
import { jwtConfig } from '@tide/config';
import { AuthErrors } from '@tide/errors';
import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';

export interface JWTPayload {
  userId: UserId;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  userId: UserId;
  email: string;
  isAuthenticated: boolean;
}

/**
 * Verify JWT access token and extract user information
 *
 * @param token - JWT access token from Authorization header
 * @returns AuthContext with user information
 * @throws AuthError if token is invalid or expired
 */
export function verifyAccessToken(token: string): AuthContext {
  if (!token) {
    throw AuthErrors.invalidToken();
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret) as JWTPayload;

    // Ensure it's an access token (not refresh token)
    if (decoded.type !== 'access') {
      logger.warn({ tokenType: decoded.type }, 'Invalid token type used for access');
      throw AuthErrors.invalidToken();
    }

    // Return user context
    return {
      userId: decoded.userId,
      email: decoded.email,
      isAuthenticated: true,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Access token expired');
      throw AuthErrors.tokenExpired();
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn({ error: error.message }, 'Invalid JWT token');
      throw AuthErrors.invalidToken();
    }

    // Re-throw if it's already an AuthError
    if (error instanceof Error) {
      throw error;
    }

    // Unknown error
    throw new Error('Failed to verify token');
  }
}

/**
 * Optional authentication - verifies token if present, but doesn't require it
 *
 * @param token - Optional JWT access token
 * @returns AuthContext (isAuthenticated = false if no token)
 */
export function optionalAuth(token?: string): AuthContext {
  if (!token) {
    return {
      userId: '' as UserId,
      email: '',
      isAuthenticated: false,
    };
  }

  try {
    return verifyAccessToken(token);
  } catch (error) {
    // Log but don't throw for optional auth
    logger.debug({ error }, 'Optional auth failed');
    return {
      userId: '' as UserId,
      email: '',
      isAuthenticated: false,
    };
  }
}

/**
 * Extract token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns Token string or undefined
 */
export function extractToken(authHeader?: string): string | undefined {
  if (!authHeader) {
    return undefined;
  }

  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
}

/**
 * Create authentication context from request headers
 *
 * @param authHeader - Authorization header value
 * @param required - Whether authentication is required (default: true)
 * @returns AuthContext
 * @throws AuthError if required and token is missing/invalid
 */
export function createAuthContext(
  authHeader?: string,
  required: boolean = true
): AuthContext {
  const token = extractToken(authHeader);

  if (required) {
    if (!token) {
      throw AuthErrors.missingToken();
    }
    return verifyAccessToken(token);
  }

  return optionalAuth(token);
}
