import type { UserId } from '@tide/types';
export interface AuthContext {
    userId: UserId;
    email: string;
    isAuthenticated: boolean;
}
/**
 * Verify Supabase JWT token and extract user information
 *
 * @param token - JWT access token from Authorization header
 * @returns AuthContext with user information
 * @throws AuthError if token is invalid or expired
 */
export declare function verifyAccessToken(token: string): Promise<AuthContext>;
/**
 * Optional authentication - verifies token if present, but doesn't require it
 *
 * @param token - Optional JWT access token
 * @returns AuthContext (isAuthenticated = false if no token)
 */
export declare function optionalAuth(token?: string): Promise<AuthContext>;
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
export declare function createAuthContext(authHeader?: string, required?: boolean): Promise<AuthContext>;
//# sourceMappingURL=auth.d.ts.map