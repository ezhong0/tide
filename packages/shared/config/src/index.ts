// Export environment configuration
export { env, isProduction, isDevelopment, isTest, getKafkaBrokers, getAllowedOrigins } from './env';
export type { Env } from './env';

// Export database configuration
export { databaseConfig, redisConfig, kafkaConfig } from './database';
export type { DatabaseConfig, RedisConfig, KafkaConfig } from './database';

// Export authentication configuration (Supabase-first)
export { supabaseConfig, googleOAuthConfig, azureOAuthConfig } from './auth';

// Export service configuration
export { aiServiceConfig, vectorConfig, monitoringConfig, serviceUrls } from './services';
export type { AIServiceConfig } from './services';

// Export feature flags
export { features, isFeatureEnabled, requireFeature } from './features';

// Export server configuration
export { serverConfig } from './server';

// Export cache configuration
export { cacheTTL, cacheKeys } from './cache';

// Export messaging configuration
export { kafkaTopics, eventTypes } from './messaging';
export type { KafkaTopic } from './messaging';
