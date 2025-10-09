import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  authenticateJWT,
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import { initializeEncryption, encrypt, decrypt } from '@tide/encryption';
import { GmailProvider } from './providers/gmail.provider.js';
import { ExchangeProvider } from './providers/exchange.provider.js';
import { EmailTriageEngine } from './triage/triage-engine.js';
import { SmartComposer } from './composer/smart-composer.js';
import { emailSearch } from './search/email-search.js';
import type { EmailProvider, OAuthTokens, ComposeRequest } from './types/index.js';

/**
 * Email service main application
 */
class EmailService {
  private app: express.Application;
  private triageEngine: EmailTriageEngine;
  private composer: SmartComposer;
  private providers: Map<string, GmailProvider | ExchangeProvider>;
  private db: ReturnType<typeof createSupabase>;

  constructor() {
    this.app = express();
    this.triageEngine = new EmailTriageEngine();
    this.composer = new SmartComposer();
    this.providers = new Map();
    this.db = createSupabase(true); // Use service role for backend operations

    // Initialize encryption for OAuth tokens
    try {
      initializeEncryption();
      logger.info('Encryption initialized for OAuth tokens');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize encryption');
      throw new Error('Encryption initialization failed - cannot proceed without secure token storage');
    }

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

    // Rate limiting (100 req/min)
    this.app.use(moderateRateLimit);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userId: req.user?.userId,
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
        service: 'email',
        timestamp: new Date().toISOString(),
      });
    });

    // NOTE: OAuth endpoint removed - using Supabase OAuth instead
    // Tokens are stored in Supabase's oauth_tokens table via Supabase Auth

    // Connect email provider (legacy endpoint - keep for backwards compatibility)
    this.app.post('/connect/:provider', authenticateJWT, async (req, res) => {
      try {
        const { provider } = req.params;
        const { userId, tokens } = req.body;

        if (!userId || !tokens) {
          return res.status(400).json({ error: 'Missing userId or tokens' });
        }

        const emailProvider = this.getProvider(provider as EmailProvider);
        await emailProvider.initialize(userId as UserId, tokens as OAuthTokens);

        this.providers.set(`${userId}-${provider}`, emailProvider);

        // Store OAuth tokens in database (encrypted)
        const encryptedAccessToken = await encrypt(tokens.accessToken);
        const encryptedRefreshToken = await encrypt(tokens.refreshToken);

        const { error: dbError } = await this.db
          .from('oauth_tokens')
          .upsert({
            user_id: userId,
            provider: provider === 'gmail' ? 'google' : 'microsoft',
            service: 'email',
            access_token: encryptedAccessToken,
            refresh_token: encryptedRefreshToken,
            expires_at: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
            scope: tokens.scope || null,
          }, {
            onConflict: 'user_id,provider,service',
          });

        if (dbError) {
          logger.error({ error: dbError }, 'Failed to store OAuth tokens');
          // Continue anyway - don't fail the request
        }

        logger.info({ userId, provider }, 'Email provider connected');

        res.json({ success: true, provider });
      } catch (error) {
        logger.error({ error }, 'Failed to connect email provider');
        res.status(500).json({ error: 'Failed to connect email provider' });
      }
    });

    // Fetch emails
    this.app.get('/emails/:userId/:provider', authenticateJWT, async (req, res) => {
      try {
        const { userId, provider } = req.params;
        const { limit, unreadOnly } = req.query;

        // Try to fetch from database first
        const { data: dbEmails, error: dbError } = await this.db
          .from('email_messages')
          .select('*')
          .eq('user_id', userId)
          .eq('provider', provider === 'gmail' ? 'google' : 'microsoft')
          .order('received_at', { ascending: false })
          .limit(limit ? parseInt(limit as string) : 50);

        // If we have emails in database, return them
        if (!dbError && dbEmails && dbEmails.length > 0) {
          // Convert database emails to API format
          const emails = dbEmails.map(dbEmail => ({
            id: dbEmail.external_message_id,
            userId: dbEmail.user_id,
            provider: dbEmail.provider,
            messageId: dbEmail.external_message_id,
            threadId: dbEmail.thread_id,
            from: dbEmail.from_address,
            to: dbEmail.to_addresses,
            cc: dbEmail.cc_addresses,
            subject: dbEmail.subject,
            body: dbEmail.body_text,
            htmlBody: dbEmail.body_html,
            timestamp: new Date(dbEmail.received_at),
            isRead: dbEmail.is_read,
            isStarred: false,
            hasAttachments: false,
            // Include AI triage fields from database
            aiCategory: dbEmail.ai_category,
            aiPriority: dbEmail.ai_priority,
            aiSummary: dbEmail.ai_summary,
          }));

          logger.info({ userId, provider, count: emails.length }, 'Returned emails from database');
          return res.json({ emails, count: emails.length });
        }

        // No emails in database - try to fetch from provider
        logger.info({ userId, provider }, 'No emails in database, fetching from provider');

        // Try to get provider from cache
        let emailProvider = this.providers.get(`${userId}-${provider}`);

        // If not in cache, retrieve from database and initialize
        if (!emailProvider) {
          const { data: tokenData, error: tokenError } = await this.db
            .from('oauth_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', provider === 'gmail' ? 'google' : 'microsoft')
            .eq('service', 'email')
            .single();

          if (tokenError || !tokenData) {
            return res.status(404).json({
              error: 'No emails found and provider not connected.',
              message: 'Please connect your Gmail account or insert test data.'
            });
          }

          // Initialize provider with tokens from database (decrypt first)
          const decryptedAccessToken = await decrypt(tokenData.access_token);
          const decryptedRefreshToken = await decrypt(tokenData.refresh_token);

          emailProvider = this.getProvider(provider as EmailProvider);
          await emailProvider.initialize(userId as UserId, {
            accessToken: decryptedAccessToken,
            refreshToken: decryptedRefreshToken,
            expiresAt: new Date(tokenData.expires_at), // Convert string to Date
            scope: tokenData.scope ? tokenData.scope.split(' ') : [], // Convert space-separated string to array
          } as OAuthTokens);

          this.providers.set(`${userId}-${provider}`, emailProvider);
        }

        const emails = await emailProvider.fetchEmails({
          limit: limit ? parseInt(limit as string) : 50,
          unreadOnly: unreadOnly === 'true',
        });

        // Store emails in database and triage them (parallel processing for performance)
        await Promise.all(
          emails.map(async (email) => {
            // Run AI triage analysis
            const triageResult = await this.triageEngine.analyze(email);

            // Map urgency to category for database
            let aiCategory = 'normal';
            if (triageResult.urgency === 'immediate' || triageResult.importance > 0.8) {
              aiCategory = 'urgent';
            } else if (triageResult.importance > 0.6) {
              aiCategory = 'important';
            } else if (triageResult.importance < 0.3) {
              aiCategory = 'low';
            }

            // Calculate priority score (1-10)
            const aiPriority = Math.round(triageResult.importance * 10);

            // Generate AI summary
            const aiSummary = `${triageResult.category} - ${triageResult.strategy.reasoning}`;

            // Parallel database writes for thread and message
            await Promise.all([
              // Create or update thread
              this.db
                .from('email_threads')
                .upsert({
                  user_id: userId,
                  provider: provider === 'gmail' ? 'google' : 'microsoft',
                  external_thread_id: email.threadId || email.id,
                  subject: email.subject,
                  participants: email.from ? [email.from] : [],
                  last_message_at: email.timestamp,
                }, {
                  onConflict: 'user_id,external_thread_id',
                }),

              // Store individual email message with AI analysis
              this.db
                .from('email_messages')
                .upsert({
                  user_id: userId,
                  provider: provider === 'gmail' ? 'google' : 'microsoft',
                  external_message_id: email.id,
                  thread_id: email.threadId || email.id,
                  from_address: email.from,
                  to_addresses: email.to || [],
                  cc_addresses: email.cc || [],
                  subject: email.subject,
                  body_text: email.body,
                  body_html: email.htmlBody || null,
                  received_at: email.timestamp,
                  is_read: email.isRead || false,
                  ai_category: aiCategory,
                  ai_priority: aiPriority,
                  ai_summary: aiSummary,
                }, {
                  onConflict: 'user_id,external_message_id',
                }),
            ]);

            logger.info({
              emailId: email.id,
              aiCategory,
              aiPriority,
              urgency: triageResult.urgency,
              importance: triageResult.importance
            }, 'Email triaged and stored');
          })
        );

        res.json({ emails, count: emails.length });
      } catch (error) {
        logger.error({ error }, 'Failed to fetch emails');
        res.status(500).json({ error: 'Failed to fetch emails' });
      }
    });

    // Triage email
    this.app.post('/triage', authenticateJWT, async (req, res) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ error: 'Missing email data' });
        }

        const triageResult = await this.triageEngine.analyze(email);

        res.json({ triage: triageResult });
      } catch (error) {
        logger.error({ error }, 'Failed to triage email');
        res.status(500).json({ error: 'Failed to triage email' });
      }
    });

    // Compose email drafts
    this.app.post('/compose', authenticateJWT, async (req, res) => {
      try {
        const request = req.body as ComposeRequest;

        if (!request.userId || !request.recipient) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const drafts = await this.composer.compose(request);

        res.json({ drafts, count: drafts.length });
      } catch (error) {
        logger.error({ error }, 'Failed to compose email');
        res.status(500).json({ error: 'Failed to compose email' });
      }
    });

    // Send email
    this.app.post('/send/:userId/:provider', authenticateJWT, async (req, res) => {
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
      } catch (error) {
        logger.error({ error }, 'Failed to send email');
        res.status(500).json({ error: 'Failed to send email' });
      }
    });

    // Search emails
    this.app.post('/search', authenticateJWT, async (req, res) => {
      try {
        const { query, userId, filters, limit, offset, sort, order } = req.body;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const results = await emailSearch.search({
          query: query || '',
          userId: userId as UserId,
          filters,
          limit,
          offset,
          sort,
          order,
        });

        res.json(results);
      } catch (error) {
        logger.error({ error }, 'Email search failed');
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // Get search suggestions
    this.app.get('/search/suggestions', authenticateJWT, async (req, res) => {
      try {
        const { userId, query, limit } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const suggestions = await emailSearch.getSuggestions(
          userId as UserId,
          (query as string) || '',
          limit ? parseInt(limit as string) : 5
        );

        res.json({ suggestions });
      } catch (error) {
        logger.error({ error }, 'Failed to get search suggestions');
        res.status(500).json({ error: 'Failed to get suggestions' });
      }
    });

    // Get popular searches
    this.app.get('/search/popular', authenticateJWT, async (req, res) => {
      try {
        const { userId, limit } = req.query;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        const popular = await emailSearch.getPopularSearches(
          userId as UserId,
          limit ? parseInt(limit as string) : 10
        );

        res.json({ queries: popular });
      } catch (error) {
        logger.error({ error }, 'Failed to get popular searches');
        res.status(500).json({ error: 'Failed to get popular searches' });
      }
    });

    // 404 handler - must be before error handler
    this.app.use(notFoundHandler);

    // Error handler - must be last
    this.app.use(errorHandler);
  }

  /**
   * Get email provider instance
   */
  private getProvider(provider: EmailProvider): GmailProvider | ExchangeProvider {
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
  async start(): Promise<void> {
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
