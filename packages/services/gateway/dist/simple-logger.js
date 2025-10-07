/**
 * Simple logger that doesn't depend on @tide/config
 * For Alpha deployment only
 */
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info');
const LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
function shouldLog(level) {
    return LEVELS[level] >= LEVELS[LOG_LEVEL];
}
function formatLog(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}
export const logger = {
    debug(message, meta) {
        if (shouldLog('debug'))
            console.log(formatLog('debug', message, meta));
    },
    info(arg1, arg2) {
        if (!shouldLog('info'))
            return;
        if (typeof arg1 === 'string') {
            console.log(formatLog('info', arg1, arg2));
        }
        else {
            console.log(formatLog('info', arg2, arg1));
        }
    },
    warn(arg1, arg2) {
        if (!shouldLog('warn'))
            return;
        if (typeof arg1 === 'string') {
            console.warn(formatLog('warn', arg1, arg2));
        }
        else {
            console.warn(formatLog('warn', arg2, arg1));
        }
    },
    error(arg1, arg2) {
        if (!shouldLog('error'))
            return;
        if (typeof arg1 === 'string') {
            console.error(formatLog('error', arg1, arg2));
        }
        else {
            console.error(formatLog('error', arg2, arg1));
        }
    },
};
//# sourceMappingURL=simple-logger.js.map