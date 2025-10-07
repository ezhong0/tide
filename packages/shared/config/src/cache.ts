import { env } from './env';

/**
 * Cache TTL defaults (in seconds)
 */
export const cacheTTL = {
  session: 7 * 24 * 60 * 60, // 7 days
  user: 60 * 60, // 1 hour
  conversation: 30 * 60, // 30 minutes
  emailTriage: 5 * 60, // 5 minutes
  aiResponse: 60 * 60, // 1 hour (semantic cache)
  oauthToken: 55 * 60, // 55 minutes (tokens expire at 60)
} as const;

/**
 * Cache key prefixes
 */
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  session: (id: string) => `session:${id}`,
  conversation: (id: string) => `conversation:${id}`,
  oauthToken: (userId: string, provider: string) => `oauth:${userId}:${provider}`,
  rateLimitAuth: (ip: string) => `ratelimit:auth:${ip}`,
  rateLimitApi: (userId: string) => `ratelimit:api:${userId}`,
} as const;
