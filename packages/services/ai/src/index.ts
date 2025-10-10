/**
 * Tide AI Service Entry Point
 * GPT-5 Powered AI Orchestrator
 * Build: 2025-10-09T19:01:00Z
 */

import { createLogger } from '@tide/logger';
import { TideAIServer } from './server-gpt5.js';
import { AIServer } from './server.js';
import { AIKafkaConsumer } from './events/kafka-consumer.js';

const logger = createLogger({ component: 'TideAIService' });

// Export new GPT-5 components (primary)
export { TideAIServer } from './server-gpt5.js';
export { GPT5Orchestrator } from './orchestration/gpt5-orchestrator.js';
export { initializeTools, toolRegistry } from './tools/index.js';
export type { TideTool, ToolContext } from './tools/types.js';

// Export legacy components (for backward compatibility)
export { AIOrchestrator } from './orchestration/ai-orchestrator.js';
export { MultiModelRouter } from './models/multi-model-router.js';
export { SwarmCoordinator } from './agents/swarm-coordinator.js';
export { IntentDetector } from './intelligence/intent-detector.js';
export { AIServer } from './server.js';

/**
 * Start the AI service
 */
async function main(): Promise<void> {
  // Choose orchestrator: GPT-5 (new) or Legacy (old agent swarm)
  const useLegacy = process.env.USE_LEGACY_ORCHESTRATOR === 'true';

  logger.info('Starting Tide AI Service...', {
    orchestrator: useLegacy ? 'legacy-swarm' : 'gpt-5',
    version: '2.0.0',
  });

  try {
    let server: TideAIServer | AIServer;

    if (useLegacy) {
      // Legacy mode: Use old agent swarm orchestrator
      logger.warn('Running in LEGACY mode - consider migrating to GPT-5 orchestrator');
      const port = parseInt(process.env.AI_SERVICE_PORT || '3001', 10);
      server = new AIServer(port);
    } else {
      // Production mode: Use GPT-5 orchestrator (recommended)
      server = new TideAIServer({
        port: parseInt(process.env.PORT || process.env.AI_SERVICE_PORT || '3001', 10),
        openaiApiKey: process.env.OPENAI_API_KEY,
        model: process.env.GPT5_MODEL,
        includeIntelligenceTools: process.env.DISABLE_INTELLIGENCE_TOOLS !== 'true',
        includeCustomTools: process.env.ENABLE_CUSTOM_TOOLS === 'true',
      });
    }

    await server.start();

    // Start Kafka consumer (optional - disabled by default for MVP)
    const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
    let consumer: AIKafkaConsumer | null = null;

    if (kafkaEnabled) {
      logger.info('Kafka enabled - starting consumer...');
      consumer = new AIKafkaConsumer();
      await consumer.start();
    } else {
      logger.info('Kafka disabled - running in HTTP-only mode');
    }

    logger.info('Tide AI Service started successfully 🚀');

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down Tide AI Service...');

      if (consumer) {
        await consumer.stop();
      }
      await server.stop();

      logger.info('Tide AI Service stopped');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
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
