import pino from 'pino';

import { env } from './env.js';

/**
 * Structured logger using Pino
 */
export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      'email',
      'password',
      'credentials',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      '*.email',
      '*.password',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    remove: true,
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  transport:
    env.NODE_ENV === 'development' && env.LOG_PRETTY
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

/**
 * Create child logger with specific context
 */
export function createLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}

/**
 * Log with request context
 */
export function logWithRequest(
  request: { id: string; method: string; url: string },
  level: pino.Level,
  message: string,
  data?: Record<string, unknown>
): void {
  logger[level](
    {
      requestId: request.id,
      method: request.method,
      url: request.url,
      ...data,
    },
    message
  );
}
