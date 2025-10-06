/**
 * Authentication API Contracts
 *
 * Zod schemas for authentication endpoints
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const RevokeTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

// ============================================================================
// Response Schemas
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  emailProvider: z.enum(['gmail', 'outlook']),
  calendarProvider: z.enum(['google', 'outlook']),
  timezone: z.string(),
  createdAt: z.string().datetime(),
});

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer').default('Bearer'),
});

export const GetCurrentUserResponseSchema = UserSchema;

export const RefreshTokenResponseSchema = TokenPairSchema;

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const RevokeTokenResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export type RevokeTokenRequest = z.infer<typeof RevokeTokenRequestSchema>;
export type RevokeTokenResponse = z.infer<typeof RevokeTokenResponseSchema>;

export type GetCurrentUserResponse = z.infer<typeof GetCurrentUserResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// ============================================================================
// Contract Definitions
// ============================================================================

export const AuthContracts = {
  getCurrentUser: {
    method: 'GET' as const,
    path: '/auth/me',
    request: z.object({}),
    response: GetCurrentUserResponseSchema,
  },
  logout: {
    method: 'POST' as const,
    path: '/auth/logout',
    request: z.object({}),
    response: LogoutResponseSchema,
  },
  refreshToken: {
    method: 'POST' as const,
    path: '/auth/refresh',
    request: RefreshTokenRequestSchema,
    response: RefreshTokenResponseSchema,
  },
  revokeToken: {
    method: 'POST' as const,
    path: '/auth/revoke',
    request: RevokeTokenRequestSchema,
    response: RevokeTokenResponseSchema,
  },
} as const;
