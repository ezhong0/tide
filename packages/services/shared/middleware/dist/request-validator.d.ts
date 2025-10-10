/**
 * Request Validation Middleware
 * Validates request body, query params, and headers using Zod schemas
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
}
/**
 * Validate request against Zod schemas
 */
export declare function validateRequest(schemas: ValidationSchemas): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Sanitize request input to prevent XSS and injection attacks
 */
export declare function sanitizeInput(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate pagination parameters
 */
export declare function validatePagination(options?: {
    maxLimit?: number;
    defaultLimit?: number;
}): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate required headers
 */
export declare function requireHeaders(headers: string[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate content type
 */
export declare function requireContentType(contentType: string): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=request-validator.d.ts.map