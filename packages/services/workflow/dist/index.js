import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@tide/logger';
import { kafkaConfig } from '@tide/config';
import { createSupabase } from '@tide/database';
import { authenticateJWT, moderateRateLimit, errorHandler, notFoundHandler, } from '@tide/middleware';
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
// Rate limiting (100 req/min)
app.use(moderateRateLimit);
// Request logging
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
    }, 'Incoming request');
    next();
});
// Database connection - Supabase client
const supabase = createSupabase(true);
// Initialize Supabase repositories
import { SupabaseTaskRepository, SupabaseWorkflowRepository, SupabasePatternRepository } from './supabase-adapter.js';
import { TaskEngine, TaskPrioritizer, TaskDecomposer } from './tasks/task-engine.js';
import { PatternDetector, BehaviorAnalyzer } from './patterns/pattern-detector.js';
const taskRepository = new SupabaseTaskRepository(supabase);
const workflowRepository = new SupabaseWorkflowRepository(supabase);
const patternRepository = new SupabasePatternRepository(supabase);
// Initialize workflow engine components
const prioritizer = new TaskPrioritizer();
const decomposer = new TaskDecomposer();
const taskEngine = new TaskEngine(taskRepository, prioritizer, decomposer);
const behaviorAnalyzer = new BehaviorAnalyzer();
const patternDetector = new PatternDetector(patternRepository, behaviorAnalyzer);
logger.info('Workflow engine initialized with Supabase');
// Initialize Kafka event bus (only if Kafka is configured AND enabled)
const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
const eventBus = kafkaConfig && kafkaEnabled
    ? new KafkaEventBus({
        brokers: kafkaConfig.brokers,
        clientId: 'workflow-service',
        groupId: 'workflow-service-group',
    })
    : null;
// Use centralized JWT authentication middleware from shared/middleware/auth.js
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: {
                database: error ? 'down' : 'up',
                workflow: 'up',
                tasks: 'up',
                patterns: 'up',
            },
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'Health check failed',
        });
    }
});
// ============================================================================
// Task Endpoints
// ============================================================================
// Create task
app.post('/tasks', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        const { title, description, dueDate, tags, priority, project } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const task = await taskEngine.createTask({
            userId: user.id,
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            tags,
            project,
        });
        res.status(201).json(task);
    }
    catch (error) {
        logger.error({ error }, 'Failed to create task');
        res.status(500).json({ error: 'Failed to create task' });
    }
});
// Get ready tasks
app.get('/tasks/ready', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        const tasks = await taskEngine.getReadyTasks(user.id);
        res.json(tasks);
    }
    catch (error) {
        logger.error({ error }, 'Failed to get ready tasks');
        res.status(500).json({ error: 'Failed to get ready tasks' });
    }
});
// Get task by ID
app.get('/tasks/:id', authenticateJWT, async (req, res) => {
    try {
        const task = await taskRepository.getTask(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Verify ownership
        const user = req.user;
        if (task.userId !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(task);
    }
    catch (error) {
        logger.error({ error }, 'Failed to get task');
        res.status(500).json({ error: 'Failed to get task' });
    }
});
// Update task
app.put('/tasks/:id', authenticateJWT, async (req, res) => {
    try {
        const task = await taskRepository.getTask(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Verify ownership
        const user = req.user;
        if (task.userId !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Update task
        const updates = { ...task, ...req.body };
        await taskRepository.updateTask(updates);
        const updated = await taskRepository.getTask(req.params.id);
        res.json(updated);
    }
    catch (error) {
        logger.error({ error }, 'Failed to update task');
        res.status(500).json({ error: 'Failed to update task' });
    }
});
// Delete task
app.delete('/tasks/:id', authenticateJWT, async (req, res) => {
    try {
        const task = await taskRepository.getTask(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Verify ownership
        const user = req.user;
        if (task.userId !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await taskRepository.deleteTask(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        logger.error({ error }, 'Failed to delete task');
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
// ============================================================================
// Workflow Endpoints
// ============================================================================
// Create workflow
app.post('/workflows', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        const { name, description, steps } = req.body;
        if (!name || !steps || !Array.isArray(steps)) {
            return res.status(400).json({ error: 'Name and steps are required' });
        }
        const workflow = {
            id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            steps,
            version: 1,
            createdBy: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await workflowRepository.saveWorkflow(workflow);
        res.status(201).json(workflow);
    }
    catch (error) {
        logger.error({ error }, 'Failed to create workflow');
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});
// Get workflow
app.get('/workflows/:id', authenticateJWT, async (req, res) => {
    try {
        const workflow = await workflowRepository.getWorkflow(req.params.id);
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        // Verify ownership
        const user = req.user;
        if (workflow.createdBy !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(workflow);
    }
    catch (error) {
        logger.error({ error }, 'Failed to get workflow');
        res.status(500).json({ error: 'Failed to get workflow' });
    }
});
// Execute workflow
app.post('/workflows/:id/execute', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        const workflow = await workflowRepository.getWorkflow(req.params.id);
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        if (workflow.createdBy !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Create execution record
        const execution = await workflowRepository.createExecution({
            workflow_id: req.params.id,
            user_id: user.id,
            status: 'running',
            context: req.body.context || {},
        });
        // In a real implementation, this would execute the workflow steps
        // For now, mark as completed
        await workflowRepository.updateExecution(execution.id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
        });
        res.json(execution);
    }
    catch (error) {
        logger.error({ error }, 'Failed to execute workflow');
        res.status(500).json({ error: 'Failed to execute workflow' });
    }
});
// ============================================================================
// Pattern Detection Endpoints
// ============================================================================
// Detect patterns
app.get('/patterns/detect', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        const days = parseInt(req.query.days) || 30;
        const patterns = await patternDetector.detectPatterns(user.id, days);
        res.json(patterns);
    }
    catch (error) {
        logger.error({ error }, 'Failed to detect patterns');
        res.status(500).json({ error: 'Failed to detect patterns' });
    }
});
// 404 handler - must be before error handler
app.use(notFoundHandler);
// Error handler - must be last
app.use(errorHandler);
// Start server
const PORT = parseInt(process.env.PORT || '3005', 10);
async function start() {
    try {
        // Test Supabase connection
        try {
            const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
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
            logger.info({ port: PORT, ready: true }, 'Workflow service started');
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
export { app, eventBus, taskEngine, patternDetector, workflowRepository, taskRepository, patternRepository, };
//# sourceMappingURL=index.js.map