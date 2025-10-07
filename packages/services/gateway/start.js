#!/usr/bin/env node

/**
 * Startup wrapper for Railway deployment
 * Provides better error logging
 */

console.log('[Startup] Starting gateway service...');
console.log('[Startup] Node version:', process.version);
console.log('[Startup] CWD:', process.cwd());
console.log('[Startup] PORT:', process.env.PORT || 'not set');
console.log('[Startup] NODE_ENV:', process.env.NODE_ENV || 'not set');

try {
  console.log('[Startup] Loading main module...');
  await import('./dist/index.js');
  console.log('[Startup] Module loaded successfully');
} catch (error) {
  console.error('[Startup] FATAL ERROR loading module:');
  console.error(error);
  process.exit(1);
}
