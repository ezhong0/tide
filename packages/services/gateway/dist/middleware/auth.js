"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = verifyAccessToken;
exports.optionalAuth = optionalAuth;
exports.extractToken = extractToken;
exports.createAuthContext = createAuthContext;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("@tide/config");
const errors_1 = require("@tide/errors");
const logger_1 = require("@tide/logger");
/**
 * Verify JWT access token and extract user information
 *
 * @param token - JWT access token from Authorization header
 * @returns AuthContext with user information
 * @throws AuthError if token is invalid or expired
 */
function verifyAccessToken(token) {
    if (!token) {
        throw errors_1.AuthErrors.invalidToken();
    }
    try {
        // Verify token signature and expiration
        const decoded = jsonwebtoken_1.default.verify(token, config_1.jwtConfig.accessTokenSecret);
        // Ensure it's an access token (not refresh token)
        if (decoded.type !== 'access') {
            logger_1.logger.warn({ tokenType: decoded.type }, 'Invalid token type used for access');
            throw errors_1.AuthErrors.invalidToken();
        }
        // Return user context
        return {
            userId: decoded.userId,
            email: decoded.email,
            isAuthenticated: true,
        };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            logger_1.logger.debug('Access token expired');
            throw errors_1.AuthErrors.tokenExpired();
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.logger.warn({ error: error.message }, 'Invalid JWT token');
            throw errors_1.AuthErrors.invalidToken();
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
function optionalAuth(token) {
    if (!token) {
        return {
            userId: '',
            email: '',
            isAuthenticated: false,
        };
    }
    try {
        return verifyAccessToken(token);
    }
    catch (error) {
        // Log but don't throw for optional auth
        logger_1.logger.debug({ error }, 'Optional auth failed');
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
function extractToken(authHeader) {
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
function createAuthContext(authHeader, required = true) {
    const token = extractToken(authHeader);
    if (required) {
        if (!token) {
            throw errors_1.AuthErrors.missingToken();
        }
        return verifyAccessToken(token);
    }
    return optionalAuth(token);
}
//# sourceMappingURL=auth.js.map