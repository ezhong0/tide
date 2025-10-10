/**
 * Error Handling Middleware
 * Standardized error responses across all services
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Standard API Error
 */
export declare class APIError extends Error {
    statusCode: number;
    message: string;
    code?: string | undefined;
    details?: unknown | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined, details?: unknown | undefined);
}
/**
 * Common API Errors
 */
export declare class BadRequestError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class UnauthorizedError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class ForbiddenError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class NotFoundError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class ConflictError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class ValidationError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class TooManyRequestsError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class InternalServerError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare class ServiceUnavailableError extends APIError {
    constructor(message?: string, details?: unknown);
}
export declare const errorHandler: (err: Error | APIError, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found Handler
 * Register this before the error handler
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * Async Route Handler Wrapper
 * Automatically catches errors from async route handlers
 *
 * Usage:
 *   app.get('/users', asyncHandler(async (req, res) => {
 *     const users = await getUsers();
 *     res.json(users);
 *   }));
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error-handler.d.ts.map