import { ErrorCode } from './codes';
/**
 * Error detail structure for API responses
 */
export interface ErrorDetail {
    code: string;
    message: string;
    details?: unknown;
    timestamp?: number;
    requestId?: string;
    stack?: string;
}
/**
 * Base error class for all Tide platform errors
 */
export declare class TideError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly details?: unknown;
    readonly timestamp: number;
    readonly isOperational: boolean;
    requestId?: string;
    constructor(code: ErrorCode, message: string, details?: unknown, statusCode?: number, isOperational?: boolean);
    /**
     * Alias for details (for compatibility)
     */
    get metadata(): unknown;
    /**
     * Convert error to API response format
     */
    toJSON(): ErrorDetail;
    /**
     * Convert error to string representation
     */
    toString(): string;
    /**
     * Check if error is retryable
     */
    isRetryable(): boolean;
    /**
     * Check if error is client error (4xx)
     */
    isClientError(): boolean;
    /**
     * Check if error is server error (5xx)
     */
    isServerError(): boolean;
}
/**
 * Error for unexpected/unknown errors
 */
export declare class UnexpectedError extends TideError {
    constructor(message: string, originalError?: Error);
}
/**
 * Convert unknown errors to TideError
 */
export declare function toTideError(error: unknown): TideError;
