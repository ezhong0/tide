import { env } from './env';

/**
 * Supabase Authentication Configuration
 *
 * Week 3 Alpha uses Supabase Auth for all authentication.
 * OAuth is configured in the Supabase Dashboard, not here.
 */
export const supabaseConfig = {
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: env.SUPABASE_JWT_SECRET,
};

/**
 * Google OAuth Configuration
 * Used for configuring OAuth in Supabase Dashboard
 */
export const googleOAuthConfig = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
  iosClientId: env.GOOGLE_IOS_CLIENT_ID,
};

/**
 * Microsoft Azure OAuth Configuration
 * Used for configuring OAuth in Supabase Dashboard
 */
export const azureOAuthConfig = {
  clientId: env.AZURE_CLIENT_ID,
  clientSecret: env.AZURE_CLIENT_SECRET,
  tenantId: env.AZURE_TENANT_ID,
};
