import websocket from '@fastify/websocket';
/**
 * WebSocket service for real-time updates
 */
export class WebSocketService {
    clients = new Map();
    heartbeatInterval = null;
    /**
     * Register WebSocket plugin with Fastify
     */
    async register(app) {
        await app.register(websocket, {
            options: {
                maxPayload: 1048576, // 1MB
                verifyClient: (info, next) => {
                    // Could add auth verification here
                    next(true);
                },
            },
        });
        // WebSocket route
        app.get('/ws', { websocket: true }, (socket, request) => {
            this.handleConnection(socket, request);
        });
        // Start heartbeat monitoring
        this.startHeartbeat();
        app.log.info('WebSocket server registered on /ws');
    }
    /**
     * Handle new WebSocket connection
     */
    handleConnection(socket, request) {
        const clientId = this.generateClientId();
        // Extract userId from query params or JWT
        const userId = request.query.userId;
        if (!userId) {
            socket.close(1008, 'User ID required');
            return;
        }
        // Store client
        const client = {
            userId,
            socket,
            lastHeartbeat: new Date(),
        };
        this.clients.set(clientId, client);
        socket.on('message', (data) => {
            this.handleMessage(clientId, data);
        });
        socket.on('close', () => {
            this.handleDisconnect(clientId);
        });
        socket.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.handleDisconnect(clientId);
        });
        // Send connection confirmation
        this.sendToClient(clientId, {
            type: 'connected',
            clientId,
            timestamp: new Date().toISOString(),
        });
        console.log(`Client ${clientId} (user: ${userId}) connected. Total clients: ${this.clients.size}`);
    }
    /**
     * Handle incoming message from client
     */
    handleMessage(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client)
            return;
        try {
            const message = JSON.parse(data.toString());
            // Update heartbeat
            if (message.type === 'heartbeat' || message.type === 'ping') {
                client.lastHeartbeat = new Date();
                this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
                return;
            }
            // Handle other message types
            console.log(`Received message from ${clientId}:`, message);
        }
        catch (error) {
            console.error(`Error parsing message from ${clientId}:`, error);
        }
    }
    /**
     * Handle client disconnect
     */
    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            console.log(`Client ${clientId} (user: ${client.userId}) disconnected`);
            this.clients.delete(clientId);
        }
    }
    /**
     * Send message to specific client
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.socket.readyState === 1) {
            // 1 = OPEN
            client.socket.send(JSON.stringify(message));
        }
    }
    /**
     * Send message to all clients of a specific user
     */
    sendToUser(userId, message) {
        for (const [clientId, client] of this.clients.entries()) {
            if (client.userId === userId) {
                this.sendToClient(clientId, message);
            }
        }
    }
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message, excludeClientId) {
        for (const [clientId] of this.clients.entries()) {
            if (clientId !== excludeClientId) {
                this.sendToClient(clientId, message);
            }
        }
    }
    /**
     * Notify user about command status update
     */
    notifyCommandUpdate(userId, commandId, status, data) {
        this.sendToUser(userId, {
            type: 'command_update',
            commandId,
            status,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Notify user about new draft for review
     */
    notifyDraftReady(userId, draftId, draftType) {
        this.sendToUser(userId, {
            type: 'draft_ready',
            draftId,
            draftType,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Notify user about new email
     */
    notifyNewEmail(userId, emailId, from, subject) {
        this.sendToUser(userId, {
            type: 'new_email',
            emailId,
            from,
            subject,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Start heartbeat monitoring
     */
    startHeartbeat() {
        const HEARTBEAT_INTERVAL = 30000; // 30 seconds
        const TIMEOUT_THRESHOLD = 60000; // 60 seconds
        this.heartbeatInterval = setInterval(() => {
            const now = new Date();
            for (const [clientId, client] of this.clients.entries()) {
                const timeSinceLastHeartbeat = now.getTime() - client.lastHeartbeat.getTime();
                if (timeSinceLastHeartbeat > TIMEOUT_THRESHOLD) {
                    console.log(`Client ${clientId} timed out. Closing connection.`);
                    client.socket.close(1000, 'Heartbeat timeout');
                    this.clients.delete(clientId);
                }
            }
        }, HEARTBEAT_INTERVAL);
    }
    /**
     * Stop heartbeat monitoring
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    /**
     * Generate unique client ID
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Get connection stats
     */
    getStats() {
        const clientsByUser = new Map();
        for (const client of this.clients.values()) {
            const count = clientsByUser.get(client.userId) || 0;
            clientsByUser.set(client.userId, count + 1);
        }
        return {
            totalClients: this.clients.size,
            clientsByUser,
        };
    }
    /**
     * Cleanup on shutdown
     */
    async shutdown() {
        console.log('Shutting down WebSocket service...');
        this.stopHeartbeat();
        // Close all connections
        for (const [clientId, client] of this.clients.entries()) {
            client.socket.close(1001, 'Server shutting down');
            this.clients.delete(clientId);
        }
        console.log('WebSocket service shut down');
    }
}
// Export singleton instance
export const wsService = new WebSocketService();
//# sourceMappingURL=websocket.js.map