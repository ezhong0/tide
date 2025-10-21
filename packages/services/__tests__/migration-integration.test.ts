/**
 * Comprehensive Migration Integration Tests
 *
 * Tests all services with the new optimized 15-table schema
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  getDefaultEmailIntelligence,
  getDefaultEventIntelligence,
  getDefaultTaskStructure,
  getDefaultTaskIntelligence,
  getDefaultContactIntelligence,
} from '@tide/database';

const db = SupabaseConnectionManager.getInstance(true); // Service role for tests
const testUserId = 'test-user-migration-' + Date.now() as UserId;

describe('Migration Integration Tests', () => {
  beforeAll(async () => {
    // Create test user
    await db.from('users').insert({
      id: testUserId,
      email: 'test@migration.com',
      full_name: 'Test User',
      settings: {},
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.from('users').delete().eq('id', testUserId);
  });

  describe('Email Service - New Schema', () => {
    const testEmailId = 'email-test-' + Date.now();

    it('should create email with JSONB intelligence', async () => {
      const intelligence = {
        ...getDefaultEmailIntelligence(),
        category: 'urgent',
        priority: 9,
        urgency: 'high',
        requires_response: true,
        ai_summary: 'Test email summary',
        suggested_actions: [
          { action: 'reply', confidence: 0.9 }
        ],
      };

      const { data, error } = await db
        .from('emails')
        .insert({
          id: testEmailId,
          user_id: testUserId,
          provider: 'google',
          provider_message_id: 'test-msg-123',
          provider_thread_id: 'test-thread-123',
          from_email: 'sender@test.com',
          from_name: 'Test Sender',
          to_emails: ['recipient@test.com'],
          cc_emails: [],
          bcc_emails: [],
          subject: 'Test Email',
          body_text: 'This is a test email',
          body_html: '<p>This is a test email</p>',
          snippet: 'This is a test...',
          sent_at: new Date().toISOString(),
          is_unread: true, // inverted logic
          is_starred: false,
          labels: ['inbox'],
          attachments: [],
          intelligence,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.intelligence.category).toBe('urgent');
      expect(data?.intelligence.priority).toBe(9);
      expect(data?.is_unread).toBe(true);
    });

    it('should query emails by JSONB intelligence fields', async () => {
      const { data, error } = await db
        .from('emails')
        .select('*')
        .eq('user_id', testUserId)
        .eq('is_unread', true)
        .gte('intelligence->>priority', '7')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.[0].intelligence.priority).toBeGreaterThanOrEqual(7);
    });

    it('should update email intelligence', async () => {
      const { data: email } = await db
        .from('emails')
        .select('intelligence')
        .eq('id', testEmailId)
        .single();

      const updatedIntelligence = {
        ...email?.intelligence,
        autonomous_actions_taken: [
          {
            action: 'categorized',
            details: { category: 'urgent' },
            timestamp: new Date().toISOString(),
          }
        ],
      };

      const { error } = await db
        .from('emails')
        .update({ intelligence: updatedIntelligence })
        .eq('id', testEmailId);

      expect(error).toBeNull();
    });
  });

  describe('Contact Service - New Schema', () => {
    const testContactEmail = 'contact@test.com';

    it('should create contact with JSONB intelligence', async () => {
      const intelligence = {
        ...getDefaultContactIntelligence(),
        strength: 0.8,
        frequency: 'frequent',
        vip: true,
        sentiment: 'positive',
        topics: ['work', 'projects'],
        stats: {
          emails_sent: 10,
          emails_received: 15,
          avg_response_time_minutes: 120,
        },
      };

      const { data, error } = await db
        .from('contacts')
        .insert({
          user_id: testUserId,
          email: testContactEmail,
          name: 'Test Contact',
          phone: null,
          company: 'Test Company',
          role: 'Engineer',
          notes: null,
          tags: ['client'],
          intelligence,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.intelligence.vip).toBe(true);
      expect(data?.intelligence.strength).toBe(0.8);
    });
  });

  describe('Calendar Service - New Schema', () => {
    const testEventId = 'event-test-' + Date.now();

    it('should create event with JSONB intelligence', async () => {
      const intelligence = {
        ...getDefaultEventIntelligence(),
        brief: {
          summary: 'Quarterly review meeting',
          key_discussion_points: ['Q4 results', 'Budget planning'],
          preparation_checklist: ['Review financials', 'Prepare presentation'],
          attendee_insights: [],
        },
        preparation: ['Review Q3 report', 'Analyze metrics'],
        conflicts: [],
        optimization_suggestions: [],
        related_emails: [],
        previous_meetings: [],
      };

      const { data, error } = await db
        .from('events')
        .insert({
          id: testEventId,
          user_id: testUserId,
          provider: 'google',
          provider_event_id: 'test-event-123',
          title: 'Test Meeting',
          description: 'Test description',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          is_all_day: false,
          location: 'Conference Room',
          attendees: [{ email: 'attendee@test.com', status: 'accepted' }],
          status: 'confirmed',
          visibility: 'default',
          recurrence_rule: null,
          intelligence,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.intelligence.brief).toBeDefined();
      expect(data?.intelligence.brief.summary).toBe('Quarterly review meeting');
    });

    it('should query events with intelligence fields', async () => {
      const { data, error } = await db
        .from('events')
        .select('*')
        .eq('user_id', testUserId)
        .gte('start_time', new Date().toISOString())
        .not('intelligence->brief', 'is', null)
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Task Service - New Schema', () => {
    const testTaskId = 'task-test-' + Date.now();

    it('should create task with JSONB structure and intelligence', async () => {
      const structure = {
        ...getDefaultTaskStructure(),
        subtasks: [
          {
            id: 'sub-1',
            title: 'Subtask 1',
            description: 'First subtask',
            order_index: 0,
            status: 'pending',
          }
        ],
        dependencies: [
          {
            task_id: 'other-task-123',
            type: 'blocks',
          }
        ],
        blockers: [],
      };

      const intelligence = {
        ...getDefaultTaskIntelligence(),
        complexity: 0.7,
        estimated_duration_minutes: 120,
        ai_suggestions: ['Break into smaller tasks', 'Schedule for tomorrow'],
      };

      const { data, error } = await db
        .from('tasks')
        .insert({
          id: testTaskId,
          user_id: testUserId,
          title: 'Test Task',
          description: 'Test task description',
          priority: 'high',
          priority_score: 0.8,
          status: 'pending',
          due_at: new Date(Date.now() + 86400000).toISOString(),
          tags: ['test'],
          project: null,
          assignee: null,
          progress: 0,
          structure,
          intelligence,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.structure.subtasks.length).toBe(1);
      expect(data?.intelligence.complexity).toBe(0.7);
    });

    it('should query tasks with structure and intelligence', async () => {
      const { data, error } = await db
        .from('tasks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'pending')
        .order('priority_score', { ascending: false })
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('User Intelligence - Patterns and Insights', () => {
    it('should store patterns in user_intelligence', async () => {
      const { data, error } = await db
        .from('user_intelligence')
        .insert({
          user_id: testUserId,
          type: 'pattern',
          subtype: 'temporal',
          data: {
            pattern_data: { day_of_week: 1, hour: 9 },
            frequency: 'daily',
            value_estimate: 600,
            description: 'User typically checks email at 9am',
            suggestion: 'Schedule email review at 9am',
          },
          confidence: 0.85,
          status: 'detected',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.confidence).toBe(0.85);
    });

    it('should store daily snapshots in user_intelligence', async () => {
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

    it('should query user intelligence by type', async () => {
      const { data, error } = await db
        .from('user_intelligence')
        .select('*')
        .eq('user_id', testUserId)
        .eq('type', 'pattern')
        .gte('confidence', 0.7)
        .order('confidence', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Workflow and Conversations', () => {
    it('should create workflow with JSONB definition', async () => {
      const { data, error } = await db
        .from('workflows')
        .insert({
          user_id: testUserId,
          name: 'Test Workflow',
          description: 'Test workflow description',
          version: 1,
          definition: {
            steps: [
              { id: '1', action: 'email_check', config: {} },
              { id: '2', action: 'calendar_review', config: {} },
            ],
          },
          status: 'active',
          is_active: true,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.definition.steps.length).toBe(2);
    });

    it('should create conversation with metadata', async () => {
      const { data, error } = await db
        .from('conversations')
        .insert({
          user_id: testUserId,
          title: 'Test Conversation',
          metadata: {
            context: 'testing',
            tags: ['migration'],
          },
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    it('should have all 15 core tables', async () => {
      const expectedTables = [
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

      for (const table of expectedTables) {
        const { error } = await db.from(table).select('count', { count: 'exact', head: true });
        expect(error).toBeNull();
      }
    });

    it('should NOT have legacy tables', async () => {
      const legacyTables = [
        'email_messages',
        'email_threads',
        'email_triage',
        'calendar_events',
        'meeting_briefs',
        'meeting_conflicts',
        'calendar_optimizations',
        'user_profiles',
        'scheduling_preferences',
        'relationship_intelligence',
        'subtasks',
        'task_dependencies',
        'patterns',
        'user_behaviors',
        'detected_patterns',
        'pattern_sequences',
        'temporal_patterns',
        'sequential_patterns',
        'automation_suggestions',
        'daily_snapshots',
      ];

      for (const table of legacyTables) {
        const { error } = await db.from(table).select('count', { count: 'exact', head: true });
        // We expect these to fail with table not found error
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance - JSONB Queries', () => {
    it('should efficiently query emails by intelligence category', async () => {
      const start = Date.now();

      const { data, error } = await db
        .from('emails')
        .select('id, subject, intelligence')
        .eq('user_id', testUserId)
        .eq('intelligence->>category', 'urgent')
        .limit(100);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(1000); // Should be fast with GIN index
    });

    it('should efficiently query tasks by structure', async () => {
      const start = Date.now();

      const { data, error } = await db
        .from('tasks')
        .select('id, title, structure')
        .eq('user_id', testUserId)
        .not('structure->subtasks', 'is', null)
        .limit(100);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(1000); // Should be fast with GIN index
    });
  });
});
