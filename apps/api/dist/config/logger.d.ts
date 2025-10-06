import pino from 'pino';
/**
 * Structured logger using Pino
 */
export declare const logger: any;
/**
 * Create child logger with specific context
 */
export declare function createLogger(context: Record<string, unknown>): pino.Logger;
/**
 * Log with request context
 */
export declare function logWithRequest(request: {
    id: string;
    method: string;
    url: string;
}, level: pino.Level, message: string, data?: Record<string, unknown>): void;
//# sourceMappingURL=logger.d.ts.map