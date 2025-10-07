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
export interface GoogleOAuthConfig extends OAuthProviderConfig {
    iosClientId?: string;
}
/**
 * Google OAuth configuration (unified for Gmail, Calendar, Drive, etc.)
 * Single OAuth client handles all Google services with different scopes
 */
export declare const googleOAuthConfig: GoogleOAuthConfig | null;
/**
 * Gmail OAuth configuration (uses unified Google OAuth)
 * @deprecated Use googleOAuthConfig instead. Kept for backward compatibility.
 */
export declare const gmailOAuthConfig: OAuthProviderConfig | null;
/**
 * Google Calendar OAuth configuration (uses unified Google OAuth)
 * @deprecated Use googleOAuthConfig instead. Kept for backward compatibility.
 */
export declare const googleCalendarOAuthConfig: OAuthProviderConfig | null;
/**
 * Microsoft Exchange OAuth configuration (unified for Outlook, Calendar, OneDrive, etc.)
 */
export declare const exchangeOAuthConfig: OAuthProviderConfig & {
    tenantId: string;
} | null;
