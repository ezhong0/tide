import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { ServiceBase, type HealthStatus } from '@tide/base';
import { SupabaseConnectionManager, getDefaultEmailIntelligence } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  authenticateJWT,
  initializeAuth,
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
import {
  validate,
  ConnectProviderSchema,
  FetchEmailsParamsSchema,
  FetchEmailsQuerySchema,
  TriageEmailSchema,
  ComposeRequestSchema,
  SendEmailParamsSchema,
  SendEmailBodySchema,
  SearchEmailsSchema,
  SearchSuggestionsSchema,
  PopularSearchesSchema,
} from './validation.js';

/**
 * Email Service
 * Intelligent email management with AI triage, smart composition, and search
 * Extends ServiceBase for graceful shutdown and resource management
 */
class EmailService extends ServiceBase {
  private triageEngine!: EmailTriageEngine;
  private composer!: SmartComposer;
  private providers!: Map<string, GmailProvider | ExchangeProvider>;
  private db!: ReturnType<typeof SupabaseConnectionManager.getInstance>;

  constructor() {
    super({
      name: 'email',
      version: '0.1.0',
      port: env.PORT || 3003,
      shutdownTimeout: 10000,
    });
  }

  protected async initialize(): Promise<void> {
    // Initialize authentication
    try {
      initializeAuth();
      this.logger.info('Authentication initialized');
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize authentication');
      throw new Error('Authentication initialization failed');
    }

    // Initialize encryption for OAuth tokens
    try {
      initializeEncryption();
      this.logger.info('Encryption initialized for OAuth tokens');
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize encryption');
      throw new Error('Encryption initialization failed - cannot proceed without secure token storage');
    }

    // Initialize database connection
    this.db = SupabaseConnectionManager.getInstance(true); // Use service role for backend operations

    // Initialize email components
    this.triageEngine = new EmailTriageEngine();
    this.composer = new SmartComposer();
    this.providers = new Map();

    // Register database cleanup
    this.registerResource({
      name: 'database',
      cleanup: async () => {
        await SupabaseConnectionManager.cleanup();
      },
    });

    this.logger.info('Email service initialized successfully');
  }

  protected setupRoutes(app: express.Application): void {
    // Middleware
    app.use(helmet());

    // CORS configuration
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];
    app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow configured origins or any origin in development
        if (env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      maxAge: 86400, // 24 hours
    }));

    app.use(express.json());
    app.use(moderateRateLimit);

    // Request logging
    app.use((req, res, next) => {
      this.logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.userId,
      }, 'Incoming request');
      next();
    });

    // NOTE: OAuth endpoint removed - using Supabase OAuth instead
    // Tokens are stored in Supabase's oauth_tokens table via Supabase Auth

    // Connect email provider (legacy endpoint - keep for backwards compatibility)
    app.post('/connect/:provider',
      authenticateJWT,
      validate(ConnectProviderSchema, 'body'),
      async (req, res) => {
      try {
        const { provider } = req.params;
        const { userId, tokens } = req.body;

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
          this.logger.error({ error: dbError }, 'Failed to store OAuth tokens');
          // Continue anyway - don't fail the request
        }

        this.logger.info({ userId, provider }, 'Email provider connected');

        res.json({ success: true, provider });
      } catch (error) {
        this.logger.error({ error }, 'Failed to connect email provider');
        res.status(500).json({ error: 'Failed to connect email provider' });
      }
    });

    // Fetch emails
    app.get('/emails/:userId/:provider',
      authenticateJWT,
      validate(FetchEmailsParamsSchema, 'params'),
      validate(FetchEmailsQuerySchema, 'query'),
      async (req, res) => {
      try {
        const { userId, provider } = req.params;
        const { limit, unreadOnly } = req.query;

        // Try to fetch from database first
        const { data: dbEmails, error: dbError } = await this.db
          .from('emails')
          .select('*')
          .eq('user_id', userId)
          .eq('provider', provider === 'gmail' ? 'google' : 'microsoft')
          .order('sent_at', { ascending: false })
          .limit(limit ? parseInt(limit as string) : 50);

        // If we have emails in database, return them
        if (!dbError && dbEmails && dbEmails.length > 0) {
          // Convert database emails to API format
          const emails = dbEmails.map(dbEmail => ({
            id: dbEmail.provider_message_id,
            userId: dbEmail.user_id,
            provider: dbEmail.provider,
            messageId: dbEmail.provider_message_id,
            threadId: dbEmail.provider_thread_id,
            from: dbEmail.from_email,
            to: dbEmail.to_emails,
            cc: dbEmail.cc_emails,
            subject: dbEmail.subject,
            body: dbEmail.body_text,
            htmlBody: dbEmail.body_html,
            timestamp: new Date(dbEmail.sent_at),
            isRead: !dbEmail.is_unread, // Note: inverted logic - database stores is_unread
            isStarred: dbEmail.is_starred,
            hasAttachments: dbEmail.attachments && dbEmail.attachments.length > 0,
            // Include AI triage fields from intelligence JSONB
            aiCategory: dbEmail.intelligence?.category || null,
            aiPriority: dbEmail.intelligence?.priority || 5,
            aiSummary: dbEmail.intelligence?.ai_summary || null,
          }));

          this.logger.info({ userId, provider, count: emails.length }, 'Returned emails from database');
          return res.json({ emails, count: emails.length });
        }

        // No emails in database - try to fetch from provider
        this.logger.info({ userId, provider }, 'No emails in database, fetching from provider');

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

            // Map urgency to category for intelligence JSONB
            let category: 'urgent' | 'important' | 'newsletter' | 'promotional' | 'social' | 'spam' | 'other' | null = 'other';
            if (triageResult.urgency === 'immediate' || triageResult.importance > 0.8) {
              category = 'urgent';
            } else if (triageResult.importance > 0.6) {
              category = 'important';
            }

            // Calculate priority score (1-10)
            const priority = Math.round(triageResult.importance * 10);

            // Map urgency level
            let urgency: 'critical' | 'high' | 'medium' | 'low' = 'medium';
            if (triageResult.urgency === 'immediate') {
              urgency = 'critical';
            } else if (triageResult.importance > 0.7) {
              urgency = 'high';
            } else if (triageResult.importance < 0.3) {
              urgency = 'low';
            }

            // Generate AI summary
            const aiSummary = `${triageResult.category} - ${triageResult.strategy.reasoning}`;

            // Store in database
            await this.db.from('emails').upsert({
              provider_message_id: email.messageId,
              user_id: userId,
              provider: provider === 'gmail' ? 'google' : 'microsoft',
              provider_thread_id: email.threadId || null,
              from_email: email.from,
              from_name: null, // TODO: Extract from email if available
              to_emails: email.to,
              cc_emails: email.cc || [],
              subject: email.subject,
              body_text: email.body,
              body_html: email.htmlBody || null,
              sent_at: email.timestamp.toISOString(),
              is_unread: !email.isRead, // Note: inverted logic
              is_starred: email.isStarred || false,
              attachments: email.hasAttachments ? [] : null, // Placeholder
              intelligence: {
                category,
                priority,
                urgency,
                ai_summary: aiSummary,
                triage_score: triageResult.importance,
                suggested_actions: [],
              },
            }, {
              onConflict: 'provider_message_id',
            });
          })
        );

        this.logger.info({ userId, provider, count: emails.length }, 'Fetched and stored emails');

        res.json({ emails, count: emails.length });
      } catch (error) {
        this.logger.error({ error }, 'Failed to fetch emails');
        res.status(500).json({ error: 'Failed to fetch emails' });
      }
    });

    // Triage email
    app.post('/triage',
      authenticateJWT,
      validate(TriageEmailSchema, 'body'),
      async (req, res) => {
      try {
        const { email } = req.body;

        const triageResult = await this.triageEngine.analyze(email);

        res.json({ triage: triageResult });
      } catch (error) {
        this.logger.error({ error }, 'Failed to triage email');
        res.status(500).json({ error: 'Failed to triage email' });
      }
    });

    // Compose email drafts
    app.post('/compose',
      authenticateJWT,
      validate(ComposeRequestSchema, 'body'),
      async (req, res) => {
      try {
        const request = req.body;

        const drafts = await this.composer.compose(request);

        res.json({ drafts, count: drafts.length });
      } catch (error) {
        this.logger.error({ error }, 'Failed to compose email');
        res.status(500).json({ error: 'Failed to compose email' });
      }
    });

    // Send email
    app.post('/send/:userId/:provider',
      authenticateJWT,
      validate(SendEmailParamsSchema, 'params'),
      validate(SendEmailBodySchema, 'body'),
      async (req, res) => {
      try {
        const { userId, provider } = req.params;
        const { draft, to } = req.body;

        const emailProvider = this.providers.get(`${userId}-${provider}`);
        if (!emailProvider) {
          return res.status(404).json({ error: 'Provider not connected' });
        }

        await emailProvider.sendEmail(draft, to);

        res.json({ success: true });
      } catch (error) {
        this.logger.error({ error }, 'Failed to send email');
        res.status(500).json({ error: 'Failed to send email' });
      }
    });

    // Search emails
    app.post('/search',
      authenticateJWT,
      validate(SearchEmailsSchema, 'body'),
      async (req, res) => {
      try {
        const { query, userId, filters, limit, offset, sort, order } = req.body;

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
        this.logger.error({ error }, 'Email search failed');
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // Get search suggestions
    app.get('/search/suggestions',
      authenticateJWT,
      validate(SearchSuggestionsSchema, 'query'),
      async (req, res) => {
      try {
        const { userId, query, limit } = req.query;

        const suggestions = await emailSearch.getSuggestions(
          userId as UserId,
          (query as string) || '',
          limit ? parseInt(limit as string) : 5
        );

        res.json({ suggestions });
      } catch (error) {
        this.logger.error({ error }, 'Failed to get search suggestions');
        res.status(500).json({ error: 'Failed to get suggestions' });
      }
    });

    // Get popular searches
    app.get('/search/popular',
      authenticateJWT,
      validate(PopularSearchesSchema, 'query'),
      async (req, res) => {
      try {
        const { userId, limit } = req.query;

        const popular = await emailSearch.getPopularSearches(
          userId as UserId,
          limit ? parseInt(limit as string) : 10
        );

        res.json({ queries: popular });
      } catch (error) {
        this.logger.error({ error }, 'Failed to get popular searches');
        res.status(500).json({ error: 'Failed to get popular searches' });
      }
    });

    // 404 handler - must be before error handler
    app.use(notFoundHandler);

    // Error handler - must be last
    app.use(errorHandler);
  }

  protected async healthCheck(): Promise<Partial<HealthStatus>> {
    const dbStatus = SupabaseConnectionManager.getStatus();

    return {
      checks: {
        database: {
          status: dbStatus.serviceRole ? 'up' : 'down',
          details: dbStatus,
        },
        triageEngine: { status: 'up' },
        composer: { status: 'up' },
        providers: {
          status: 'up',
          details: { count: this.providers.size },
        },
      },
    };
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
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = express();
  const service = new EmailService();

  service.start(app).catch((error) => {
    console.error('Failed to start email service:', error);
    process.exit(1);
  });
}

export { EmailService };
