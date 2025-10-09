import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@tide/config';

/**
 * Database Client
 *
 * Week 3 Alpha: Supabase-first architecture (ADR-001)
 * All services use Supabase client for database access.
 */

/**
 * Create a Supabase client (recommended approach)
 */
export function createSupabase(useServiceRole: boolean = true): SupabaseClient {
  // Validate required config
  if (!supabaseConfig.url) {
    throw new Error('SUPABASE_URL is required for database client');
  }

  const key = useServiceRole ? supabaseConfig.serviceRoleKey : supabaseConfig.anonKey;
  if (!key) {
    throw new Error(
      `SUPABASE_${useServiceRole ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'} is required for database client`
    );
  }

  return createSupabaseClient(supabaseConfig.url, key);
}
