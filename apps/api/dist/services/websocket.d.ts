import type { FastifyInstance } from 'fastify';
/**
 * WebSocket service for real-time updates
 */
export declare class WebSocketService {
    private clients;
    private heartbeatInterval;
    /**
     * Register WebSocket plugin with Fastify
     */
    register(app: FastifyInstance): Promise<void>;
    /**
     * Handle new WebSocket connection
     */
    private handleConnection;
    /**
     * Handle incoming message from client
     */
    private handleMessage;
    /**
     * Handle client disconnect
     */
    private handleDisconnect;
    /**
     * Send message to specific client
     */
    sendToClient(clientId: string, message: any): void;
    /**
     * Send message to all clients of a specific user
     */
    sendToUser(userId: string, message: any): void;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: any, excludeClientId?: string): void;
    /**
     * Notify user about command status update
     */
    notifyCommandUpdate(userId: string, commandId: string, status: string, data?: any): void;
    /**
     * Notify user about new draft for review
     */
    notifyDraftReady(userId: string, draftId: string, draftType: string): void;
    /**
     * Notify user about new email
     */
    notifyNewEmail(userId: string, emailId: string, from: string, subject: string): void;
    /**
     * Start heartbeat monitoring
     */
    private startHeartbeat;
    /**
     * Stop heartbeat monitoring
     */
    private stopHeartbeat;
    /**
     * Generate unique client ID
     */
    private generateClientId;
    /**
     * Get connection stats
     */
    getStats(): {
        totalClients: number;
        clientsByUser: Map<string, number>;
    };
    /**
     * Cleanup on shutdown
     */
    shutdown(): Promise<void>;
}
export declare const wsService: WebSocketService;
//# sourceMappingURL=websocket.d.ts.map