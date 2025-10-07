"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCalendarOAuthConfig = exports.exchangeOAuthConfig = exports.gmailOAuthConfig = exports.bcryptConfig = exports.passwordConfig = exports.jwtConfig = void 0;
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
 * Gmail OAuth configuration
 */
exports.gmailOAuthConfig = env_1.env.GMAIL_CLIENT_ID && env_1.env.GMAIL_CLIENT_SECRET && env_1.env.GMAIL_REDIRECT_URI
    ? {
        clientId: env_1.env.GMAIL_CLIENT_ID,
        clientSecret: env_1.env.GMAIL_CLIENT_SECRET,
        redirectUri: env_1.env.GMAIL_REDIRECT_URI,
    }
    : null;
/**
 * Microsoft Exchange OAuth configuration
 */
exports.exchangeOAuthConfig = env_1.env.EXCHANGE_CLIENT_ID && env_1.env.EXCHANGE_CLIENT_SECRET && env_1.env.EXCHANGE_REDIRECT_URI && env_1.env.EXCHANGE_TENANT_ID
    ? {
        clientId: env_1.env.EXCHANGE_CLIENT_ID,
        clientSecret: env_1.env.EXCHANGE_CLIENT_SECRET,
        redirectUri: env_1.env.EXCHANGE_REDIRECT_URI,
        tenantId: env_1.env.EXCHANGE_TENANT_ID,
    }
    : null;
/**
 * Google Calendar OAuth configuration
 */
exports.googleCalendarOAuthConfig = env_1.env.GOOGLE_CALENDAR_CLIENT_ID && env_1.env.GOOGLE_CALENDAR_CLIENT_SECRET && env_1.env.GOOGLE_CALENDAR_REDIRECT_URI
    ? {
        clientId: env_1.env.GOOGLE_CALENDAR_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        redirectUri: env_1.env.GOOGLE_CALENDAR_REDIRECT_URI,
    }
    : null;
