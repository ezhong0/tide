"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheKeys = exports.cacheTTL = void 0;
/**
 * Cache TTL defaults (in seconds)
 */
exports.cacheTTL = {
    session: 7 * 24 * 60 * 60, // 7 days
    user: 60 * 60, // 1 hour
    conversation: 30 * 60, // 30 minutes
    emailTriage: 5 * 60, // 5 minutes
    aiResponse: 60 * 60, // 1 hour (semantic cache)
    oauthToken: 55 * 60, // 55 minutes (tokens expire at 60)
};
/**
 * Cache key prefixes
 */
exports.cacheKeys = {
    user: (id) => `user:${id}`,
    session: (id) => `session:${id}`,
    conversation: (id) => `conversation:${id}`,
    oauthToken: (userId, provider) => `oauth:${userId}:${provider}`,
    rateLimitAuth: (ip) => `ratelimit:auth:${ip}`,
    rateLimitApi: (userId) => `ratelimit:api:${userId}`,
};
