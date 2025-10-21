/**
 * Tide AI Service Entry Point
 * GPT-5 Powered AI Orchestrator
 */

import express from 'express';
import { createLogger } from '@tide/logger';
import { TideAIServer } from './server-gpt5.js';
import { AIKafkaConsumer } from './events/kafka-consumer.js';

const logger = createLogger({ component: 'TideAIService' });

// Export GPT-5 components
export { TideAIServer } from './server-gpt5.js';
export { GPT5Orchestrator } from './orchestration/gpt5-orchestrator.js';
export { initializeTools, toolRegistry } from './tools/index.js';
export type { TideTool, ToolContext } from './tools/types.js';

/**
 * Start the AI service
 */
async function main(): Promise<void> {
  logger.info('Starting Tide AI Service...', {
    orchestrator: 'gpt-5',
    version: '2.0.0',
  });

  try {
    const app = express();

    // Initialize GPT-5 server
    const server = new TideAIServer({
      port: parseInt(process.env.PORT || process.env.AI_SERVICE_PORT || '3001', 10),
      openaiApiKey: process.env.OPENAI_API_KEY,
      model: process.env.GPT5_MODEL,
      includeIntelligenceTools: process.env.DISABLE_INTELLIGENCE_TOOLS !== 'true',
      includeCustomTools: process.env.ENABLE_CUSTOM_TOOLS === 'true',
    });

    // Start server (ServiceBase handles graceful shutdown automatically)
    await server.start(app);

    // Start Kafka consumer (optional - disabled by default for MVP)
    const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';

    if (kafkaEnabled) {
      logger.info('Kafka enabled - starting consumer...');
      const consumer = new AIKafkaConsumer();
      await consumer.start();

      // Register Kafka consumer cleanup
      const shutdown = async () => {
        try {
          await consumer.stop();
        } catch (error) {
          logger.error({ error }, 'Failed to stop Kafka consumer');
        }
      };

      // Register additional shutdown handler for Kafka
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    } else {
      logger.info('Kafka disabled - running in HTTP-only mode');
    }

    logger.info('Tide AI Service started successfully 🚀');

  } catch (error) {
    logger.error('Failed to start Tide AI Service', { error });
    process.exit(1);
  }
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.fatal({ error, stack: error.stack }, 'FATAL ERROR during startup');
    process.exit(1);
  });
}
