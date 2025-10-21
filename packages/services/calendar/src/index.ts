import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { ServiceBase, type HealthStatus } from '@tide/base';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  authenticateJWT,
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import { GoogleCalendarProvider } from './providers/google-calendar.provider.js';
import { SmartScheduler } from './scheduler/smart-scheduler.js';
import type { CalendarProvider, OAuthTokens, MeetingRequest } from './types/index.js';

/**
 * Calendar service - Intelligent calendar management
 * Extends ServiceBase for graceful shutdown and resource management
 */
class CalendarService extends ServiceBase {
  private scheduler!: SmartScheduler;
  private providers: Map<string, GoogleCalendarProvider>;

  constructor() {
    super({
      name: 'calendar',
      version: '0.1.0',
      port: env.PORT || 3004,
      shutdownTimeout: 10000, // 10 seconds for graceful shutdown
    });

    this.providers = new Map();
  }

  /**
   * Initialize service resources
   */
  protected async initialize(): Promise<void> {
    this.scheduler = new SmartScheduler();

    // Register database connection manager for cleanup
    this.registerResource({
      name: 'database',
      cleanup: async () => {
        await SupabaseConnectionManager.cleanup();
      },
    });

    this.logger.info('Calendar service initialized successfully');
  }

  /**
   * Setup Express routes
   */
  protected setupRoutes(app: express.Application): void {
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(moderateRateLimit);

    // Request logging
    app.use((req, res, next) => {
      this.logger.info({
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
      }, 'Incoming request');
      next();
    });

    // Connect calendar provider
    app.post('/connect/:provider', authenticateJWT, async (req, res) => {
      try {
        const { provider } = req.params;
        const { userId, tokens } = req.body;

        if (!userId || !tokens) {
          return res.status(400).json({ error: 'Missing userId or tokens' });
        }

        const calendarProvider = this.getProvider(provider as CalendarProvider);
        await calendarProvider.initialize(userId as UserId, tokens as OAuthTokens);

        this.providers.set(`${userId}-${provider}`, calendarProvider);

        this.logger.info({ userId, provider }, 'Calendar provider connected');

        res.json({ success: true, provider });
      } catch (error) {
        this.logger.error({ error }, 'Failed to connect calendar provider');
        res.status(500).json({ error: 'Failed to connect calendar provider' });
      }
    });

    // Fetch events
    app.get('/events/:userId/:provider', authenticateJWT, async (req, res) => {
      try {
        const { userId, provider } = req.params;
        const { start, end } = req.query;

        if (!start || !end) {
          return res.status(400).json({ error: 'Missing start or end date' });
        }

        const calendarProvider = this.providers.get(`${userId}-${provider}`);
        if (!calendarProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        const events = await calendarProvider.fetchEvents(
          new Date(start as string),
          new Date(end as string)
        );

        res.json({ events, count: events.length });
      } catch (error) {
        this.logger.error({ error }, 'Failed to fetch events');
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

    // Get availability
    app.get('/availability/:userId/:provider', authenticateJWT, async (req, res) => {
      try {
        const { userId, provider } = req.params;
        const { start, end } = req.query;

        if (!start || !end) {
          return res.status(400).json({ error: 'Missing start or end date' });
        }

        const calendarProvider = this.providers.get(`${userId}-${provider}`);
        if (!calendarProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        const availability = await calendarProvider.getAvailability(
          new Date(start as string),
          new Date(end as string)
        );

        res.json({ availability });
      } catch (error) {
        this.logger.error({ error }, 'Failed to get availability');
        res.status(500).json({ error: 'Failed to get availability' });
      }
    });

    // Schedule meeting
    app.post('/schedule', authenticateJWT, async (req, res) => {
      try {
        const request = req.body as MeetingRequest;

        if (!request.userId || !request.title || !request.participants) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get availability for all participants
        // In a real implementation, this would fetch from multiple providers
        const availabilities: any[] = []; // Placeholder

        const result = await this.scheduler.scheduleMeeting(request, availabilities);

        res.json({ result });
      } catch (error) {
        this.logger.error({ error }, 'Failed to schedule meeting');
        res.status(500).json({ error: 'Failed to schedule meeting' });
      }
    });

    // Create event
    app.post('/events/:userId/:provider', authenticateJWT, async (req, res) => {
      try {
        const { userId, provider } = req.params;
        const { event } = req.body;

        if (!event) {
          return res.status(400).json({ error: 'Missing event data' });
        }

        const calendarProvider = this.providers.get(`${userId}-${provider}`);
        if (!calendarProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        const created = await calendarProvider.createEvent(event);

        res.json({ event: created });
      } catch (error) {
        this.logger.error({ error }, 'Failed to create event');
        res.status(500).json({ error: 'Failed to create event' });
      }
    });

    // Update event
    app.patch('/events/:userId/:provider/:eventId', authenticateJWT, async (req, res) => {
      try {
        const { userId, provider, eventId } = req.params;
        const { updates } = req.body;

        if (!updates) {
          return res.status(400).json({ error: 'Missing update data' });
        }

        const calendarProvider = this.providers.get(`${userId}-${provider}`);
        if (!calendarProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        const updated = await calendarProvider.updateEvent(eventId, updates);

        res.json({ event: updated });
      } catch (error) {
        this.logger.error({ error }, 'Failed to update event');
        res.status(500).json({ error: 'Failed to update event' });
      }
    });

    // Delete event
    app.delete('/events/:userId/:provider/:eventId', authenticateJWT, async (req, res) => {
      try {
        const { userId, provider, eventId } = req.params;

        const calendarProvider = this.providers.get(`${userId}-${provider}`);
        if (!calendarProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        await calendarProvider.deleteEvent(eventId);

        res.json({ success: true });
      } catch (error) {
        this.logger.error({ error }, 'Failed to delete event');
        res.status(500).json({ error: 'Failed to delete event' });
      }
    });

    // 404 handler - must be before error handler
    app.use(notFoundHandler);

    // Error handler - must be last
    app.use(errorHandler);
  }

  /**
   * Custom health checks
   */
  protected async healthCheck(): Promise<Partial<HealthStatus>> {
    const dbStatus = SupabaseConnectionManager.getStatus();

    return {
      checks: {
        scheduler: { status: 'up' },
        database: {
          status: dbStatus.serviceRole ? 'up' : 'down',
          details: dbStatus,
        },
        providers: {
          status: 'up',
          details: { count: this.providers.size },
        },
      },
    };
  }

  /**
   * Get calendar provider instance
   */
  private getProvider(provider: CalendarProvider): GoogleCalendarProvider {
    switch (provider) {
      case 'google':
        return new GoogleCalendarProvider();
      // case 'exchange':
      //   return new ExchangeCalendarProvider();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = express();
  const service = new CalendarService();

  service.start(app).catch((error) => {
    console.error('Failed to start calendar service:', error);
    process.exit(1);
  });
}

export { CalendarService };
