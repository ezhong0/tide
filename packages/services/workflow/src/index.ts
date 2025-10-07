import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@tide/logger';
import { supabaseConfig, databaseConfig, kafkaConfig } from '@tide/config';
import { WorkflowEngine } from './engine';
import { KafkaEventBus } from './events/kafka-event-bus';

/**
 * Workflow Service
 *
 * Status: Not started (planned for Weeks 9-12)
 * This service is scaffolded but not yet operational.
 */

const app: express.Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// Database connection - use Supabase or direct PostgreSQL
const pool = databaseConfig
  ? new Pool({
      connectionString: databaseConfig.url,
      ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : false,
      max: databaseConfig.pool.max,
      idleTimeoutMillis: databaseConfig.pool.idleTimeoutMillis,
      connectionTimeoutMillis: databaseConfig.pool.connectionTimeoutMillis,
    })
  : null;

// If no direct DB connection, use Supabase
const supabase = !pool ? createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey) : null;

// Initialize workflow engine (only if database is configured)
const workflowEngine = pool ? new WorkflowEngine(pool) : null;

// Initialize Kafka event bus (only if Kafka is configured)
const eventBus = kafkaConfig
  ? new KafkaEventBus({
      brokers: kafkaConfig.brokers,
      clientId: 'workflow-service',
      groupId: 'workflow-service-group',
    })
  : null;

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (!workflowEngine) {
      return res.status(503).json({
        status: 'not_ready',
        message: 'Workflow service not configured (Week 9-12)',
      });
    }
    const health = await workflowEngine.healthCheck();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Workflow endpoints
app.post('/workflows', async (req, res) => {
  if (!workflowEngine) {
    return res.status(503).json({ error: 'Service not ready (Week 9-12)' });
  }
  try {
    const workflow = req.body;
    const repository = workflowEngine.getWorkflowRepository();
    await repository.saveWorkflow(workflow);

    // Publish event (if Kafka configured)
    if (eventBus) {
      await eventBus.publish('workflow.created', workflow);
    }

    res.status(201).json({ success: true, workflowId: workflow.id });
  } catch (error) {
    logger.error({ error }, 'Failed to create workflow');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Middleware to check if service is ready
const requireReady = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!workflowEngine) {
    return res.status(503).json({ error: 'Service not ready (Week 9-12)' });
  }
  next();
};

app.get('/workflows/:id', requireReady, async (req, res) => {
  try {
    const repository = workflowEngine!.getWorkflowRepository();
    const workflow = await repository.getWorkflow(req.params.id as any);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    logger.error({ error }, 'Failed to get workflow');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/workflows/:id/execute', requireReady, async (req, res) => {
  try {
    const repository = workflowEngine!.getWorkflowRepository();
    const workflow = await repository.getWorkflow(req.params.id as any);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const context = req.body.context || {};
    const result = await workflowEngine!.executeWorkflowStateMachine(workflow, context);

    // Publish event (if Kafka configured)
    if (eventBus) {
      await eventBus.publish('workflow.executed', {
        workflowId: workflow.id,
        executionId: result.id,
        status: result.status,
      });
    }

    res.json({
      success: result.status === 'completed',
      executionId: result.id,
      status: result.status,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to execute workflow');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Task endpoints
app.post('/tasks', requireReady, async (req, res) => {
  try {
    const taskEngine = workflowEngine!.getTaskEngine();
    const task = await taskEngine.createTask(req.body);

    // Publish event (if Kafka configured)
    if (eventBus) {
      await eventBus.publish('task.created', task);
    }

    res.status(201).json(task);
  } catch (error) {
    logger.error({ error }, 'Failed to create task');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/tasks/ready', requireReady, async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const tasks = await workflowEngine!.getReadyTasks(userId as any);
    res.json(tasks);
  } catch (error) {
    logger.error({ error }, 'Failed to get ready tasks');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Pattern endpoints
app.get('/patterns/detect', requireReady, async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const patterns = await workflowEngine!.detectUserPatterns(userId as any, days);

    res.json(patterns);
  } catch (error) {
    logger.error({ error }, 'Failed to detect patterns');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, path: req.path }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const PORT = parseInt(process.env.PORT || '3004', 10);

async function start() {
  try {
    // Test database connection (if configured)
    if (pool) {
      await pool.query('SELECT 1');
      logger.info('Database connected');
    } else {
      logger.warn('No DATABASE_URL configured - service not ready (Week 9-12)');
    }

    // Connect to Kafka (if configured)
    if (eventBus) {
      await eventBus.connect();
      logger.info('Kafka connected');
    } else {
      logger.warn('No KAFKA_BROKERS configured - event publishing disabled');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info({ port: PORT, ready: !!workflowEngine }, 'Workflow service started');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start service');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (pool) await pool.end();
  if (eventBus) await eventBus.disconnect();
  process.exit(0);
});

// Start the service
start();

export { app, workflowEngine, eventBus };
