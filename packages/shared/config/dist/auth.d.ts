/**
 * Supabase Authentication Configuration
 *
 * Week 3 Alpha uses Supabase Auth for all authentication.
 * OAuth is configured in the Supabase Dashboard, not here.
 */
export declare const supabaseConfig: {
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
    jwtSecret: string | undefined;
};
/**
 * Google OAuth Configuration
 * Used for configuring OAuth in Supabase Dashboard
 */
export declare const googleOAuthConfig: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    redirectUri: string | undefined;
    iosClientId: string | undefined;
};
/**
 * Microsoft Azure OAuth Configuration
 * Used for configuring OAuth in Supabase Dashboard
 */
export declare const azureOAuthConfig: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    tenantId: string | undefined;
};
