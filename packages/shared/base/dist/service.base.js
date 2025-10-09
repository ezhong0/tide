/**
 * Base Service Class
 * Provides common functionality for all microservices
 *
 * Features:
 * - Standardized initialization
 * - Graceful shutdown handling
 * - Health check endpoint
 * - Structured logging
 * - Resource lifecycle management
 */
import { createLogger } from '@tide/logger';
/**
 * Abstract base class for all services
 * Ensures consistent patterns across the platform
 */
export class ServiceBase {
    constructor(config) {
        this.resources = new Set();
        this.isShuttingDown = false;
        this.config = config;
        this.logger = createLogger({
            component: config.name,
            version: config.version
        });
    }
    /**
     * Perform health checks - override in subclass
     */
    async healthCheck() {
        return {};
    }
    /**
     * Register a resource for lifecycle management
     */
    registerResource(resource) {
        this.resources.add(resource);
    }
    /**
     * Start the service
     */
    async start(app) {
        if (this.isShuttingDown) {
            throw new Error('Cannot start service during shutdown');
        }
        try {
            this.logger.info('Initializing service...');
            await this.initialize();
            // Setup health check endpoint (common for all services)
            app.get('/health', async (req, res) => {
                try {
                    const customChecks = await this.healthCheck();
                    const health = {
                        status: 'healthy',
                        service: this.config.name,
                        version: this.config.version,
                        timestamp: new Date().toISOString(),
                        uptime: process.uptime(),
                        ...customChecks,
                    };
                    res.json(health);
                }
                catch (error) {
                    res.status(503).json({
                        status: 'unhealthy',
                        service: this.config.name,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            });
            // Setup service-specific routes
            this.setupRoutes(app);
            // Start HTTP server
            this.server = app.listen(this.config.port, () => {
                this.logger.info({
                    port: this.config.port,
                    service: this.config.name,
                    version: this.config.version,
                }, `${this.config.name} started successfully`);
            });
            // Setup graceful shutdown handlers
            this.setupShutdownHandlers();
        }
        catch (error) {
            this.logger.error({ error }, 'Failed to start service');
            throw error;
        }
    }
    /**
     * Stop the service gracefully
     */
    async stop() {
        if (this.isShuttingDown) {
            this.logger.warn('Shutdown already in progress');
            return;
        }
        this.isShuttingDown = true;
        const timeout = this.config.shutdownTimeout || 10000;
        this.logger.info('Initiating graceful shutdown...');
        try {
            // Close HTTP server first (stop accepting new requests)
            if (this.server) {
                await new Promise((resolve, reject) => {
                    this.server.close((err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
            }
            // Cleanup all registered resources
            const cleanupPromises = Array.from(this.resources).map(resource => resource.cleanup().catch(err => {
                this.logger.error({ error: err, resource: resource.name }, 'Failed to cleanup resource');
            }));
            await Promise.race([
                Promise.all(cleanupPromises),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout')), timeout)),
            ]);
            this.logger.info('Service stopped gracefully');
        }
        catch (error) {
            this.logger.error({ error }, 'Error during shutdown');
            throw error;
        }
    }
    /**
     * Setup signal handlers for graceful shutdown
     */
    setupShutdownHandlers() {
        const shutdown = async (signal) => {
            this.logger.info({ signal }, 'Shutdown signal received');
            try {
                await this.stop();
                process.exit(0);
            }
            catch (error) {
                this.logger.error({ error }, 'Shutdown failed');
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            this.logger.fatal({ error }, 'Uncaught exception');
            shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            this.logger.fatal({ reason }, 'Unhandled rejection');
            shutdown('unhandledRejection');
        });
    }
}
//# sourceMappingURL=service.base.js.map