import { env } from './env';

export interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
  // Aliases for compatibility
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

/**
 * JWT token configuration
 */
export const jwtConfig: JWTConfig = {
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  // Aliases for compatibility
  accessTokenSecret: env.JWT_ACCESS_SECRET,
  refreshTokenSecret: env.JWT_REFRESH_SECRET,
  accessTokenExpiry: env.JWT_ACCESS_EXPIRES_IN,
  refreshTokenExpiry: env.JWT_REFRESH_EXPIRES_IN,
};

/**
 * Password hashing configuration
 */
export const passwordConfig = {
  bcryptRounds: env.BCRYPT_ROUNDS,
};

/**
 * Bcrypt configuration (alias for passwordConfig for compatibility)
 */
export const bcryptConfig = {
  saltRounds: env.BCRYPT_ROUNDS,
};

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Gmail OAuth configuration
 */
export const gmailOAuthConfig: OAuthProviderConfig | null = env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REDIRECT_URI
  ? {
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      redirectUri: env.GMAIL_REDIRECT_URI,
    }
  : null;

/**
 * Microsoft Exchange OAuth configuration
 */
export const exchangeOAuthConfig: OAuthProviderConfig & { tenantId: string } | null =
  env.EXCHANGE_CLIENT_ID && env.EXCHANGE_CLIENT_SECRET && env.EXCHANGE_REDIRECT_URI && env.EXCHANGE_TENANT_ID
    ? {
        clientId: env.EXCHANGE_CLIENT_ID,
        clientSecret: env.EXCHANGE_CLIENT_SECRET,
        redirectUri: env.EXCHANGE_REDIRECT_URI,
        tenantId: env.EXCHANGE_TENANT_ID,
      }
    : null;

/**
 * Google Calendar OAuth configuration
 */
export const googleCalendarOAuthConfig: OAuthProviderConfig | null =
  env.GOOGLE_CALENDAR_CLIENT_ID && env.GOOGLE_CALENDAR_CLIENT_SECRET && env.GOOGLE_CALENDAR_REDIRECT_URI
    ? {
        clientId: env.GOOGLE_CALENDAR_CLIENT_ID,
        clientSecret: env.GOOGLE_CALENDAR_CLIENT_SECRET,
        redirectUri: env.GOOGLE_CALENDAR_REDIRECT_URI,
      }
    : null;
