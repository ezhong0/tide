import { Kafka, Producer, Consumer, Admin, EachMessagePayload } from 'kafkajs';
import { DomainEvent, DomainEventType } from '@tide/types';
import { createLogger } from '@tide/utils';

const logger = createLogger('event-bus');

export interface EventBusConfig {
  brokers: string[];
  clientId: string;
  groupId?: string;
}

export interface EventHandler<T = unknown> {
  (event: DomainEvent & { payload: T }): Promise<void>;
}

export class EventBus {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private admin: Admin;
  private handlers: Map<DomainEventType, Set<EventHandler>> = new Map();
  private isConsuming = false;

  constructor(private config: EventBusConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
    this.admin = this.kafka.admin();
  }

  async connect(): Promise<void> {
    logger.info('Connecting to Kafka');

    // Initialize producer
    this.producer = this.kafka.producer({
      idempotent: true,
      maxInFlightRequests: 5,
      transactionalId: `${this.config.clientId}-producer`,
    });
    await this.producer.connect();

    // Initialize consumer if groupId is provided
    if (this.config.groupId) {
      this.consumer = this.kafka.consumer({
        groupId: this.config.groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });
      await this.consumer.connect();
    }

    // Create topics
    await this.ensureTopics();

    logger.info('Connected to Kafka');
  }

  async disconnect(): Promise<void> {
    logger.info('Disconnecting from Kafka');

    if (this.consumer) {
      await this.consumer.disconnect();
    }
    if (this.producer) {
      await this.producer.disconnect();
    }
    await this.admin.disconnect();

    logger.info('Disconnected from Kafka');
  }

  private async ensureTopics(): Promise<void> {
    await this.admin.connect();

    const topics = [
      'user-events',
      'conversation-events',
      'message-events',
      'email-events',
      'calendar-events',
      'task-events',
      'workflow-events',
    ];

    const existingTopics = await this.admin.listTopics();
    const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic));

    if (topicsToCreate.length > 0) {
      await this.admin.createTopics({
        topics: topicsToCreate.map(topic => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            { name: 'retention.ms', value: '604800000' }, // 7 days
            { name: 'compression.type', value: 'snappy' },
          ],
        })),
      });
      logger.info('Created topics', { topics: topicsToCreate });
    }

    await this.admin.disconnect();
  }

  private getTopicForEvent(eventType: DomainEventType): string {
    const prefix = eventType.split('.')[0];
    return `${prefix}-events`;
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not initialized. Call connect() first.');
    }

    const topic = this.getTopicForEvent(event.type);

    try {
      await this.producer.send({
        topic,
        messages: [{
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            'event-type': event.type,
            'event-id': event.id,
            'aggregate-id': event.aggregateId,
            'aggregate-type': event.aggregateType,
            'correlation-id': event.metadata.correlationId || '',
            'timestamp': String(event.metadata.timestamp),
          },
        }],
      });

      logger.debug('Published event', {
        eventId: event.id,
        eventType: event.type,
        topic,
      });
    } catch (error) {
      logger.error('Failed to publish event', error as Error, {
        eventId: event.id,
        eventType: event.type,
      });
      throw error;
    }
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not initialized. Call connect() first.');
    }

    const messagesByTopic = new Map<string, Array<{
      key: string;
      value: string;
      headers: Record<string, string>;
    }>>();

    for (const event of events) {
      const topic = this.getTopicForEvent(event.type);
      if (!messagesByTopic.has(topic)) {
        messagesByTopic.set(topic, []);
      }

      messagesByTopic.get(topic)!.push({
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.type,
          'event-id': event.id,
          'aggregate-id': event.aggregateId,
          'aggregate-type': event.aggregateType,
          'correlation-id': event.metadata.correlationId || '',
          'timestamp': String(event.metadata.timestamp),
        },
      });
    }

    try {
      await this.producer.sendBatch({
        topicMessages: Array.from(messagesByTopic.entries()).map(([topic, messages]) => ({
          topic,
          messages,
        })),
      });

      logger.debug('Published batch of events', { count: events.length });
    } catch (error) {
      logger.error('Failed to publish batch', error as Error, {
        count: events.length,
      });
      throw error;
    }
  }

  subscribe<T = unknown>(eventType: DomainEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    logger.debug('Subscribed to event', { eventType });
  }

  unsubscribe(eventType: DomainEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }

    logger.debug('Unsubscribed from event', { eventType });
  }

  async startConsuming(): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not initialized. Provide groupId in config.');
    }

    if (this.isConsuming) {
      logger.warn('Already consuming');
      return;
    }

    // Subscribe to all topics we have handlers for
    const topics = Array.from(new Set(
      Array.from(this.handlers.keys()).map(type => this.getTopicForEvent(type))
    ));

    await this.consumer.subscribe({
      topics,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });

    this.isConsuming = true;
    logger.info('Started consuming events', { topics });
  }

  async stopConsuming(): Promise<void> {
    if (!this.consumer || !this.isConsuming) {
      return;
    }

    await this.consumer.stop();
    this.isConsuming = false;
    logger.info('Stopped consuming events');
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    try {
      if (!message.value) {
        logger.warn('Received message without value', { topic, partition });
        return;
      }

      const event = JSON.parse(message.value.toString()) as DomainEvent;
      const eventType = message.headers?.['event-type']?.toString() as DomainEventType;

      logger.debug('Received event', {
        eventId: event.id,
        eventType,
        topic,
        partition,
      });

      const handlers = this.handlers.get(eventType);
      if (!handlers || handlers.size === 0) {
        logger.debug('No handlers for event type', { eventType });
        return;
      }

      // Execute all handlers concurrently
      await Promise.all(
        Array.from(handlers).map(async (handler) => {
          try {
            await handler(event);
          } catch (error) {
            logger.error('Handler failed', error as Error, {
              eventId: event.id,
              eventType,
            });
            // Don't throw - we don't want one failed handler to prevent others from running
          }
        })
      );
    } catch (error) {
      logger.error('Failed to handle message', error as Error, {
        topic,
        partition,
        offset: message.offset,
      });
      throw error;
    }
  }
}
