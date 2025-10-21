import { logger } from '@tide/logger';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';
import type {
  DailySnapshot,
  PriorityItem,
  PendingDecision,
  MeetingPreview,
  Prediction,
  SnapshotAggregatorOptions
} from '../types/index.js';

/**
 * Daily Snapshot Aggregator
 * Aggregates data from all services to create a daily intelligence snapshot
 */
export class DailySnapshotAggregator {
  private db = SupabaseConnectionManager.getInstance(true); // Use service role

  /**
   * Generate a daily snapshot for a user
   */
  async generateSnapshot(
    userId: UserId,
    options: SnapshotAggregatorOptions = {}
  ): Promise<DailySnapshot> {
    const {
      includeEmails = true,
      includeCalendar = true,
      includeTasks = true,
      includeWorkflows = true,
      lookAheadDays = 1
    } = options;

    logger.info({ userId }, 'Generating daily snapshot');

    const snapshotDate = new Date();
    snapshotDate.setHours(0, 0, 0, 0);

    // Gather data from all services in parallel with graceful degradation
    const results = await Promise.allSettled([
      this.gatherPriorityItems(userId, { includeEmails, includeCalendar, includeTasks }),
      this.gatherPendingDecisions(userId),
      this.gatherMeetingPreviews(userId, lookAheadDays),
      this.gatherPredictions(userId)
    ]);

    const priorityItems = results[0].status === 'fulfilled' ? results[0].value : [];
    const pendingDecisions = results[1].status === 'fulfilled' ? results[1].value : [];
    const meetingPreviews = results[2].status === 'fulfilled' ? results[2].value : [];
    const predictions = results[3].status === 'fulfilled' ? results[3].value : [];

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const sources = ['priority items', 'pending decisions', 'meeting previews', 'predictions'];
        logger.warn({ error: result.reason, source: sources[index] }, 'Failed to gather data');
      }
    });

    const snapshot: DailySnapshot = {
      id: crypto.randomUUID(),
      userId,
      snapshotDate,
      priorityItems,
      pendingDecisions,
      meetingPreviews,
      predictions,
      generatedAt: new Date()
    };

    // Store snapshot in database
    await this.saveSnapshot(snapshot);

    logger.info({ userId, itemCount: priorityItems.length }, 'Daily snapshot generated');

    return snapshot;
  }

  /**
   * Gather priority items from all sources
   */
  private async gatherPriorityItems(
    userId: UserId,
    options: { includeEmails?: boolean; includeCalendar?: boolean; includeTasks?: boolean }
  ): Promise<PriorityItem[]> {
    const items: PriorityItem[] = [];

    // Gather urgent emails
    if (options.includeEmails) {
      const { data: emails } = await this.db
        .from('emails')
        .select('*')
        .eq('user_id', userId)
        .eq('is_unread', true) // inverted logic
        .in('intelligence->>category', ['urgent', 'important'])
        .order('sent_at', { ascending: false })
        .limit(10);

      if (emails) {
        items.push(...emails.map(email => {
          const intelligence = email.intelligence || {};
          return {
            id: email.id,
            type: 'email' as const,
            title: email.subject || '(No Subject)',
            description: intelligence.ai_summary || email.body_text?.substring(0, 200) || '',
            urgency: intelligence.category === 'urgent' ? 'critical' as const : 'high' as const,
            importance: (intelligence.priority || 5) / 10,
            source: 'email',
            metadata: {
              from: email.from_email,
              receivedAt: email.sent_at
            }
          };
        }));
      }
    }

    // Gather today's meetings
    if (options.includeCalendar) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: events } = await this.db
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true });

      if (events) {
        items.push(...events.map(event => ({
          id: event.id,
          type: 'meeting' as const,
          title: event.title,
          description: event.description || `Meeting at ${new Date(event.start_time).toLocaleTimeString()}`,
          urgency: 'medium' as const,
          importance: 0.7,
          deadline: new Date(event.start_time),
          source: 'calendar',
          metadata: {
            startTime: event.start_time,
            attendees: event.attendees
          }
        })));
      }
    }

    // Gather high-priority tasks
    if (options.includeTasks) {
      const { data: tasks } = await this.db
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .in('priority', ['high', 'urgent'])
        .order('due_at', { ascending: true })
        .limit(5);

      if (tasks) {
        items.push(...tasks.map(task => ({
          id: task.id,
          type: 'task' as const,
          title: task.title,
          description: task.description || '',
          urgency: task.priority === 'urgent' ? 'critical' as const : 'high' as const,
          importance: task.priority === 'urgent' ? 0.9 : 0.7,
          deadline: task.due_at ? new Date(task.due_at) : undefined,
          source: 'tasks',
          metadata: {
            priority: task.priority
          }
        })));
      }
    }

    // Sort by urgency and importance
    return items
      .sort((a, b) => {
        const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aScore = urgencyWeight[a.urgency] + a.importance;
        const bScore = urgencyWeight[b.urgency] + b.importance;
        return bScore - aScore;
      })
      .slice(0, 10); // Top 10 priority items
  }

  /**
   * Gather pending decisions
   */
  private async gatherPendingDecisions(userId: UserId): Promise<PendingDecision[]> {
    // For now, return empty array - we'll implement decision tracking in Phase 1 Week 3
    return [];
  }

  /**
   * Gather meeting previews
   */
  private async gatherMeetingPreviews(
    userId: UserId,
    lookAheadDays: number
  ): Promise<MeetingPreview[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + lookAheadDays);

    const { data: events } = await this.db
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', today.toISOString())
      .lt('start_time', endDate.toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    if (!events) return [];

    return events.map(event => ({
      id: crypto.randomUUID(),
      eventId: event.id,
      title: event.title,
      startTime: new Date(event.start_time),
      endTime: new Date(event.end_time),
      attendees: event.attendees || [],
      briefGenerated: !!event.intelligence?.brief,
      briefSummary: event.intelligence?.brief?.summary,
      preparation: event.intelligence?.preparation
    }));
  }

  /**
   * Gather predictions based on user patterns
   */
  private async gatherPredictions(userId: UserId): Promise<Prediction[]> {
    // Fetch detected patterns from user_intelligence table
    const { data: patterns } = await this.db
      .from('user_intelligence')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'pattern')
      .eq('status', 'detected')
      .gte('confidence', 0.7)
      .order('confidence', { ascending: false })
      .limit(5);

    if (!patterns) return [];

    return patterns.map(pattern => {
      const patternData = pattern.data || {};
      return {
        id: pattern.id,
        action: patternData.suggestion || patternData.description || pattern.subtype,
        description: patternData.description || pattern.subtype || 'Pattern detected',
        reasoning: `Based on your ${pattern.subtype} pattern, you typically ${patternData.description || 'perform this action'}`,
        confidence: pattern.confidence,
        estimatedTimeSaved: Math.round((patternData.value_estimate || 600) / 60) || 10, // Convert to minutes
        canExecuteAutonomously: pattern.confidence > 0.85,
        basedOnPattern: {
          type: pattern.subtype || 'unknown',
          frequency: patternData.frequency || 'occasional',
          observationPeriod: 30
        }
      };
    });
  }

  /**
   * Save snapshot to database
   * Stored in user_intelligence table with type 'daily_snapshot'
   */
  private async saveSnapshot(snapshot: DailySnapshot): Promise<void> {
    const snapshotDate = snapshot.snapshotDate.toISOString().split('T')[0];

    const { error } = await this.db
      .from('user_intelligence')
      .upsert({
        id: snapshot.id,
        user_id: snapshot.userId,
        type: 'daily_snapshot',
        subtype: snapshotDate,
        data: {
          priority_items: snapshot.priorityItems,
          pending_decisions: snapshot.pendingDecisions,
          meeting_previews: snapshot.meetingPreviews,
          predictions: snapshot.predictions,
          generated_at: snapshot.generatedAt.toISOString()
        },
        confidence: 1.0,
        status: 'active'
      }, {
        onConflict: 'user_id,type,subtype'
      });

    if (error) {
      logger.error({ error }, 'Failed to save daily snapshot');
      throw error;
    }
  }

  /**
   * Get latest snapshot for a user
   */
  async getLatestSnapshot(userId: UserId): Promise<DailySnapshot | null> {
    const { data, error } = await this.db
      .from('user_intelligence')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'daily_snapshot')
      .order('subtype', { ascending: false }) // subtype is the snapshot_date
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    const snapshotData = data.data || {};

    return {
      id: data.id,
      userId: data.user_id,
      snapshotDate: new Date(data.subtype), // subtype is the snapshot_date
      priorityItems: snapshotData.priority_items || [],
      pendingDecisions: snapshotData.pending_decisions || [],
      meetingPreviews: snapshotData.meeting_previews || [],
      predictions: snapshotData.predictions || [],
      generatedAt: new Date(snapshotData.generated_at || data.created_at)
    };
  }
}
