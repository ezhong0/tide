"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("@tide/logger");
/**
 * Global error handling middleware
 */
function errorHandler(error, req, res, next) {
    // Log error
    logger_1.logger.error({
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
        },
        method: req.method,
        path: req.path,
        body: req.body,
    }, 'Request error');
    // Handle TideError (our custom errors)
    if ('code' in error && 'statusCode' in error) {
        const tideError = error;
        return res.status(tideError.statusCode).json({
            error: {
                code: tideError.code,
                message: tideError.message,
                ...(tideError.metadata && { metadata: tideError.metadata }),
            },
        });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message,
            },
        });
    }
    // Default to 500 for unknown errors
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}
//# sourceMappingURL=error-handler.js.map