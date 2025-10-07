"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaEventBus = void 0;
const kafkajs_1 = require("kafkajs");
const logger_1 = require("@tide/logger");
/**
 * Kafka Event Bus
 *
 * Handles event publishing and subscription using Kafka
 */
class KafkaEventBus {
    constructor(config) {
        this.config = config;
        this.handlers = new Map();
        this.kafka = new kafkajs_1.Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: config.groupId });
    }
    /**
     * Connect to Kafka
     */
    async connect() {
        try {
            await this.producer.connect();
            await this.consumer.connect();
            logger_1.logger.info('Kafka event bus connected');
            // Subscribe to workflow events
            await this.subscribeToTopics();
            // Start consuming messages
            await this.consumer.run({
                eachMessage: async (payload) => {
                    await this.handleMessage(payload);
                },
            });
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to connect to Kafka');
            throw error;
        }
    }
    /**
     * Disconnect from Kafka
     */
    async disconnect() {
        try {
            await this.producer.disconnect();
            await this.consumer.disconnect();
            logger_1.logger.info('Kafka event bus disconnected');
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Error disconnecting from Kafka');
        }
    }
    /**
     * Publish event
     */
    async publish(topic, data) {
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
            logger_1.logger.debug({ topic, dataId: data.id }, 'Event published');
        }
        catch (error) {
            logger_1.logger.error({ error, topic }, 'Failed to publish event');
            throw error;
        }
    }
    /**
     * Subscribe to topic
     */
    async subscribe(topic, handler) {
        if (!this.handlers.has(topic)) {
            this.handlers.set(topic, []);
        }
        this.handlers.get(topic).push(handler);
        logger_1.logger.info({ topic }, 'Subscribed to topic');
    }
    /**
     * Subscribe to workflow topics
     */
    async subscribeToTopics() {
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
        logger_1.logger.info({ topicCount: topics.length }, 'Subscribed to Kafka topics');
    }
    /**
     * Handle incoming message
     */
    async handleMessage(payload) {
        const { topic, message } = payload;
        try {
            if (!message.value) {
                logger_1.logger.warn({ topic }, 'Received empty message');
                return;
            }
            const data = JSON.parse(message.value.toString());
            logger_1.logger.debug({ topic, key: message.key?.toString() }, 'Message received');
            // Call registered handlers
            const handlers = this.handlers.get(topic) || [];
            for (const handler of handlers) {
                try {
                    await handler(data);
                }
                catch (error) {
                    logger_1.logger.error({ error, topic, handler: handler.name }, 'Handler error');
                }
            }
        }
        catch (error) {
            logger_1.logger.error({ error, topic }, 'Failed to handle message');
        }
    }
    /**
     * Batch publish events
     */
    async publishBatch(topic, events) {
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
            logger_1.logger.debug({ topic, count: events.length }, 'Batch events published');
        }
        catch (error) {
            logger_1.logger.error({ error, topic }, 'Failed to publish batch events');
            throw error;
        }
    }
}
exports.KafkaEventBus = KafkaEventBus;
//# sourceMappingURL=kafka-event-bus.js.map