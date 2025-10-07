/**
 * AI Service Entry Point
 * Starts HTTP server and Kafka consumer
 */

import { createLogger } from '@tide/logger';
import { AIServer } from './server.js';
import { AIKafkaConsumer } from './events/kafka-consumer.js';

const logger = createLogger({ component: 'AIService' });

// Export main components
export { AIOrchestrator } from './orchestration/ai-orchestrator.js';
export { MultiModelRouter } from './models/multi-model-router.js';
export { SwarmCoordinator } from './agents/swarm-coordinator.js';
export { IntentDetector } from './intelligence/intent-detector.js';

/**
 * Start the AI service
 */
async function main() {
  logger.info('Starting AI Service...');

  try {
    // Start HTTP server
    const port = parseInt(process.env.AI_SERVICE_PORT || '3003', 10);
    const server = new AIServer(port);
    await server.start();

    // Start Kafka consumer
    const consumer = new AIKafkaConsumer();
    await consumer.start();

    logger.info('AI Service started successfully');

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down AI Service...');

      await consumer.stop();
      await server.stop();

      logger.info('AI Service stopped');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start AI Service', { error });
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  main();
}
