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
export declare function verifyAccessToken(token: string): AuthContext;
/**
 * Optional authentication - verifies token if present, but doesn't require it
 *
 * @param token - Optional JWT access token
 * @returns AuthContext (isAuthenticated = false if no token)
 */
export declare function optionalAuth(token?: string): AuthContext;
/**
 * Extract token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns Token string or undefined
 */
export declare function extractToken(authHeader?: string): string | undefined;
/**
 * Create authentication context from request headers
 *
 * @param authHeader - Authorization header value
 * @param required - Whether authentication is required (default: true)
 * @returns AuthContext
 * @throws AuthError if required and token is missing/invalid
 */
export declare function createAuthContext(authHeader?: string, required?: boolean): AuthContext;
//# sourceMappingURL=auth.d.ts.map