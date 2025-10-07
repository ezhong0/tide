"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnexpectedError = exports.TideError = void 0;
exports.toTideError = toTideError;
const codes_1 = require("./codes");
/**
 * Base error class for all Tide platform errors
 */
class TideError extends Error {
    constructor(code, message, details, statusCode, isOperational = true) {
        super(message);
        this.name = 'TideError';
        this.code = code;
        this.statusCode = statusCode || codes_1.ERROR_STATUS_MAP[code] || 500;
        this.details = details;
        this.timestamp = Date.now();
        this.isOperational = isOperational;
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Convert error to API response format
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp,
            requestId: this.requestId,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }
    /**
     * Convert error to string representation
     */
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
    /**
     * Check if error is retryable
     */
    isRetryable() {
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        return retryableStatusCodes.includes(this.statusCode);
    }
    /**
     * Check if error is client error (4xx)
     */
    isClientError() {
        return this.statusCode >= 400 && this.statusCode < 500;
    }
    /**
     * Check if error is server error (5xx)
     */
    isServerError() {
        return this.statusCode >= 500 && this.statusCode < 600;
    }
}
exports.TideError = TideError;
/**
 * Error for unexpected/unknown errors
 */
class UnexpectedError extends TideError {
    constructor(message, originalError) {
        super(codes_1.ErrorCode.INTERNAL_ERROR, message, { originalMessage: originalError?.message, originalStack: originalError?.stack }, 500, false // Not operational - unexpected
        );
        this.name = 'UnexpectedError';
    }
}
exports.UnexpectedError = UnexpectedError;
/**
 * Convert unknown errors to TideError
 */
function toTideError(error) {
    if (error instanceof TideError) {
        return error;
    }
    if (error instanceof Error) {
        return new UnexpectedError(error.message, error);
    }
    return new UnexpectedError(String(error));
}
