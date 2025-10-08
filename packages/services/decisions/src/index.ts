import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import {
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import { DecisionAnalyzer } from './analyzer/decision-analyzer.js';
import type { Decision, DecisionInput, DecisionStatus } from './types/index.js';

const db = createSupabase(true);
const analyzer = new DecisionAnalyzer();

class DecisionsService {
  private app: express.Application;

  constructor() {
    this.app = express();
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

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'decisions' });
    });

    // Create decision
    this.app.post('/decisions', async (req, res) => {
      try {
        const input: DecisionInput & { userId: UserId } = req.body;

        const { data: decision, error } = await db
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
        const recommendation = await analyzer.analyzeDecision(decision as any);

        // Update with recommendation
        await db
          .from('decisions')
          .update({ ai_recommendation: recommendation })
          .eq('id', decision.id);

        res.json({ decision: { ...decision, aiRecommendation: recommendation } });
      } catch (error) {
        logger.error({ error }, 'Failed to create decision');
        res.status(500).json({ error: 'Failed to create decision' });
      }
    });

    // Get pending decisions
    this.app.get('/decisions/pending/:userId', async (req, res) => {
      try {
        const { userId } = req.params;

        const { data: decisions, error } = await db
          .from('decisions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('urgency', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ decisions: decisions || [], count: decisions?.length || 0 });
      } catch (error) {
        logger.error({ error }, 'Failed to get pending decisions');
        res.status(500).json({ error: 'Failed to get pending decisions' });
      }
    });

    // Make decision
    this.app.post('/decisions/:decisionId/decide', async (req, res) => {
      try {
        const { decisionId } = req.params;
        const { userId, chosenOption, reasoning, status } = req.body;

        const { data: decision, error: updateError } = await db
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
        await db.from('decision_history').insert({
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
        logger.error({ error }, 'Failed to record decision');
        res.status(500).json({ error: 'Failed to record decision' });
      }
    });

    // 404 handler - must be before error handler
    this.app.use(notFoundHandler);

    // Error handler - must be last
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    const port = process.env.DECISIONS_SERVICE_PORT || 3007;
    this.app.listen(port, () => {
      logger.info({ port, service: 'decisions' }, 'Decisions service started');
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new DecisionsService();
  service.start();
}

export { DecisionsService, DecisionAnalyzer };
