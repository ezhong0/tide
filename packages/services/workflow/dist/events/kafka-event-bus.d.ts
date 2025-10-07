/**
 * Kafka Event Bus
 *
 * Handles event publishing and subscription using Kafka
 */
export declare class KafkaEventBus {
    private config;
    private kafka;
    private producer;
    private consumer;
    private handlers;
    constructor(config: KafkaConfig);
    /**
     * Connect to Kafka
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Kafka
     */
    disconnect(): Promise<void>;
    /**
     * Publish event
     */
    publish(topic: string, data: any): Promise<void>;
    /**
     * Subscribe to topic
     */
    subscribe(topic: string, handler: EventHandler): Promise<void>;
    /**
     * Subscribe to workflow topics
     */
    private subscribeToTopics;
    /**
     * Handle incoming message
     */
    private handleMessage;
    /**
     * Batch publish events
     */
    publishBatch(topic: string, events: any[]): Promise<void>;
}
export interface KafkaConfig {
    brokers: string[];
    clientId: string;
    groupId: string;
}
export type EventHandler = (data: any) => Promise<void>;
//# sourceMappingURL=kafka-event-bus.d.ts.map