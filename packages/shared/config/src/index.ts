// Export environment configuration
export { env, isProduction, isDevelopment, isTest, getKafkaBrokers, getAllowedOrigins, getWebSocketOrigins } from './env';
export type { Env } from './env';

// Export database configuration
export { databaseConfig, redisConfig, kafkaConfig } from './database';
export type { DatabaseConfig, RedisConfig, KafkaConfig } from './database';

// Export authentication configuration
export { jwtConfig, passwordConfig, gmailOAuthConfig, exchangeOAuthConfig, googleCalendarOAuthConfig } from './auth';
export type { JWTConfig, OAuthProviderConfig } from './auth';

// Export service configuration
export { aiServiceConfig, vectorDBConfig, emailServiceConfig, monitoringConfig } from './services';
export type { AIServiceConfig, VectorDBConfig } from './services';

// Export feature flags
export { features, isFeatureEnabled, requireFeature } from './features';

// Export server configuration
export { serverConfig, websocketConfig } from './server';
