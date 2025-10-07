/**
 * Simple logger that doesn't depend on @tide/config
 * For Alpha deployment only
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as LogLevel;

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

function formatLog(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: any) {
    if (shouldLog('debug')) console.log(formatLog('debug', message, meta));
  },
  info(arg1: any, arg2?: any) {
    if (!shouldLog('info')) return;
    if (typeof arg1 === 'string') {
      console.log(formatLog('info', arg1, arg2));
    } else {
      console.log(formatLog('info', arg2, arg1));
    }
  },
  warn(arg1: any, arg2?: any) {
    if (!shouldLog('warn')) return;
    if (typeof arg1 === 'string') {
      console.warn(formatLog('warn', arg1, arg2));
    } else {
      console.warn(formatLog('warn', arg2, arg1));
    }
  },
  error(arg1: any, arg2?: any) {
    if (!shouldLog('error')) return;
    if (typeof arg1 === 'string') {
      console.error(formatLog('error', arg1, arg2));
    } else {
      console.error(formatLog('error', arg2, arg1));
    }
  },
};
