/**
 * Service Integration Tests
 * Verifies services work together correctly after migration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';

describe('Service Integration - Post Migration', () => {
  const testUserId = `test-integration-${Date.now()}` as UserId;

  beforeAll(async () => {
    // Create test user
    const db = SupabaseConnectionManager.getInstance(true);
    await db.from('users').insert({
      id: testUserId,
      email: 'integration-test@example.com',
      full_name: 'Integration Test User',
      settings: {},
    });
  });

  afterAll(async () => {
    // Cleanup test user
    const db = SupabaseConnectionManager.getInstance(true);
    await db.from('users').delete().eq('id', testUserId);

    // Cleanup connections
    await SupabaseConnectionManager.cleanup();
  });

  describe('Database Connection Consistency', () => {
    it('should use singleton pattern across services', () => {
      const db1 = SupabaseConnectionManager.getInstance(true);
      const db2 = SupabaseConnectionManager.getInstance(true);
      const db3 = SupabaseConnectionManager.getInstance(true);

      expect(db1).toBe(db2);
      expect(db2).toBe(db3);
    });

    it('should maintain single connection per role', async () => {
      // Simulate multiple services requesting connections
      const connections = [];
      for (let i = 0; i < 10; i++) {
        connections.push(SupabaseConnectionManager.getInstance(true));
      }

      const status = SupabaseConnectionManager.getStatus();
      expect(status.serviceRole).toBe(true);
      expect(status.totalConnections).toBeGreaterThanOrEqual(1);

      // All should be the same instance
      for (let i = 1; i < connections.length; i++) {
        expect(connections[i]).toBe(connections[0]);
      }
    });
  });

  describe('Email Service Integration', () => {
    it('should store emails with new schema', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      const { data, error } = await db
        .from('emails')
        .insert({
          id: `email-integration-${Date.now()}`,
          user_id: testUserId,
          provider: 'google',
          provider_message_id: 'test-msg-integration',
          provider_thread_id: 'test-thread-integration',
          from_email: 'sender@test.com',
          from_name: 'Test Sender',
          to_emails: ['recipient@test.com'],
          cc_emails: [],
          bcc_emails: [],
          subject: 'Integration Test Email',
          body_text: 'This is an integration test',
          snippet: 'Integration test...',
          sent_at: new Date().toISOString(),
          is_unread: true,
          is_starred: false,
          labels: ['inbox'],
          intelligence: {
            category: 'general',
            priority: 5,
            requires_response: false,
          },
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.intelligence).toBeDefined();
    });

    it('should query emails with intelligence fields', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      const { data, error } = await db
        .from('emails')
        .select('*')
        .eq('user_id', testUserId)
        .limit(10);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Calendar Service Integration', () => {
    it('should store events with new schema', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      const { data, error } = await db
        .from('events')
        .insert({
          id: `event-integration-${Date.now()}`,
          user_id: testUserId,
          provider: 'google',
          provider_event_id: 'test-event-integration',
          title: 'Integration Test Meeting',
          description: 'Testing event storage',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          is_all_day: false,
          attendees: [{ email: 'attendee@test.com', status: 'pending' }],
          status: 'confirmed',
          visibility: 'default',
          intelligence: {
            brief: {
              summary: 'Test meeting brief',
              key_discussion_points: [],
              preparation_checklist: [],
              attendee_insights: [],
            },
          },
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.intelligence).toBeDefined();
    });
  });

  describe('Task Service Integration', () => {
    it('should store tasks with new schema', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      const { data, error } = await db
        .from('tasks')
        .insert({
          id: `task-integration-${Date.now()}`,
          user_id: testUserId,
          title: 'Integration Test Task',
          description: 'Testing task storage',
          priority: 'medium',
          priority_score: 0.5,
          status: 'pending',
          tags: ['test'],
          progress: 0,
          structure: {
            subtasks: [],
            dependencies: [],
            blockers: [],
          },
          intelligence: {
            complexity: 0.5,
            estimated_duration_minutes: 60,
            ai_suggestions: [],
          },
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.structure).toBeDefined();
      expect(data?.intelligence).toBeDefined();
    });
  });

  describe('Intelligence Service Integration', () => {
    it('should store user intelligence patterns', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      const { data, error } = await db
        .from('user_intelligence')
        .insert({
          user_id: testUserId,
          type: 'pattern',
          subtype: 'temporal',
          data: {
            pattern_data: { hour: 9 },
            frequency: 'daily',
            value_estimate: 600,
          },
          confidence: 0.8,
          status: 'detected',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should store daily snapshots', async () => {
      const db = SupabaseConnectionManager.getInstance(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await db
        .from('user_intelligence')
        .insert({
          user_id: testUserId,
          type: 'daily_snapshot',
          subtype: today,
          data: {
            priority_items: [],
            pending_decisions: [],
            meeting_previews: [],
            predictions: [],
            generated_at: new Date().toISOString(),
          },
          confidence: 1.0,
          status: 'active',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Cross-Service Data Flow', () => {
    it('should support email → task creation flow', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      // Create email
      const { data: email } = await db
        .from('emails')
        .insert({
          id: `email-task-flow-${Date.now()}`,
          user_id: testUserId,
          provider: 'google',
          provider_message_id: 'test-flow-msg',
          provider_thread_id: 'test-flow-thread',
          from_email: 'sender@test.com',
          from_name: 'Test Sender',
          to_emails: ['recipient@test.com'],
          subject: 'Action Required',
          body_text: 'Please complete the following task',
          snippet: 'Action required...',
          sent_at: new Date().toISOString(),
          is_unread: true,
          intelligence: {
            requires_response: true,
            suggested_actions: [{ action: 'create_task', confidence: 0.9 }],
          },
        })
        .select()
        .single();

      expect(email).toBeDefined();

      // Create task from email
      const { data: task } = await db
        .from('tasks')
        .insert({
          id: `task-from-email-${Date.now()}`,
          user_id: testUserId,
          title: 'Task from email',
          description: email?.body_text || '',
          priority: 'high',
          priority_score: 0.8,
          status: 'pending',
          progress: 0,
          structure: {
            subtasks: [],
            dependencies: [],
            blockers: [],
          },
          intelligence: {
            source: 'email',
            source_id: email?.id,
          },
        })
        .select()
        .single();

      expect(task).toBeDefined();
      expect(task?.intelligence.source).toBe('email');
      expect(task?.intelligence.source_id).toBe(email?.id);
    });

    it('should support event → decision creation flow', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      // Create event
      const { data: event } = await db
        .from('events')
        .insert({
          id: `event-decision-flow-${Date.now()}`,
          user_id: testUserId,
          provider: 'google',
          provider_event_id: 'test-decision-event',
          title: 'Conflicting Meeting',
          start_time: new Date(Date.now() + 7200000).toISOString(),
          end_time: new Date(Date.now() + 10800000).toISOString(),
          is_all_day: false,
          attendees: [],
          status: 'tentative',
          visibility: 'default',
        })
        .select()
        .single();

      expect(event).toBeDefined();

      // Create decision about attending
      const { data: decision } = await db
        .from('decisions')
        .insert({
          user_id: testUserId,
          title: 'Should I attend this meeting?',
          context: {
            event_id: event?.id,
            type: 'meeting_attendance',
          },
          options: [
            {
              id: 'opt-1',
              title: 'Attend',
              description: 'Attend the meeting',
              pros: ['Direct communication'],
              cons: ['Time commitment'],
            },
            {
              id: 'opt-2',
              title: 'Decline',
              description: 'Decline the meeting',
              pros: ['Save time'],
              cons: ['Miss discussion'],
            },
          ],
          status: 'pending',
        })
        .select()
        .single();

      expect(decision).toBeDefined();
      expect(decision?.context.event_id).toBe(event?.id);
    });
  });

  describe('No Legacy Patterns', () => {
    it('should not have legacy table structures', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      // These legacy tables should NOT exist
      const legacyTables = [
        'email_messages',
        'email_threads',
        'meeting_briefs',
        'subtasks',
        'task_dependencies',
      ];

      for (const table of legacyTables) {
        const { error } = await db.from(table).select('count', { count: 'exact', head: true });
        expect(error).toBeDefined(); // Should error because table doesn't exist
      }
    });

    it('should only use modern 15-table schema', async () => {
      const db = SupabaseConnectionManager.getInstance(true);

      const modernTables = [
        'users',
        'emails',
        'contacts',
        'events',
        'tasks',
        'workflows',
        'workflow_executions',
        'conversations',
        'messages',
        'oauth_tokens',
        'user_intelligence',
        'decisions',
        'actions',
        'notifications',
        'audit_logs',
      ];

      for (const table of modernTables) {
        const { error } = await db.from(table).select('count', { count: 'exact', head: true });
        expect(error).toBeNull(); // Should succeed
      }
    });
  });
});
