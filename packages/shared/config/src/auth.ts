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

export interface GoogleOAuthConfig extends OAuthProviderConfig {
  iosClientId?: string; // For iOS mobile app
}

/**
 * Google OAuth configuration (unified for Gmail, Calendar, Drive, etc.)
 * Single OAuth client handles all Google services with different scopes
 */
export const googleOAuthConfig: GoogleOAuthConfig | null = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI
  ? {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
      iosClientId: env.GOOGLE_IOS_CLIENT_ID,
    }
  : null;

/**
 * Gmail OAuth configuration (uses unified Google OAuth)
 * @deprecated Use googleOAuthConfig instead. Kept for backward compatibility.
 */
export const gmailOAuthConfig: OAuthProviderConfig | null = googleOAuthConfig
  ? {
      clientId: googleOAuthConfig.clientId,
      clientSecret: googleOAuthConfig.clientSecret,
      redirectUri: googleOAuthConfig.redirectUri,
    }
  : null;

/**
 * Google Calendar OAuth configuration (uses unified Google OAuth)
 * @deprecated Use googleOAuthConfig instead. Kept for backward compatibility.
 */
export const googleCalendarOAuthConfig: OAuthProviderConfig | null = googleOAuthConfig
  ? {
      clientId: googleOAuthConfig.clientId,
      clientSecret: googleOAuthConfig.clientSecret,
      redirectUri: googleOAuthConfig.redirectUri,
    }
  : null;

/**
 * Microsoft Exchange OAuth configuration (unified for Outlook, Calendar, OneDrive, etc.)
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
