#!/usr/bin/env node

/**
 * Startup wrapper for Railway deployment
 * Provides better error logging
 */

console.log('[Startup] Starting gateway service...');
console.log('[Startup] Node version:', process.version);
console.log('[Startup] CWD:', process.cwd());
console.log('[Startup] __dirname:', import.meta.url);
console.log('[Startup] PORT:', process.env.PORT || 'not set');
console.log('[Startup] NODE_ENV:', process.env.NODE_ENV || 'not set');

// Keep process alive
process.on('uncaughtException', (error) => {
  console.error('[Startup] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Startup] Unhandled rejection at:', promise, 'reason:', reason);
});

try {
  console.log('[Startup] Loading main module from ./dist/index.js...');
  await import('./dist/index.js');
  console.log('[Startup] Module loaded successfully - server should be running');

  // Keep the process alive - this is important for Railway
  console.log('[Startup] Keeping process alive...');
  setInterval(() => {
    // This keeps the event loop active
  }, 1000000);
} catch (error) {
  console.error('[Startup] FATAL ERROR loading module:');
  console.error(error);
  process.exit(1);
}
