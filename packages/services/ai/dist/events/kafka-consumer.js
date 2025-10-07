/**
 * Kafka Event Consumer
 * Listens to message.* events and processes them with AI
 */
import { Kafka } from 'kafkajs';
import { createLogger } from '@tide/logger';
import { kafkaConfig } from '@tide/config';
import { AIOrchestrator } from '../orchestration/ai-orchestrator';
const logger = createLogger({ component: 'KafkaConsumer' });
export class AIKafkaConsumer {
    constructor() {
        this.isRunning = false;
        this.kafka = new Kafka({
            clientId: 'ai-service',
            brokers: kafkaConfig.brokers,
        });
        this.consumer = this.kafka.consumer({
            groupId: 'ai-service-group',
        });
        this.orchestrator = new AIOrchestrator();
    }
    /**
     * Start consuming events
     */
    async start() {
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
        }
        catch (error) {
            logger.error('Failed to start Kafka consumer', { error });
            throw error;
        }
    }
    /**
     * Stop consuming events
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        try {
            await this.consumer.disconnect();
            this.isRunning = false;
            logger.info('Kafka consumer stopped');
        }
        catch (error) {
            logger.error('Failed to stop Kafka consumer', { error });
            throw error;
        }
    }
    /**
     * Handle individual message
     */
    async handleMessage(payload) {
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
            // Process with AI orchestrator
            const response = await this.orchestrator.process(aiRequest);
            // Publish AI response
            await this.publishResponse(response);
            logger.info('Event processed successfully', {
                topic,
                eventId: event.id,
                intents: response.intents?.map((i) => i.category) || [],
            });
        }
        catch (error) {
            logger.error('Failed to process message', { error, topic, partition });
        }
    }
    /**
     * Convert Kafka event to AI request
     */
    eventToAIRequest(event) {
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
    async publishResponse(response) {
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
        }
        catch (error) {
            logger.error('Failed to publish response', { error });
        }
    }
}
//# sourceMappingURL=kafka-consumer.js.map