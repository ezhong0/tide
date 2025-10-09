/**
 * Request Correlation Middleware
 * Adds correlation IDs to requests for distributed tracing
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
        }
    }
}
/**
 * Correlation ID Middleware
 *
 * Features:
 * - Generates unique correlation ID for each request
 * - Preserves existing correlation ID from headers
 * - Adds correlation ID to response headers
 * - Enables request tracing across services
 *
 * Headers:
 * - X-Correlation-ID: Incoming correlation ID
 * - X-Request-ID: Outgoing correlation ID (for compatibility)
 */
export declare const correlationMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Get correlation ID from request
 * Use this in services to propagate correlation to downstream calls
 */
export declare function getCorrelationId(req: Request): string | undefined;
/**
 * Create headers with correlation ID for outgoing requests
 *
 * Example:
 * ```typescript
 * const headers = createCorrelatedHeaders(req);
 * await fetch(url, { headers });
 * ```
 */
export declare function createCorrelatedHeaders(req: Request, additionalHeaders?: Record<string, string>): Record<string, string>;
//# sourceMappingURL=correlation.d.ts.map