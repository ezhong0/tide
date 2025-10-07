import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@tide/logger';
import { kafkaConfig } from '@tide/config';
import { createSupabase } from '@tide/database';
import { KafkaEventBus } from './events/kafka-event-bus.js';
/**
 * Workflow Service
 *
 * Status: Not started (planned for Weeks 9-12)
 * This service is scaffolded but not yet operational.
 *
 * Uses Supabase-first architecture (ADR-001)
 */
const app = express();
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
    logger.info({ method: req.method, path: req.path }, 'Incoming request');
    next();
});
// Database connection - Supabase client
const supabase = createSupabase(true);
// Initialize workflow engine
// Note: WorkflowEngine needs to be updated to use Supabase client instead of Pool
const workflowEngine = null; // TODO: Update WorkflowEngine to use Supabase client
// Initialize Kafka event bus (only if Kafka is configured AND enabled)
const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
const eventBus = kafkaConfig && kafkaEnabled
    ? new KafkaEventBus({
        brokers: kafkaConfig.brokers,
        clientId: 'workflow-service',
        groupId: 'workflow-service-group',
    })
    : null;
// Health check endpoint
app.get('/health', async (req, res) => {
    if (!workflowEngine) {
        return res.status(503).json({
            status: 'not_ready',
            message: 'Workflow service not configured (Week 9-12)',
        });
    }
    res.status(503).json({
        status: 'not_ready',
        message: 'Workflow service not configured (Week 9-12)',
    });
});
// Workflow endpoints
app.post('/workflows', async (req, res) => {
    res.status(503).json({ error: 'Service not ready (Week 9-12)' });
});
// Middleware to check if service is ready
const requireReady = (req, res, next) => {
    if (!workflowEngine) {
        return res.status(503).json({ error: 'Service not ready (Week 9-12)' });
    }
    next();
};
app.get('/workflows/:id', requireReady, async (req, res) => {
    res.status(503).json({ error: 'Service not ready (Week 9-12)' });
});
app.post('/workflows/:id/execute', requireReady, async (req, res) => {
    res.status(503).json({ error: 'Service not ready (Week 9-12)' });
});
// Task endpoints
app.post('/tasks', requireReady, async (req, res) => {
    res.status(503).json({ error: 'Service not ready (Week 9-12)' });
});
app.get('/tasks/ready', requireReady, async (req, res) => {
    res.status(503).json({ error: 'Service not ready (Week 9-12)' });
});
// Pattern endpoints
app.get('/patterns/detect', requireReady, async (req, res) => {
    res.status(503).json({ error: 'Service not ready (Week 9-12)' });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
        // Test Supabase connection
        try {
            const { error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
            if (error)
                throw error;
            logger.info('Supabase connected');
        }
        catch (error) {
            logger.warn({ error }, 'Supabase connection check failed - service not ready (Week 9-12)');
        }
        // Connect to Kafka (if configured and enabled)
        if (eventBus) {
            await eventBus.connect();
            logger.info('Kafka connected');
        }
        else if (!kafkaEnabled) {
            logger.info('Kafka disabled - event publishing disabled');
        }
        else {
            logger.warn('No KAFKA_BROKERS configured - event publishing disabled');
        }
        // Start server
        app.listen(PORT, () => {
            logger.info({ port: PORT, ready: !!workflowEngine }, 'Workflow service started');
        });
    }
    catch (error) {
        logger.error({ error }, 'Failed to start service');
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    if (eventBus)
        await eventBus.disconnect();
    process.exit(0);
});
// Start the service
start();
export { app, workflowEngine, eventBus };
//# sourceMappingURL=index.js.map