export interface JWTConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
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
