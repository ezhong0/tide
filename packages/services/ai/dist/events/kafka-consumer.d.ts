/**
 * Kafka Event Consumer
 * Listens to message.* events and processes them with AI
 */
export declare class AIKafkaConsumer {
    private kafka;
    private consumer;
    private orchestrator;
    private isRunning;
    constructor();
    /**
     * Start consuming events
     */
    start(): Promise<void>;
    /**
     * Stop consuming events
     */
    stop(): Promise<void>;
    /**
     * Handle individual message
     */
    private handleMessage;
    /**
     * Convert Kafka event to AI request
     */
    private eventToAIRequest;
    /**
     * Publish AI response to Kafka
     */
    private publishResponse;
}
//# sourceMappingURL=kafka-consumer.d.ts.map