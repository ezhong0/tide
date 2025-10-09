import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@tide/config';
import { AuthErrors } from '@tide/errors';
import { logger } from '@tide/logger';
/**
 * Supabase Authentication Middleware
 *
 * Week 3 Alpha uses Supabase Auth - no custom JWT validation needed.
 * This file verifies Supabase JWTs using the Supabase client.
 */
// Validate that Supabase config is available (required for gateway)
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error('Gateway requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
}
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
/**
 * Verify Supabase JWT token and extract user information
 *
 * @param token - JWT access token from Authorization header
 * @returns AuthContext with user information
 * @throws AuthError if token is invalid or expired
 */
export async function verifyAccessToken(token) {
    if (!token) {
        throw AuthErrors.invalidToken();
    }
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            logger.warn({ error }, 'Invalid Supabase token');
            throw AuthErrors.invalidToken();
        }
        return {
            userId: data.user.id,
            email: data.user.email || '',
            isAuthenticated: true,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            logger.warn({ error: error.message }, 'Failed to verify Supabase token');
        }
        throw AuthErrors.invalidToken();
    }
}
/**
 * Optional authentication - verifies token if present, but doesn't require it
 *
 * @param token - Optional JWT access token
 * @returns AuthContext (isAuthenticated = false if no token)
 */
export async function optionalAuth(token) {
    if (!token) {
        return {
            userId: '',
            email: '',
            isAuthenticated: false,
        };
    }
    try {
        return await verifyAccessToken(token);
    }
    catch (error) {
        logger.debug({ error }, 'Optional auth failed');
        return {
            userId: '',
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
export function extractToken(authHeader) {
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
export async function createAuthContext(authHeader, required = true) {
    const token = extractToken(authHeader);
    if (required) {
        if (!token) {
            throw AuthErrors.missingToken();
        }
        return await verifyAccessToken(token);
    }
    return await optionalAuth(token);
}
//# sourceMappingURL=auth.js.map