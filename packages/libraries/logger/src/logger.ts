import pino from 'pino';
import { env } from '@tide/config';

/**
 * Create base logger instance
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: ['password', 'token', 'secret', 'apiKey', 'authorization'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: env.NODE_ENV,
  },
  ...(env.LOG_LEVEL === 'debug' && env.NODE_ENV === 'development'
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
export function createLogger(context: pino.Bindings): pino.Logger {
  return logger.child(context);
}

/**
 * Create request-scoped logger
 */
export function createRequestLogger(
  requestId: string,
  userId?: string,
  additionalContext?: pino.Bindings
): pino.Logger {
  return logger.child({
    requestId,
    userId,
    ...additionalContext,
  });
}

/**
 * Create service-scoped logger
 */
export function createServiceLogger(
  serviceName: string,
  additionalContext?: pino.Bindings
): pino.Logger {
  return logger.child({
    service: serviceName,
    ...additionalContext,
  });
}
