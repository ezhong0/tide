/**
 * Kafka Event Consumer
 * Listens to message.* events and processes them with AI
 *
 * Status: Not yet integrated (planned for Week 4-5)
 */

import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { createLogger } from '@tide/logger';
import { kafkaConfig } from '@tide/config';
import type { AIRequest } from '@tide/contracts';
import { GPT5Orchestrator } from '../orchestration/gpt5-orchestrator.js';
import type { ToolContext } from '../tools/types.js';

const logger = createLogger({ component: 'KafkaConsumer' });

export class AIKafkaConsumer {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private orchestrator: GPT5Orchestrator;
  private isRunning = false;

  constructor() {
    // Only initialize Kafka if configured
    if (kafkaConfig) {
      this.kafka = new Kafka({
        clientId: 'ai-service',
        brokers: kafkaConfig.brokers,
      });

      this.consumer = this.kafka.consumer({
        groupId: 'ai-service-group',
      });
    } else {
      logger.warn('Kafka not configured - event processing disabled');
    }

    // Initialize GPT-5 orchestrator
    this.orchestrator = new GPT5Orchestrator({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.GPT5_MODEL || 'gpt-5-mini',
    });
  }

  /**
   * Start consuming events
   */
  async start(): Promise<void> {
    if (!this.consumer) {
      logger.info('Kafka not configured - skipping consumer start');
      return;
    }

    if (this.isRunning) {
      logger.warn('Consumer already running');
      return;
    }

    try {
      await this.consumer.connect();
      logger.info('Kafka consumer connected');

      // Subscribe to message events
      await this.consumer.subscribe({
        topics: ['message.created', 'message.received'],
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: this.handleMessage.bind(this),
      });

      this.isRunning = true;
      logger.info('Kafka consumer started');
    } catch (error) {
      logger.error('Failed to start Kafka consumer', { error });
      throw error;
    }
  }

  /**
   * Stop consuming events
   */
  async stop(): Promise<void> {
    if (!this.consumer || !this.isRunning) {
      return;
    }

    try {
      await this.consumer.disconnect();
      this.isRunning = false;
      logger.info('Kafka consumer stopped');
    } catch (error) {
      logger.error('Failed to stop Kafka consumer', { error });
      throw error;
    }
  }

  /**
   * Handle individual message
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    try {
      const value = message.value?.toString();
      if (!value) {
        logger.warn('Empty message received', { topic, partition });
        return;
      }

      const event = JSON.parse(value);
      logger.debug('Processing event', { topic, eventId: event.id });

      // Convert event to AI request
      const aiRequest = this.eventToAIRequest(event);

      // Build tool context
      const context: ToolContext = {
        userId: aiRequest.userId,
        requestId: `kafka-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userEmail: aiRequest.context?.userEmail,
        timestamp: Date.now(),
      };

      // Process with GPT-5 orchestrator
      const response = await this.orchestrator.process(aiRequest, context);

      // Publish AI response
      await this.publishResponse(response);

      logger.info('Event processed successfully', {
        topic,
        eventId: event.id,
        intents: (response as any).intents?.map((i: any) => i.category) || [],
      });
    } catch (error) {
      logger.error('Failed to process message', { error, topic, partition });
    }
  }

  /**
   * Convert Kafka event to AI request
   */
  private eventToAIRequest(event: any): AIRequest {
    return {
      userId: event.userId,
      conversationId: event.conversationId,
      messageId: event.id,
      content: event.content || event.message || '',
      context: {
        currentTime: Date.now(),
        timezone: 'UTC',
        previousMessages: event.previousMessages || [],
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Publish AI response to Kafka
   */
  private async publishResponse(response: any): Promise<void> {
    if (!this.kafka) {
      logger.debug('Kafka not configured - skipping response publish');
      return;
    }

    const producer = this.kafka.producer();

    try {
      await producer.connect();

      await producer.send({
        topic: 'ai.response',
        messages: [
          {
            key: response.requestId,
            value: JSON.stringify(response),
          },
        ],
      });

      await producer.disconnect();
      logger.debug('Response published', { requestId: response.requestId });
    } catch (error) {
      logger.error('Failed to publish response', { error });
    }
  }
}
