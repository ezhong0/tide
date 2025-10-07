import pino from 'pino';
/**
 * Create base logger instance
 */
export declare const logger: import("pino").Logger<never>;
/**
 * Create a child logger with additional context
 */
export declare function createLogger(context: pino.Bindings): pino.Logger<never>;
/**
 * Create request-scoped logger
 */
export declare function createRequestLogger(requestId: string, userId?: string, additionalContext?: pino.Bindings): pino.Logger<never>;
/**
 * Create service-scoped logger
 */
export declare function createServiceLogger(serviceName: string, additionalContext?: pino.Bindings): pino.Logger<never>;
//# sourceMappingURL=logger.d.ts.map