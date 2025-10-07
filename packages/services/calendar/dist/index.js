"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("@tide/config");
const logger_1 = require("@tide/logger");
const google_calendar_provider_1 = require("./providers/google-calendar.provider");
const smart_scheduler_1 = require("./scheduler/smart-scheduler");
/**
 * Calendar service main application
 */
class CalendarService {
    constructor() {
        this.app = (0, express_1.default)();
        this.scheduler = new smart_scheduler_1.SmartScheduler();
        this.providers = new Map();
        this.setupMiddleware();
        this.setupRoutes();
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        // Request logging
        this.app.use((req, res, next) => {
            logger_1.logger.info({
                method: req.method,
                path: req.path,
                ip: req.ip,
            }, 'Incoming request');
            next();
        });
    }
    /**
     * Setup API routes
     */
    setupRoutes() {
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
                const calendarProvider = this.getProvider(provider);
                await calendarProvider.initialize(userId, tokens);
                this.providers.set(`${userId}-${provider}`, calendarProvider);
                logger_1.logger.info({ userId, provider }, 'Calendar provider connected');
                res.json({ success: true, provider });
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to connect calendar provider');
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
                const events = await calendarProvider.fetchEvents(new Date(start), new Date(end));
                res.json({ events, count: events.length });
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to fetch events');
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
                const availability = await calendarProvider.getAvailability(new Date(start), new Date(end));
                res.json({ availability });
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to get availability');
                res.status(500).json({ error: 'Failed to get availability' });
            }
        });
        // Schedule meeting
        this.app.post('/schedule', async (req, res) => {
            try {
                const request = req.body;
                if (!request.userId || !request.title || !request.participants) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }
                // Get availability for all participants
                // In a real implementation, this would fetch from multiple providers
                const availabilities = []; // Placeholder
                const result = await this.scheduler.scheduleMeeting(request, availabilities);
                res.json({ result });
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to schedule meeting');
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
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to create event');
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
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to update event');
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
            }
            catch (error) {
                logger_1.logger.error({ error }, 'Failed to delete event');
                res.status(500).json({ error: 'Failed to delete event' });
            }
        });
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });
        // Error handler
        this.app.use((err, req, res, next) => {
            logger_1.logger.error({ error: err }, 'Unhandled error');
            res.status(500).json({ error: 'Internal server error' });
        });
    }
    /**
     * Get calendar provider instance
     */
    getProvider(provider) {
        switch (provider) {
            case 'google':
                return new google_calendar_provider_1.GoogleCalendarProvider();
            // case 'exchange':
            //   return new ExchangeCalendarProvider();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    /**
     * Start the calendar service
     */
    async start() {
        const port = config_1.env.PORT || 3004;
        this.app.listen(port, () => {
            logger_1.logger.info({ port, service: 'calendar' }, 'Calendar service started');
        });
    }
}
exports.CalendarService = CalendarService;
// Start the service
if (require.main === module) {
    const service = new CalendarService();
    service.start().catch((error) => {
        logger_1.logger.error({ error }, 'Failed to start calendar service');
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map