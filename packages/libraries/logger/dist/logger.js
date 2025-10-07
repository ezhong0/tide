"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createLogger = createLogger;
exports.createRequestLogger = createRequestLogger;
exports.createServiceLogger = createServiceLogger;
const pino_1 = __importDefault(require("pino"));
const config_1 = require("@tide/config");
/**
 * Create base logger instance
 */
exports.logger = (0, pino_1.default)({
    level: config_1.env.LOG_LEVEL,
    formatters: {
        level: (label) => ({ level: label }),
    },
    redact: {
        paths: ['password', 'token', 'secret', 'apiKey', 'authorization'],
        censor: '[REDACTED]',
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        env: config_1.env.NODE_ENV,
    },
    ...(config_1.env.LOG_LEVEL === 'debug' && config_1.env.NODE_ENV === 'development'
        ? {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
        }
        : {}),
});
/**
 * Create a child logger with additional context
 */
function createLogger(context) {
    return exports.logger.child(context);
}
/**
 * Create request-scoped logger
 */
function createRequestLogger(requestId, userId, additionalContext) {
    return exports.logger.child({
        requestId,
        userId,
        ...additionalContext,
    });
}
/**
 * Create service-scoped logger
 */
function createServiceLogger(serviceName, additionalContext) {
    return exports.logger.child({
        service: serviceName,
        ...additionalContext,
    });
}
//# sourceMappingURL=logger.js.map