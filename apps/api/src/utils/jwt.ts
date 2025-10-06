import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';

const JWTPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return JWTPayloadSchema.parse(decoded);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) return null;
    return JWTPayloadSchema.parse(decoded);
  } catch {
    return null;
  }
}
