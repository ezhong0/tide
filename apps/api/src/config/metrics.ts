import { Counter, Histogram, Registry, Gauge } from 'prom-client';

// Create a custom registry
export const register = new Registry();

// Business Metrics

export const commandsProcessed = new Counter({
  name: 'tide_commands_processed_total',
  help: 'Total number of voice commands processed',
  labelNames: ['intent', 'status'] as const,
  registers: [register],
});

export const commandLatency = new Histogram({
  name: 'tide_command_latency_seconds',
  help: 'Command processing latency in seconds',
  labelNames: ['intent'] as const,
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

export const activeUsers = new Gauge({
  name: 'tide_active_users',
  help: 'Number of active users',
  labelNames: ['timeframe'] as const, // 'daily', 'weekly', 'monthly'
  registers: [register],
});

export const emailsSent = new Counter({
  name: 'tide_emails_sent_total',
  help: 'Total emails sent via Tide',
  labelNames: ['status'] as const, // 'success', 'failed'
  registers: [register],
});

export const meetingsScheduled = new Counter({
  name: 'tide_meetings_scheduled_total',
  help: 'Total meetings scheduled via Tide',
  labelNames: ['status'] as const,
  registers: [register],
});

// Technical Metrics

export const apiRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const apiRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [register],
});

export const gptApiCalls = new Counter({
  name: 'gpt_api_calls_total',
  help: 'Total GPT API calls',
  labelNames: ['model', 'status'] as const,
  registers: [register],
});

export const gptTokensUsed = new Counter({
  name: 'gpt_tokens_used_total',
  help: 'Total GPT tokens consumed',
  labelNames: ['model', 'type'] as const, // 'prompt' | 'completion'
  registers: [register],
});

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation'] as const,
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate (0-1)',
  labelNames: ['cache_type'] as const, // 'redis', 'memory'
  registers: [register],
});

export const websocketConnections = new Gauge({
  name: 'websocket_connections',
  help: 'Current number of WebSocket connections',
  registers: [register],
});

/**
 * Helper function to time async operations
 */
export async function timeAsync<T>(
  histogram: Histogram,
  labels: Record<string, string>,
  fn: () => Promise<T>
): Promise<T> {
  const end = histogram.startTimer(labels);
  try {
    return await fn();
  } finally {
    end();
  }
}
