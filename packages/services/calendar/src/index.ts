import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';
import { GoogleCalendarProvider } from './providers/google-calendar.provider';
import { SmartScheduler } from './scheduler/smart-scheduler';
import type { CalendarProvider, OAuthTokens, MeetingRequest } from './types';

/**
 * Calendar service main application
 */
class CalendarService {
  private app: express.Application;
  private scheduler: SmartScheduler;
  private providers: Map<string, GoogleCalendarProvider>;

  constructor() {
    this.app = express();
    this.scheduler = new SmartScheduler();
    this.providers = new Map();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
        },
        'Incoming request'
      );
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'calendar',
        timestamp: new Date().toISOString(),
      });
    });

    // Connect calendar provider
    this.app.post('/connect/:provider', async (req, res) => {
      try {
        const { provider } = req.params;
        const { userId, tokens } = req.body;

        if (!userId || !tokens) {
          return res.status(400).json({ error: 'Missing userId or tokens' });
        }

        const calendarProvider = this.getProvider(provider as CalendarProvider);
        await calendarProvider.initialize(userId as UserId, tokens as OAuthTokens);

        this.providers.set(`${userId}-${provider}`, calendarProvider);

        logger.info({ userId, provider }, 'Calendar provider connected');

        res.json({ success: true, provider });
      } catch (error) {
        logger.error({ error }, 'Failed to connect calendar provider');
        res.status(500).json({ error: 'Failed to connect calendar provider' });
      }
    });

    // Fetch events
    this.app.get('/events/:userId/:provider', async (req, res) => {
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
        logger.error({ error }, 'Failed to fetch events');
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

    // Get availability
    this.app.get('/availability/:userId/:provider', async (req, res) => {
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
        logger.error({ error }, 'Failed to get availability');
        res.status(500).json({ error: 'Failed to get availability' });
      }
    });

    // Schedule meeting
    this.app.post('/schedule', async (req, res) => {
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
        logger.error({ error }, 'Failed to schedule meeting');
        res.status(500).json({ error: 'Failed to schedule meeting' });
      }
    });

    // Create event
    this.app.post('/events/:userId/:provider', async (req, res) => {
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
        logger.error({ error }, 'Failed to create event');
        res.status(500).json({ error: 'Failed to create event' });
      }
    });

    // Update event
    this.app.patch('/events/:userId/:provider/:eventId', async (req, res) => {
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
        logger.error({ error }, 'Failed to update event');
        res.status(500).json({ error: 'Failed to update event' });
      }
    });

    // Delete event
    this.app.delete('/events/:userId/:provider/:eventId', async (req, res) => {
      try {
        const { userId, provider, eventId } = req.params;

        const calendarProvider = this.providers.get(`${userId}-${provider}`);
        if (!calendarProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        await calendarProvider.deleteEvent(eventId);

        res.json({ success: true });
      } catch (error) {
        logger.error({ error }, 'Failed to delete event');
        res.status(500).json({ error: 'Failed to delete event' });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error({ error: err }, 'Unhandled error');
        res.status(500).json({ error: 'Internal server error' });
      }
    );
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

  /**
   * Start the calendar service
   */
  async start(): Promise<void> {
    const port = env.PORT || 3004;

    this.app.listen(port, () => {
      logger.info({ port, service: 'calendar' }, 'Calendar service started');
    });
  }
}

// Start the service
if (require.main === module) {
  const service = new CalendarService();
  service.start().catch((error) => {
    logger.error({ error }, 'Failed to start calendar service');
    process.exit(1);
  });
}

export { CalendarService };
