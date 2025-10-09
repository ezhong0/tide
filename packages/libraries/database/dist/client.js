"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabase = createSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@tide/config");
/**
 * Database Client
 *
 * Week 3 Alpha: Supabase-first architecture (ADR-001)
 * All services use Supabase client for database access.
 */
/**
 * Create a Supabase client (recommended approach)
 */
function createSupabase(useServiceRole = true) {
    // Validate required config
    if (!config_1.supabaseConfig.url) {
        throw new Error('SUPABASE_URL is required for database client');
    }
    const key = useServiceRole ? config_1.supabaseConfig.serviceRoleKey : config_1.supabaseConfig.anonKey;
    if (!key) {
        throw new Error(`SUPABASE_${useServiceRole ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'} is required for database client`);
    }
    return (0, supabase_js_1.createClient)(config_1.supabaseConfig.url, key);
}
//# sourceMappingURL=client.js.map