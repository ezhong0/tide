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
  const key = useServiceRole ? supabaseConfig.serviceRoleKey : supabaseConfig.anonKey;
  return createSupabaseClient(supabaseConfig.url, key);
}
