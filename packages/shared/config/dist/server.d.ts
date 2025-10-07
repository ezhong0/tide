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
 * WebSocket server configuration
 */
export declare const websocketConfig: {
    port: number;
    cors: {
        origins: string[];
        credentials: boolean;
    };
    pingTimeout: number;
    pingInterval: number;
    maxHttpBufferSize: number;
    transports: string[];
};
