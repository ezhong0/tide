import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@tide/config';
import { logger } from '@tide/logger';

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
  private static serviceRoleInstance: SupabaseClient | null = null;
  private static anonInstance: SupabaseClient | null = null;
  private static healthCheckInterval: NodeJS.Timeout | null = null;
  private static lastHealthCheck: { serviceRole?: Date; anon?: Date } = {};

  /**
   * Get Supabase client instance (singleton per role type)
   * @param useServiceRole - true for service role key, false for anon key
   * @returns Supabase client instance
   */
  static getInstance(useServiceRole = true): SupabaseClient {
    if (useServiceRole) {
      if (!this.serviceRoleInstance) {
        this.serviceRoleInstance = this.createClient(true);
        this.startHealthCheck();
      }
      return this.serviceRoleInstance;
    } else {
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
  private static createClient(useServiceRole: boolean): SupabaseClient {
    if (!supabaseConfig.url) {
      throw new Error('SUPABASE_URL is required');
    }

    const key = useServiceRole ? supabaseConfig.serviceRoleKey : supabaseConfig.anonKey;
    if (!key) {
      throw new Error(
        `SUPABASE_${useServiceRole ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'} is required`
      );
    }

    logger.info(
      { role: useServiceRole ? 'service-role' : 'anon' },
      'Creating Supabase client instance'
    );

    return createClient(supabaseConfig.url, key);
  }

  /**
   * Start periodic health checks
   */
  private static startHealthCheck(): void {
    if (this.healthCheckInterval) {
      return; // Already running
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Every 30 seconds

    // Perform initial health check
    this.performHealthCheck().catch(err => {
      logger.warn({ error: err }, 'Initial health check failed');
    });
  }

  /**
   * Perform health check on all active connections
   */
  private static async performHealthCheck(): Promise<void> {
    const checks: Promise<void>[] = [];

    if (this.serviceRoleInstance) {
      checks.push(
        this.checkConnection(this.serviceRoleInstance, 'service-role')
      );
    }

    if (this.anonInstance) {
      checks.push(
        this.checkConnection(this.anonInstance, 'anon')
      );
    }

    if (checks.length > 0) {
      await Promise.allSettled(checks);
    }
  }

  /**
   * Check a single connection
   */
  private static async checkConnection(
    client: SupabaseClient,
    role: 'service-role' | 'anon'
  ): Promise<void> {
    try {
      // Simple query to verify connection
      const { error } = await client
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        logger.warn({ error: error.message, role }, 'Supabase health check failed');
      } else {
        this.lastHealthCheck[role === 'service-role' ? 'serviceRole' : 'anon'] = new Date();
        logger.debug({ role }, 'Supabase health check passed');
      }
    } catch (error) {
      logger.error({ error, role }, 'Supabase health check error');
    }
  }

  /**
   * Cleanup (call during graceful shutdown)
   */
  static async cleanup(): Promise<void> {
    logger.info('Cleaning up Supabase connection manager');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Supabase client doesn't require explicit cleanup
    // But we can null out references to allow garbage collection
    this.serviceRoleInstance = null;
    this.anonInstance = null;
    this.lastHealthCheck = {};

    logger.info('Supabase connection manager cleaned up successfully');
  }

  /**
   * Get connection status for health checks
   */
  static getStatus(): {
    serviceRole: boolean;
    anon: boolean;
    lastHealthCheck: { serviceRole?: string; anon?: string };
  } {
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
  static async forceHealthCheck(): Promise<void> {
    await this.performHealthCheck();
  }
}

export { SupabaseConnectionManager };
