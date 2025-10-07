"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.workflowEngine = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pg_1 = require("pg");
const logger_1 = require("@tide/logger");
const config_1 = require("@tide/config");
const engine_1 = require("./engine");
const kafka_event_bus_1 = require("./events/kafka-event-bus");
/**
 * Workflow Service
 *
 * Main entry point for the workflow automation service
 */
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
    logger_1.logger.info({ method: req.method, path: req.path }, 'Incoming request');
    next();
});
// Database connection
const pool = new pg_1.Pool({
    connectionString: config_1.databaseConfig.url,
    ssl: config_1.databaseConfig.ssl ? { rejectUnauthorized: false } : false,
    max: config_1.databaseConfig.pool.max,
    idleTimeoutMillis: config_1.databaseConfig.pool.idleTimeoutMillis,
    connectionTimeoutMillis: config_1.databaseConfig.pool.connectionTimeoutMillis,
});
// Initialize workflow engine
const workflowEngine = new engine_1.WorkflowEngine(pool);
exports.workflowEngine = workflowEngine;
// Initialize Kafka event bus
const eventBus = new kafka_event_bus_1.KafkaEventBus({
    brokers: config_1.kafkaConfig.brokers,
    clientId: 'workflow-service',
    groupId: 'workflow-service-group',
});
exports.eventBus = eventBus;
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const health = await workflowEngine.healthCheck();
        res.status(health.status === 'healthy' ? 200 : 503).json(health);
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Health check failed');
        res.status(503).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Workflow endpoints
app.post('/workflows', async (req, res) => {
    try {
        const workflow = req.body;
        const repository = workflowEngine.getWorkflowRepository();
        await repository.saveWorkflow(workflow);
        // Publish event
        await eventBus.publish('workflow.created', workflow);
        res.status(201).json({ success: true, workflowId: workflow.id });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to create workflow');
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.get('/workflows/:id', async (req, res) => {
    try {
        const repository = workflowEngine.getWorkflowRepository();
        const workflow = await repository.getWorkflow(req.params.id);
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        res.json(workflow);
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to get workflow');
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.post('/workflows/:id/execute', async (req, res) => {
    try {
        const repository = workflowEngine.getWorkflowRepository();
        const workflow = await repository.getWorkflow(req.params.id);
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        const context = req.body.context || {};
        const result = await workflowEngine.executeWorkflowStateMachine(workflow, context);
        // Publish event
        await eventBus.publish('workflow.executed', {
            workflowId: workflow.id,
            executionId: result.id,
            status: result.status,
        });
        res.json({
            success: result.status === 'completed',
            executionId: result.id,
            status: result.status,
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to execute workflow');
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Task endpoints
app.post('/tasks', async (req, res) => {
    try {
        const taskEngine = workflowEngine.getTaskEngine();
        const task = await taskEngine.createTask(req.body);
        // Publish event
        await eventBus.publish('task.created', task);
        res.status(201).json(task);
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to create task');
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.get('/tasks/ready', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const tasks = await workflowEngine.getReadyTasks(userId);
        res.json(tasks);
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to get ready tasks');
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Pattern endpoints
app.get('/patterns/detect', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const days = parseInt(req.query.days) || 30;
        const patterns = await workflowEngine.detectUserPatterns(userId, days);
        res.json(patterns);
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to detect patterns');
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error({ err, path: req.path }, 'Unhandled error');
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});
// Start server
const PORT = parseInt(process.env.PORT || '3004', 10);
async function start() {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        logger_1.logger.info('Database connected');
        // Connect to Kafka
        await eventBus.connect();
        logger_1.logger.info('Kafka connected');
        // Start server
        app.listen(PORT, () => {
            logger_1.logger.info({ port: PORT }, 'Workflow service started');
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to start service');
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await pool.end();
    await eventBus.disconnect();
    process.exit(0);
});
// Start the service
start();
//# sourceMappingURL=index.js.map