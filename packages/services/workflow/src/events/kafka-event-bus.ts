import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { logger } from '@tide/logger';

/**
 * Kafka Event Bus
 *
 * Handles event publishing and subscription using Kafka
 */
export class KafkaEventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private handlers = new Map<string, EventHandler[]>();

  constructor(private config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
  }

  /**
   * Connect to Kafka
   */
  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      logger.info('Kafka event bus connected');

      // Subscribe to workflow events
      await this.subscribeToTopics();

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Kafka');
      throw error;
    }
  }

  /**
   * Disconnect from Kafka
   */
  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      logger.info('Kafka event bus disconnected');
    } catch (error) {
      logger.error({ error }, 'Error disconnecting from Kafka');
    }
  }

  /**
   * Publish event
   */
  async publish(topic: string, data: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: data.id || `${Date.now()}`,
            value: JSON.stringify(data),
            timestamp: Date.now().toString(),
          },
        ],
      });

      logger.debug({ topic, dataId: data.id }, 'Event published');
    } catch (error) {
      logger.error({ error, topic }, 'Failed to publish event');
      throw error;
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }

    this.handlers.get(topic)!.push(handler);
    logger.info({ topic }, 'Subscribed to topic');
  }

  /**
   * Subscribe to workflow topics
   */
  private async subscribeToTopics(): Promise<void> {
    const topics = [
      'workflow.created',
      'workflow.executed',
      'workflow.completed',
      'workflow.failed',
      'task.created',
      'task.completed',
      'task.failed',
      'pattern.detected',
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    logger.info({ topicCount: topics.length }, 'Subscribed to Kafka topics');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, message } = payload;

    try {
      if (!message.value) {
        logger.warn({ topic }, 'Received empty message');
        return;
      }

      const data = JSON.parse(message.value.toString());

      logger.debug({ topic, key: message.key?.toString() }, 'Message received');

      // Call registered handlers
      const handlers = this.handlers.get(topic) || [];
      for (const handler of handlers) {
        try {
          await handler(data);
        } catch (error) {
          logger.error(
            { error, topic, handler: handler.name },
            'Handler error'
          );
        }
      }
    } catch (error) {
      logger.error({ error, topic }, 'Failed to handle message');
    }
  }

  /**
   * Batch publish events
   */
  async publishBatch(topic: string, events: any[]): Promise<void> {
    try {
      const messages = events.map(event => ({
        key: event.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
      }));

      await this.producer.send({
        topic,
        messages,
      });

      logger.debug({ topic, count: events.length }, 'Batch events published');
    } catch (error) {
      logger.error({ error, topic }, 'Failed to publish batch events');
      throw error;
    }
  }
}

// Types
export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
}

export type EventHandler = (data: any) => Promise<void>;
