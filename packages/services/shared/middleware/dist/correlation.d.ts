/**
 * Correlation ID Middleware
 * Adds unique correlation ID to each request for distributed tracing
 */
import { Request, Response, NextFunction } from 'express';
import { logger as baseLogger } from '@tide/logger';
declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
            log?: typeof baseLogger;
        }
    }
}
/**
 * Correlation ID Middleware
 * Extracts or generates a correlation ID for request tracing
 */
export declare const correlationId: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Correlation Logger Middleware
 * Creates a child logger with correlation ID for request-scoped logging
 * Must be used after correlationId middleware
 */
export declare const correlationLogger: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Helper to propagate correlation ID in inter-service HTTP requests
 * Use this when making requests to other services
 */
export declare function getCorrelationHeaders(req: Request): Record<string, string>;
/**
 * Helper to create correlation headers for background jobs
 */
export declare function createCorrelationHeaders(correlationId?: string): Record<string, string>;
//# sourceMappingURL=correlation.d.ts.map