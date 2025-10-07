"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureOAuthConfig = exports.googleOAuthConfig = exports.supabaseConfig = void 0;
const env_1 = require("./env");
/**
 * Supabase Authentication Configuration
 *
 * Week 3 Alpha uses Supabase Auth for all authentication.
 * OAuth is configured in the Supabase Dashboard, not here.
 */
exports.supabaseConfig = {
    url: env_1.env.SUPABASE_URL,
    anonKey: env_1.env.SUPABASE_ANON_KEY,
    serviceRoleKey: env_1.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env_1.env.SUPABASE_JWT_SECRET,
};
/**
 * Google OAuth Configuration
 * Used for configuring OAuth in Supabase Dashboard
 */
exports.googleOAuthConfig = {
    clientId: env_1.env.GOOGLE_CLIENT_ID,
    clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
    redirectUri: env_1.env.GOOGLE_REDIRECT_URI,
    iosClientId: env_1.env.GOOGLE_IOS_CLIENT_ID,
};
/**
 * Microsoft Azure OAuth Configuration
 * Used for configuring OAuth in Supabase Dashboard
 */
exports.azureOAuthConfig = {
    clientId: env_1.env.AZURE_CLIENT_ID,
    clientSecret: env_1.env.AZURE_CLIENT_SECRET,
    tenantId: env_1.env.AZURE_TENANT_ID,
};
