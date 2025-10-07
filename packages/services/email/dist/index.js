import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { logger } from '@tide/logger';
import { GmailProvider } from './providers/gmail.provider.js';
import { ExchangeProvider } from './providers/exchange.provider.js';
import { EmailTriageEngine } from './triage/triage-engine.js';
import { SmartComposer } from './composer/smart-composer.js';
/**
 * Email service main application
 */
class EmailService {
    constructor() {
        this.app = express();
        this.triageEngine = new EmailTriageEngine();
        this.composer = new SmartComposer();
        this.providers = new Map();
        this.setupMiddleware();
        this.setupRoutes();
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        // Request logging
        this.app.use((req, res, next) => {
            logger.info({
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
                service: 'email',
                timestamp: new Date().toISOString(),
            });
        });
        // Connect email provider
        this.app.post('/connect/:provider', async (req, res) => {
            try {
                const { provider } = req.params;
                const { userId, tokens } = req.body;
                if (!userId || !tokens) {
                    return res.status(400).json({ error: 'Missing userId or tokens' });
                }
                const emailProvider = this.getProvider(provider);
                await emailProvider.initialize(userId, tokens);
                this.providers.set(`${userId}-${provider}`, emailProvider);
                logger.info({ userId, provider }, 'Email provider connected');
                res.json({ success: true, provider });
            }
            catch (error) {
                logger.error({ error }, 'Failed to connect email provider');
                res.status(500).json({ error: 'Failed to connect email provider' });
            }
        });
        // Fetch emails
        this.app.get('/emails/:userId/:provider', async (req, res) => {
            try {
                const { userId, provider } = req.params;
                const { limit, unreadOnly } = req.query;
                const emailProvider = this.providers.get(`${userId}-${provider}`);
                if (!emailProvider) {
                    return res.status(404).json({ error: 'Provider not connected' });
                }
                const emails = await emailProvider.fetchEmails({
                    limit: limit ? parseInt(limit) : 50,
                    unreadOnly: unreadOnly === 'true',
                });
                res.json({ emails, count: emails.length });
            }
            catch (error) {
                logger.error({ error }, 'Failed to fetch emails');
                res.status(500).json({ error: 'Failed to fetch emails' });
            }
        });
        // Triage email
        this.app.post('/triage', async (req, res) => {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ error: 'Missing email data' });
                }
                const triageResult = await this.triageEngine.analyze(email);
                res.json({ triage: triageResult });
            }
            catch (error) {
                logger.error({ error }, 'Failed to triage email');
                res.status(500).json({ error: 'Failed to triage email' });
            }
        });
        // Compose email drafts
        this.app.post('/compose', async (req, res) => {
            try {
                const request = req.body;
                if (!request.userId || !request.recipient) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }
                const drafts = await this.composer.compose(request);
                res.json({ drafts, count: drafts.length });
            }
            catch (error) {
                logger.error({ error }, 'Failed to compose email');
                res.status(500).json({ error: 'Failed to compose email' });
            }
        });
        // Send email
        this.app.post('/send/:userId/:provider', async (req, res) => {
            try {
                const { userId, provider } = req.params;
                const { draft, to } = req.body;
                if (!draft || !to) {
                    return res.status(400).json({ error: 'Missing draft or recipients' });
                }
                const emailProvider = this.providers.get(`${userId}-${provider}`);
                if (!emailProvider) {
                    return res.status(404).json({ error: 'Provider not connected' });
                }
                await emailProvider.sendEmail(draft, to);
                res.json({ success: true });
            }
            catch (error) {
                logger.error({ error }, 'Failed to send email');
                res.status(500).json({ error: 'Failed to send email' });
            }
        });
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });
        // Error handler
        this.app.use((err, req, res, next) => {
            logger.error({ error: err }, 'Unhandled error');
            res.status(500).json({ error: 'Internal server error' });
        });
    }
    /**
     * Get email provider instance
     */
    getProvider(provider) {
        switch (provider) {
            case 'gmail':
                return new GmailProvider();
            case 'exchange':
                return new ExchangeProvider();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    /**
     * Start the email service
     */
    async start() {
        const port = env.PORT || 3003;
        this.app.listen(port, () => {
            logger.info({ port, service: 'email' }, 'Email service started');
        });
    }
}
// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
    const service = new EmailService();
    service.start().catch((error) => {
        logger.error({ error }, 'Failed to start email service');
        process.exit(1);
    });
}
export { EmailService };
//# sourceMappingURL=index.js.map