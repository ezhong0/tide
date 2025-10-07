/**
 * HTTP server configuration
 */
export declare const serverConfig: {
    port: number;
    cors: {
        origins: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
};
/**
 * WebSocket configuration
 *
 * Week 3 Alpha uses Supabase Realtime for WebSocket connections.
 * No custom WebSocket server is needed.
 */
