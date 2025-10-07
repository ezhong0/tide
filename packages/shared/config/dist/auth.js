"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeOAuthConfig = exports.googleCalendarOAuthConfig = exports.gmailOAuthConfig = exports.googleOAuthConfig = exports.bcryptConfig = exports.passwordConfig = exports.jwtConfig = void 0;
const env_1 = require("./env");
/**
 * JWT token configuration
 */
exports.jwtConfig = {
    accessSecret: env_1.env.JWT_ACCESS_SECRET,
    refreshSecret: env_1.env.JWT_REFRESH_SECRET,
    accessExpiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    // Aliases for compatibility
    accessTokenSecret: env_1.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: env_1.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: env_1.env.JWT_ACCESS_EXPIRES_IN,
    refreshTokenExpiry: env_1.env.JWT_REFRESH_EXPIRES_IN,
};
/**
 * Password hashing configuration
 */
exports.passwordConfig = {
    bcryptRounds: env_1.env.BCRYPT_ROUNDS,
};
/**
 * Bcrypt configuration (alias for passwordConfig for compatibility)
 */
exports.bcryptConfig = {
    saltRounds: env_1.env.BCRYPT_ROUNDS,
};
/**
 * Google OAuth configuration (unified for Gmail, Calendar, Drive, etc.)
 * Single OAuth client handles all Google services with different scopes
 */
exports.googleOAuthConfig = env_1.env.GOOGLE_CLIENT_ID && env_1.env.GOOGLE_CLIENT_SECRET && env_1.env.GOOGLE_REDIRECT_URI
    ? {
        clientId: env_1.env.GOOGLE_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
        redirectUri: env_1.env.GOOGLE_REDIRECT_URI,
        iosClientId: env_1.env.GOOGLE_IOS_CLIENT_ID,
    }
    : null;
/**
 * Gmail OAuth configuration (uses unified Google OAuth)
 * @deprecated Use googleOAuthConfig instead. Kept for backward compatibility.
 */
exports.gmailOAuthConfig = exports.googleOAuthConfig
    ? {
        clientId: exports.googleOAuthConfig.clientId,
        clientSecret: exports.googleOAuthConfig.clientSecret,
        redirectUri: exports.googleOAuthConfig.redirectUri,
    }
    : null;
/**
 * Google Calendar OAuth configuration (uses unified Google OAuth)
 * @deprecated Use googleOAuthConfig instead. Kept for backward compatibility.
 */
exports.googleCalendarOAuthConfig = exports.googleOAuthConfig
    ? {
        clientId: exports.googleOAuthConfig.clientId,
        clientSecret: exports.googleOAuthConfig.clientSecret,
        redirectUri: exports.googleOAuthConfig.redirectUri,
    }
    : null;
/**
 * Microsoft Exchange OAuth configuration (unified for Outlook, Calendar, OneDrive, etc.)
 */
exports.exchangeOAuthConfig = env_1.env.EXCHANGE_CLIENT_ID && env_1.env.EXCHANGE_CLIENT_SECRET && env_1.env.EXCHANGE_REDIRECT_URI && env_1.env.EXCHANGE_TENANT_ID
    ? {
        clientId: env_1.env.EXCHANGE_CLIENT_ID,
        clientSecret: env_1.env.EXCHANGE_CLIENT_SECRET,
        redirectUri: env_1.env.EXCHANGE_REDIRECT_URI,
        tenantId: env_1.env.EXCHANGE_TENANT_ID,
    }
    : null;
