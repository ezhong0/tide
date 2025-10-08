import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, serviceUrls } from '@tide/config';
import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  authenticateJWT,
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';

/**
 * Mobile Backend-for-Frontend Service
 *
 * Provides screen-based endpoints that aggregate multiple backend services
 * Optimized for mobile clients to reduce round-trips and payload sizes
 */
class MobileBFF {
  private app: express.Application;
  private db: ReturnType<typeof createSupabase>;

  constructor() {
    this.app = express();
    this.db = createSupabase(true);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());

    // Rate limiting (100 req/min)
    this.app.use(moderateRateLimit);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info({
        method: req.method,
        path: req.path,
        userId: req.user?.userId || req.body?.userId || req.query?.userId,
      }, 'BFF request');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'mobile-bff',
        timestamp: new Date().toISOString(),
      });
    });

    // Dashboard screen - aggregates all dashboard data
    this.app.get('/v1/screen/dashboard', async (req, res) => {
      try {
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const startTime = Date.now();

        // Fetch all data in parallel
        const [
          profile,
          unreadEmailsCount,
          upcomingEvents,
          priorityEmails,
          todayTasks,
          aiSummary,
        ] = await Promise.all([
          this.getUserProfile(userId as UserId),
          this.getUnreadEmailCount(userId as UserId),
          this.getUpcomingEvents(userId as UserId, 5),
          this.getPriorityEmails(userId as UserId, 3),
          this.getTodayTasks(userId as UserId, 5),
          this.getDailySummary(userId as UserId),
        ]);

        const took = Date.now() - startTime;

        res.json({
          user: profile,
          stats: {
            unreadEmails: unreadEmailsCount,
            upcomingEvents: upcomingEvents.length,
            todayTasks: todayTasks.length,
          },
          upcomingEvents,
          priorityEmails,
          todayTasks,
          aiSummary,
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Dashboard screen failed');
        res.status(500).json({ error: 'Failed to load dashboard' });
      }
    });

    // Inbox screen - email list with triage data
    this.app.get('/v1/screen/inbox', async (req, res) => {
      try {
        const { userId, filter = 'all', limit = 20, offset = 0 } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const startTime = Date.now();

        // Build query based on filter
        let query = this.db
          .from('email_messages')
          .select('id, subject, from_address, received_at, is_read, is_flagged, priority, ai_category, ai_summary, has_attachment', { count: 'exact' })
          .eq('user_id', userId as UserId);

        // Apply filters
        if (filter === 'unread') {
          query = query.eq('is_read', false);
        } else if (filter === 'flagged') {
          query = query.eq('is_flagged', true);
        } else if (filter === 'priority') {
          query = query.gte('priority', 7);
        } else if (filter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          query = query.gte('received_at', today.toISOString());
        }

        query = query
          .order('received_at', { ascending: false })
          .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

        const { data: emails, error, count } = await query;

        if (error) throw error;

        // Get VIP status for senders
        const senderEmails = [...new Set((emails || []).map(e => e.from_address))];
        const { data: vips } = await this.db
          .from('relationship_intelligence')
          .select('contact_email, vip_status')
          .eq('user_id', userId as UserId)
          .in('contact_email', senderEmails);

        const vipMap = new Map((vips || []).map(v => [v.contact_email, v.vip_status]));

        // Format emails with additional metadata
        const formattedEmails = (emails || []).map(email => ({
          id: email.id,
          subject: email.subject || '(No subject)',
          from: email.from_address,
          snippet: email.ai_summary || '',
          receivedAt: email.received_at,
          isRead: email.is_read,
          isFlagged: email.is_flagged,
          isVIP: vipMap.get(email.from_address) || false,
          priority: email.priority || 0,
          category: email.ai_category,
          hasAttachment: email.has_attachment,
        }));

        const took = Date.now() - startTime;

        res.json({
          emails: formattedEmails,
          total: count || 0,
          filter,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: (count || 0) > parseInt(offset as string) + formattedEmails.length,
          },
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Inbox screen failed');
        res.status(500).json({ error: 'Failed to load inbox' });
      }
    });

    // Email detail screen - single email with full context
    this.app.get('/v1/screen/email/:emailId', async (req, res) => {
      try {
        const { emailId } = req.params;
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const startTime = Date.now();

        // Fetch email details
        const { data: email, error } = await this.db
          .from('email_messages')
          .select('*')
          .eq('id', emailId)
          .eq('user_id', userId as UserId)
          .single();

        if (error || !email) {
          return res.status(404).json({ error: 'Email not found' });
        }

        // Fetch related data in parallel
        const [threadEmails, relationship, suggestedDrafts] = await Promise.all([
          this.getThreadEmails(email.thread_id, userId as UserId),
          this.getRelationship(userId as UserId, email.from_address),
          this.getSuggestedDrafts(emailId, userId as UserId),
        ]);

        const took = Date.now() - startTime;

        res.json({
          email: {
            id: email.id,
            subject: email.subject,
            from: email.from_address,
            to: email.to_addresses,
            cc: email.cc_addresses,
            body: email.body,
            receivedAt: email.received_at,
            isRead: email.is_read,
            isFlagged: email.is_flagged,
            hasAttachment: email.has_attachment,
            priority: email.priority,
            category: email.ai_category,
            summary: email.ai_summary,
          },
          thread: threadEmails,
          sender: relationship,
          suggestedReplies: suggestedDrafts,
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Email detail screen failed');
        res.status(500).json({ error: 'Failed to load email' });
      }
    });

    // Calendar screen - events with conflicts and suggestions
    this.app.get('/v1/screen/calendar', async (req, res) => {
      try {
        const { userId, startDate, endDate } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const start = startDate ? new Date(startDate as string) : new Date();
        const end = endDate ? new Date(endDate as string) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

        const startTime = Date.now();

        // Fetch events
        const { data: events } = await this.db
          .from('calendar_events')
          .select('*')
          .eq('user_id', userId as UserId)
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString())
          .order('start_time', { ascending: true });

        // Detect conflicts
        const conflicts = await this.detectConflicts(userId as UserId, events || []);

        // Get meeting briefs for upcoming meetings
        const upcomingMeetings = (events || [])
          .filter(e => new Date(e.start_time) > new Date())
          .slice(0, 3);

        const briefs = await Promise.all(
          upcomingMeetings.map(e => this.getMeetingBrief(e.id))
        );

        const took = Date.now() - startTime;

        res.json({
          events: (events || []).map(e => ({
            id: e.id,
            title: e.title,
            start: e.start_time,
            end: e.end_time,
            allDay: e.all_day,
            location: e.location,
            attendees: e.attendees,
            status: e.status,
            hasConflict: conflicts.some(c => c.eventIds.includes(e.id)),
          })),
          conflicts,
          upcomingBriefs: briefs.filter(b => b !== null),
          stats: {
            totalEvents: events?.length || 0,
            conflicts: conflicts.length,
            meetingsToday: (events || []).filter(e => {
              const eventDate = new Date(e.start_time);
              const today = new Date();
              return eventDate.toDateString() === today.toDateString();
            }).length,
          },
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Calendar screen failed');
        res.status(500).json({ error: 'Failed to load calendar' });
      }
    });

    // Meeting detail screen - full meeting context
    this.app.get('/v1/screen/meeting/:eventId', async (req, res) => {
      try {
        const { eventId } = req.params;
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const startTime = Date.now();

        // Fetch event
        const { data: event, error } = await this.db
          .from('calendar_events')
          .select('*')
          .eq('id', eventId)
          .eq('user_id', userId as UserId)
          .single();

        if (error || !event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Fetch related data
        const [brief, conflicts, alternativeSlots] = await Promise.all([
          this.getMeetingBrief(eventId),
          this.getEventConflicts(eventId, userId as UserId),
          this.getAlternativeSlots(userId as UserId, event),
        ]);

        const took = Date.now() - startTime;

        res.json({
          event: {
            id: event.id,
            title: event.title,
            description: event.description,
            start: event.start_time,
            end: event.end_time,
            allDay: event.all_day,
            location: event.location,
            attendees: event.attendees,
            status: event.status,
          },
          brief,
          conflicts,
          alternativeSlots,
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Meeting detail screen failed');
        res.status(500).json({ error: 'Failed to load meeting' });
      }
    });

    // Chat/AI screen - conversation with context
    this.app.get('/v1/screen/chat', async (req, res) => {
      try {
        const { userId, limit = 20 } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const startTime = Date.now();

        // Fetch recent conversations
        const { data: conversations } = await this.db
          .from('ai_conversations')
          .select('id, title, created_at, updated_at, context')
          .eq('user_id', userId as UserId)
          .order('updated_at', { ascending: false })
          .limit(parseInt(limit as string));

        // Get current context (emails, calendar, tasks)
        const [unreadCount, upcomingEvents, pendingTasks] = await Promise.all([
          this.getUnreadEmailCount(userId as UserId),
          this.getUpcomingEvents(userId as UserId, 3),
          this.getTodayTasks(userId as UserId, 5),
        ]);

        const took = Date.now() - startTime;

        res.json({
          conversations: conversations || [],
          context: {
            unreadEmails: unreadCount,
            upcomingEvents,
            pendingTasks,
          },
          suggestedQueries: [
            'Summarize my day',
            'What are my top priorities?',
            'Schedule time for project planning',
            'Draft a reply to my last email',
            'When is my next meeting?',
          ],
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Chat screen failed');
        res.status(500).json({ error: 'Failed to load chat' });
      }
    });

    // Profile/settings screen
    this.app.get('/v1/screen/profile', async (req, res) => {
      try {
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const startTime = Date.now();

        // Fetch user data
        const [profile, connectedAccounts, stats] = await Promise.all([
          this.getUserProfile(userId as UserId),
          this.getConnectedAccounts(userId as UserId),
          this.getUserStats(userId as UserId),
        ]);

        const took = Date.now() - startTime;

        res.json({
          profile,
          connectedAccounts,
          stats,
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Profile screen failed');
        res.status(500).json({ error: 'Failed to load profile' });
      }
    });

    // Batch endpoint - fetch multiple resources in one call
    this.app.post('/v1/batch', async (req, res) => {
      try {
        const { userId, requests } = req.body;

        if (!userId || !requests || !Array.isArray(requests)) {
          return res.status(400).json({ error: 'Invalid batch request' });
        }

        const startTime = Date.now();

        // Execute all requests in parallel
        const results = await Promise.allSettled(
          requests.map((req: any) => this.executeBatchRequest(userId, req))
        );

        const took = Date.now() - startTime;

        res.json({
          results: results.map((result, index) => ({
            id: requests[index].id,
            status: result.status,
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason : null,
          })),
          metadata: {
            fetchedAt: new Date().toISOString(),
            took,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Batch request failed');
        res.status(500).json({ error: 'Batch request failed' });
      }
    });

    // 404 handler - must be before error handler
    this.app.use(notFoundHandler);

    // Error handler - must be last
    this.app.use(errorHandler);
  }

  // Helper methods

  private async getUserProfile(userId: UserId) {
    const { data } = await this.db
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return data;
  }

  private async getUnreadEmailCount(userId: UserId): Promise<number> {
    const { count } = await this.db
      .from('email_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return count || 0;
  }

  private async getUpcomingEvents(userId: UserId, limit: number) {
    const { data } = await this.db
      .from('calendar_events')
      .select('id, title, start_time, end_time, location, attendees')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(limit);

    return (data || []).map(e => ({
      id: e.id,
      title: e.title,
      start: e.start_time,
      end: e.end_time,
      location: e.location,
      attendeeCount: e.attendees?.length || 0,
    }));
  }

  private async getPriorityEmails(userId: UserId, limit: number) {
    const { data } = await this.db
      .from('email_messages')
      .select('id, subject, from_address, received_at, priority, ai_summary')
      .eq('user_id', userId)
      .eq('is_read', false)
      .gte('priority', 7)
      .order('priority', { ascending: false })
      .order('received_at', { ascending: false })
      .limit(limit);

    return (data || []).map(e => ({
      id: e.id,
      subject: e.subject || '(No subject)',
      from: e.from_address,
      receivedAt: e.received_at,
      priority: e.priority,
      summary: e.ai_summary,
    }));
  }

  private async getTodayTasks(userId: UserId, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await this.db
      .from('tasks')
      .select('id, title, due_date, priority, status')
      .eq('user_id', userId)
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .order('priority', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private async getDailySummary(userId: UserId) {
    // Call AI service for daily summary
    try {
      const response = await fetch(`${serviceUrls.ai}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'daily_summary',
          input: {},
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const result = (await response.json()) as { summary?: string };
        return result.summary || 'Your day looks manageable!';
      }
    } catch (error) {
      logger.warn({ error }, 'Failed to get daily summary');
    }

    return 'Ready to tackle your day!';
  }

  private async getThreadEmails(threadId: string | null, userId: UserId) {
    if (!threadId) return [];

    const { data } = await this.db
      .from('email_messages')
      .select('id, subject, from_address, received_at, body')
      .eq('user_id', userId)
      .eq('thread_id', threadId)
      .order('received_at', { ascending: true })
      .limit(10);

    return data || [];
  }

  private async getRelationship(userId: UserId, contactEmail: string) {
    const { data } = await this.db
      .from('relationship_intelligence')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_email', contactEmail)
      .single();

    return data;
  }

  private async getSuggestedDrafts(emailId: string, userId: UserId) {
    // Would call email service for draft suggestions
    // For now, return placeholder
    return [];
  }

  private async detectConflicts(userId: UserId, events: any[]) {
    // Simple conflict detection
    const conflicts: any[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        const start1 = new Date(event1.start_time);
        const end1 = new Date(event1.end_time);
        const start2 = new Date(event2.start_time);
        const end2 = new Date(event2.end_time);

        if (start1 < end2 && end1 > start2) {
          conflicts.push({
            eventIds: [event1.id, event2.id],
            type: 'overlap',
            severity: 'high',
          });
        }
      }
    }

    return conflicts;
  }

  private async getMeetingBrief(eventId: string) {
    const { data } = await this.db
      .from('calendar_events')
      .select('meeting_brief')
      .eq('id', eventId)
      .single();

    return data?.meeting_brief || null;
  }

  private async getEventConflicts(eventId: string, userId: UserId) {
    // Would call calendar service
    return [];
  }

  private async getAlternativeSlots(userId: UserId, event: any) {
    // Would call calendar service for suggestions
    return [];
  }

  private async getConnectedAccounts(userId: UserId) {
    const { data } = await this.db
      .from('oauth_tokens')
      .select('provider, service, created_at')
      .eq('user_id', userId);

    return data || [];
  }

  private async getUserStats(userId: UserId) {
    const [emailCount, eventCount, taskCount] = await Promise.all([
      this.db.from('email_messages').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      this.db.from('calendar_events').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      this.db.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    return {
      totalEmails: emailCount.count || 0,
      totalEvents: eventCount.count || 0,
      totalTasks: taskCount.count || 0,
    };
  }

  private async executeBatchRequest(userId: UserId, request: any) {
    // Execute individual batch request
    switch (request.type) {
      case 'emails':
        return this.getPriorityEmails(userId, request.limit || 10);
      case 'events':
        return this.getUpcomingEvents(userId, request.limit || 10);
      case 'tasks':
        return this.getTodayTasks(userId, request.limit || 10);
      default:
        throw new Error(`Unknown batch request type: ${request.type}`);
    }
  }

  async start(): Promise<void> {
    const port = env.PORT || 3009;

    this.app.listen(port, () => {
      logger.info({ port, service: 'mobile-bff' }, 'Mobile BFF started');
    });
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new MobileBFF();
  service.start().catch((error) => {
    logger.error({ error }, 'Failed to start mobile BFF');
    process.exit(1);
  });
}

export { MobileBFF };
