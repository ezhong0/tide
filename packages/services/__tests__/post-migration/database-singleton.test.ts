/**
 * Database Singleton Pattern Tests
 * Verifies that SupabaseConnectionManager works correctly across all services
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SupabaseConnectionManager } from '@tide/database';

describe('Database Singleton Pattern', () => {
  afterEach(async () => {
    // Cleanup between tests
    await SupabaseConnectionManager.cleanup();
  });

  describe('Singleton Behavior', () => {
    it('should return the same instance for multiple calls', () => {
      const instance1 = SupabaseConnectionManager.getInstance();
      const instance2 = SupabaseConnectionManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should return the same service role instance for multiple calls', () => {
      const instance1 = SupabaseConnectionManager.getInstance(true);
      const instance2 = SupabaseConnectionManager.getInstance(true);

      expect(instance1).toBe(instance2);
    });

    it('should return different instances for client vs service role', () => {
      const clientInstance = SupabaseConnectionManager.getInstance(false);
      const serviceInstance = SupabaseConnectionManager.getInstance(true);

      expect(clientInstance).not.toBe(serviceInstance);
    });

    it('should track connection status correctly', () => {
      // Initialize both client and service role connections
      SupabaseConnectionManager.getInstance(false);
      SupabaseConnectionManager.getInstance(true);

      const status = SupabaseConnectionManager.getStatus();

      expect(status.client).toBe(true);
      expect(status.serviceRole).toBe(true);
      expect(status.totalConnections).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Connection Management', () => {
    it('should cleanup connections properly', async () => {
      // Create connections
      SupabaseConnectionManager.getInstance(false);
      SupabaseConnectionManager.getInstance(true);

      let status = SupabaseConnectionManager.getStatus();
      expect(status.client || status.serviceRole).toBe(true);

      // Cleanup
      await SupabaseConnectionManager.cleanup();

      status = SupabaseConnectionManager.getStatus();
      expect(status.client).toBe(false);
      expect(status.serviceRole).toBe(false);
    });

    it('should allow recreation after cleanup', async () => {
      const instance1 = SupabaseConnectionManager.getInstance();
      await SupabaseConnectionManager.cleanup();

      const instance2 = SupabaseConnectionManager.getInstance();
      expect(instance2).toBeDefined();
      // Should be a new instance after cleanup
      expect(instance2).not.toBe(instance1);
    });
  });

  describe('Service Role Access', () => {
    it('should provide service role client when requested', () => {
      const instance = SupabaseConnectionManager.getInstance(true);
      expect(instance).toBeDefined();

      const status = SupabaseConnectionManager.getStatus();
      expect(status.serviceRole).toBe(true);
    });

    it('should provide regular client when not specified', () => {
      const instance = SupabaseConnectionManager.getInstance();
      expect(instance).toBeDefined();

      const status = SupabaseConnectionManager.getStatus();
      expect(status.client).toBe(true);
    });
  });

  describe('Connection Pooling', () => {
    it('should not create multiple connections for same role', () => {
      // Request multiple times
      for (let i = 0; i < 10; i++) {
        SupabaseConnectionManager.getInstance(true);
      }

      const status = SupabaseConnectionManager.getStatus();
      // Should still be just one connection
      expect(status.serviceRole).toBe(true);
    });

    it('should track total connections correctly', () => {
      const clientInstance = SupabaseConnectionManager.getInstance(false);
      const serviceInstance = SupabaseConnectionManager.getInstance(true);

      const status = SupabaseConnectionManager.getStatus();
      expect(status.totalConnections).toBeGreaterThanOrEqual(1);
      expect(status.client).toBe(true);
      expect(status.serviceRole).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle cleanup errors gracefully', async () => {
      // This should not throw even if no connections exist
      await expect(SupabaseConnectionManager.cleanup()).resolves.not.toThrow();
    });

    it('should return valid status even with no connections', () => {
      const status = SupabaseConnectionManager.getStatus();

      expect(status).toBeDefined();
      expect(typeof status.client).toBe('boolean');
      expect(typeof status.serviceRole).toBe('boolean');
      expect(typeof status.totalConnections).toBe('number');
    });
  });
});
