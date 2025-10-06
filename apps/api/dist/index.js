import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeSentry } from './config/monitoring.js';
/**
 * Start the server
 */
async function start() {
    try {
        // Initialize monitoring
        initializeSentry();
        // Create app
        const app = await createApp();
        // Start listening
        await app.listen({
            port: env.PORT,
            host: '0.0.0.0',
        });
        logger.info({
            port: env.PORT,
            environment: env.NODE_ENV,
            nodeVersion: process.version,
        }, 'Server started successfully');
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger.info({ signal }, 'Received shutdown signal');
            try {
                await app.close();
                logger.info('Server closed gracefully');
                process.exit(0);
            }
            catch (error) {
                logger.error({ err: error }, 'Error during shutdown');
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
}
// Start the server
start();
//# sourceMappingURL=index.js.map