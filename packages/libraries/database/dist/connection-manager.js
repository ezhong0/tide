"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseConnectionManager = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@tide/config");
const logger_1 = require("@tide/logger");
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
class SupabaseConnectionManager {
    /**
     * Get Supabase client instance (singleton per role type)
     * @param useServiceRole - true for service role key, false for anon key
     * @returns Supabase client instance
     */
    static getInstance(useServiceRole = true) {
        if (useServiceRole) {
            if (!this.serviceRoleInstance) {
                this.serviceRoleInstance = this.createClient(true);
                this.startHealthCheck();
            }
            return this.serviceRoleInstance;
        }
        else {
            if (!this.anonInstance) {
                this.anonInstance = this.createClient(false);
                this.startHealthCheck();
            }
            return this.anonInstance;
        }
    }
    /**
     * Create a new client (internal)
     */
    static createClient(useServiceRole) {
        if (!config_1.supabaseConfig.url) {
            throw new Error('SUPABASE_URL is required');
        }
        const key = useServiceRole ? config_1.supabaseConfig.serviceRoleKey : config_1.supabaseConfig.anonKey;
        if (!key) {
            throw new Error(`SUPABASE_${useServiceRole ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'} is required`);
        }
        logger_1.logger.info({ role: useServiceRole ? 'service-role' : 'anon' }, 'Creating Supabase client instance');
        return (0, supabase_js_1.createClient)(config_1.supabaseConfig.url, key);
    }
    /**
     * Start periodic health checks
     */
    static startHealthCheck() {
        if (this.healthCheckInterval) {
            return; // Already running
        }
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 30000); // Every 30 seconds
        // Perform initial health check
        this.performHealthCheck().catch(err => {
            logger_1.logger.warn({ error: err }, 'Initial health check failed');
        });
    }
    /**
     * Perform health check on all active connections
     */
    static async performHealthCheck() {
        const checks = [];
        if (this.serviceRoleInstance) {
            checks.push(this.checkConnection(this.serviceRoleInstance, 'service-role'));
        }
        if (this.anonInstance) {
            checks.push(this.checkConnection(this.anonInstance, 'anon'));
        }
        if (checks.length > 0) {
            await Promise.allSettled(checks);
        }
    }
    /**
     * Check a single connection
     */
    static async checkConnection(client, role) {
        try {
            // Simple query to verify connection
            const { error } = await client
                .from('users')
                .select('count', { count: 'exact', head: true });
            if (error) {
                logger_1.logger.warn({ error: error.message, role }, 'Supabase health check failed');
            }
            else {
                this.lastHealthCheck[role === 'service-role' ? 'serviceRole' : 'anon'] = new Date();
                logger_1.logger.debug({ role }, 'Supabase health check passed');
            }
        }
        catch (error) {
            logger_1.logger.error({ error, role }, 'Supabase health check error');
        }
    }
    /**
     * Cleanup (call during graceful shutdown)
     */
    static async cleanup() {
        logger_1.logger.info('Cleaning up Supabase connection manager');
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        // Supabase client doesn't require explicit cleanup
        // But we can null out references to allow garbage collection
        this.serviceRoleInstance = null;
        this.anonInstance = null;
        this.lastHealthCheck = {};
        logger_1.logger.info('Supabase connection manager cleaned up successfully');
    }
    /**
     * Get connection status for health checks
     */
    static getStatus() {
        return {
            serviceRole: this.serviceRoleInstance !== null,
            anon: this.anonInstance !== null,
            lastHealthCheck: {
                serviceRole: this.lastHealthCheck.serviceRole?.toISOString(),
                anon: this.lastHealthCheck.anon?.toISOString(),
            },
        };
    }
    /**
     * Force a health check (useful for testing)
     */
    static async forceHealthCheck() {
        await this.performHealthCheck();
    }
}
exports.SupabaseConnectionManager = SupabaseConnectionManager;
SupabaseConnectionManager.serviceRoleInstance = null;
SupabaseConnectionManager.anonInstance = null;
SupabaseConnectionManager.healthCheckInterval = null;
SupabaseConnectionManager.lastHealthCheck = {};
//# sourceMappingURL=connection-manager.js.map