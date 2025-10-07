/**
 * AI Service HTTP Server
 * Provides health checks and direct API endpoints
 */
export declare class AIServer {
    private server;
    private orchestrator;
    private port;
    constructor(port?: number);
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Stop the server
     */
    stop(): Promise<void>;
    /**
     * Handle HTTP requests
     */
    private handleRequest;
    /**
     * Handle health check
     */
    private handleHealth;
    /**
     * Handle AI processing request
     */
    private handleProcess;
    /**
     * Parse request body
     */
    private parseBody;
}
//# sourceMappingURL=server.d.ts.map