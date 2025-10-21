import { type SupabaseClient } from '@supabase/supabase-js';
/**
 * Supabase Connection Manager
 * Provides singleton instance management with health checking
 *
 * Benefits:
 * - Single connection pool per instance
 * - Automatic health checking
 * - Proper cleanup during shutdown
 * - Connection status monitoring
 */
declare class SupabaseConnectionManager {
    private static serviceRoleInstance;
    private static anonInstance;
    private static healthCheckInterval;
    private static lastHealthCheck;
    /**
     * Get Supabase client instance (singleton per role type)
     * @param useServiceRole - true for service role key, false for anon key
     * @returns Supabase client instance
     */
    static getInstance(useServiceRole?: boolean): SupabaseClient;
    /**
     * Create a new client (internal)
     */
    private static createClient;
    /**
     * Start periodic health checks
     */
    private static startHealthCheck;
    /**
     * Perform health check on all active connections
     */
    private static performHealthCheck;
    /**
     * Check a single connection
     */
    private static checkConnection;
    /**
     * Cleanup (call during graceful shutdown)
     */
    static cleanup(): Promise<void>;
    /**
     * Get connection status for health checks
     */
    static getStatus(): {
        serviceRole: boolean;
        anon: boolean;
        lastHealthCheck: {
            serviceRole?: string;
            anon?: string;
        };
    };
    /**
     * Force a health check (useful for testing)
     */
    static forceHealthCheck(): Promise<void>;
}
export { SupabaseConnectionManager };
//# sourceMappingURL=connection-manager.d.ts.map