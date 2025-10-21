import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@tide/config';
import { ServiceBase, type HealthStatus } from '@tide/base';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import { DecisionAnalyzer } from './analyzer/decision-analyzer.js';
import type { Decision, DecisionInput, DecisionStatus } from './types/index.js';

/**
 * Decisions Service
 * Manages decision requests, AI recommendations, and decision tracking
 * Extends ServiceBase for graceful shutdown and resource management
 */
class DecisionsService extends ServiceBase {
  private db!: ReturnType<typeof SupabaseConnectionManager.getInstance>;
  private analyzer!: DecisionAnalyzer;

  constructor() {
    super({
      name: 'decisions',
      version: '0.1.0',
      port: env.PORT || 3007,
      shutdownTimeout: 10000,
    });
  }

  protected async initialize(): Promise<void> {
    // Initialize database connection
    this.db = SupabaseConnectionManager.getInstance(true);

    // Initialize decision analyzer
    this.analyzer = new DecisionAnalyzer();

    // Register database cleanup
    this.registerResource({
      name: 'database',
      cleanup: async () => {
        await SupabaseConnectionManager.cleanup();
      },
    });

    this.logger.info('Decisions service initialized successfully');
  }

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
        ip: req.ip,
        userId: req.user?.userId,
      }, 'Incoming request');
      next();
    });

    // Create decision
    app.post('/decisions', async (req, res) => {
      try {
        const input: DecisionInput & { userId: UserId } = req.body;

        const { data: decision, error } = await this.db
          .from('decisions')
          .insert({
            user_id: input.userId,
            title: input.title,
            description: input.description,
            decision_type: input.decisionType,
            context: input.context,
            options: input.options || [],
            urgency: input.urgency || 'medium',
            deadline: input.deadline,
            requester_name: input.requesterName,
            requester_email: input.requesterEmail
          })
          .select()
          .single();

        if (error) throw error;

        // Analyze decision
        const recommendation = await this.analyzer.analyzeDecision(decision as any);

        // Update with recommendation
        await this.db
          .from('decisions')
          .update({ ai_recommendation: recommendation })
          .eq('id', decision.id);

        res.json({ decision: { ...decision, aiRecommendation: recommendation } });
      } catch (error) {
        this.logger.error({ error }, 'Failed to create decision');
        res.status(500).json({ error: 'Failed to create decision' });
      }
    });

    // Get pending decisions
    app.get('/decisions/pending/:userId', async (req, res) => {
      try {
        const { userId } = req.params;

        const { data: decisions, error } = await this.db
          .from('decisions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('urgency', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ decisions: decisions || [], count: decisions?.length || 0 });
      } catch (error) {
        this.logger.error({ error }, 'Failed to get pending decisions');
        res.status(500).json({ error: 'Failed to get pending decisions' });
      }
    });

    // Make decision
    app.post('/decisions/:decisionId/decide', async (req, res) => {
      try {
        const { decisionId } = req.params;
        const { userId, chosenOption, reasoning, status } = req.body;

        const { data: decision, error: updateError } = await this.db
          .from('decisions')
          .update({
            user_decision: { chosenOption, reasoning },
            status: status || 'approved',
            decided_at: new Date().toISOString()
          })
          .eq('id', decisionId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Record in history
        await this.db.from('decision_history').insert({
          decision_id: decisionId,
          user_id: userId,
          decision_type: decision.decision_type,
          ai_recommended: decision.ai_recommendation?.recommendedOption,
          user_chose: chosenOption,
          confidence_score: decision.ai_recommendation?.confidence,
          decided_at: new Date().toISOString()
        });

        res.json({ success: true, decision });
      } catch (error) {
        this.logger.error({ error }, 'Failed to record decision');
        res.status(500).json({ error: 'Failed to record decision' });
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
        analyzer: { status: 'up' },
      },
    };
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = express();
  const service = new DecisionsService();

  service.start(app).catch((error) => {
    console.error('Failed to start decisions service:', error);
    process.exit(1);
  });
}

export { DecisionsService, DecisionAnalyzer };
