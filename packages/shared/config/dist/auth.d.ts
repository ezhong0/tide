export interface JWTConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
}
/**
 * JWT token configuration
 */
export declare const jwtConfig: JWTConfig;
/**
 * Password hashing configuration
 */
export declare const passwordConfig: {
    bcryptRounds: number;
};
/**
 * Bcrypt configuration (alias for passwordConfig for compatibility)
 */
export declare const bcryptConfig: {
    saltRounds: number;
};
export interface OAuthProviderConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}
/**
 * Gmail OAuth configuration
 */
export declare const gmailOAuthConfig: OAuthProviderConfig | null;
/**
 * Microsoft Exchange OAuth configuration
 */
export declare const exchangeOAuthConfig: OAuthProviderConfig & {
    tenantId: string;
} | null;
/**
 * Google Calendar OAuth configuration
 */
export declare const googleCalendarOAuthConfig: OAuthProviderConfig | null;
