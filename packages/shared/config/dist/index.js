"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTypes = exports.kafkaTopics = exports.cacheKeys = exports.cacheTTL = exports.websocketConfig = exports.serverConfig = exports.requireFeature = exports.isFeatureEnabled = exports.features = exports.monitoringConfig = exports.emailServiceConfig = exports.vectorDBConfig = exports.aiServiceConfig = exports.googleCalendarOAuthConfig = exports.exchangeOAuthConfig = exports.gmailOAuthConfig = exports.bcryptConfig = exports.passwordConfig = exports.jwtConfig = exports.kafkaConfig = exports.redisConfig = exports.databaseConfig = exports.getWebSocketOrigins = exports.getAllowedOrigins = exports.getKafkaBrokers = exports.isTest = exports.isDevelopment = exports.isProduction = exports.env = void 0;
// Export environment configuration
var env_1 = require("./env");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return env_1.env; } });
Object.defineProperty(exports, "isProduction", { enumerable: true, get: function () { return env_1.isProduction; } });
Object.defineProperty(exports, "isDevelopment", { enumerable: true, get: function () { return env_1.isDevelopment; } });
Object.defineProperty(exports, "isTest", { enumerable: true, get: function () { return env_1.isTest; } });
Object.defineProperty(exports, "getKafkaBrokers", { enumerable: true, get: function () { return env_1.getKafkaBrokers; } });
Object.defineProperty(exports, "getAllowedOrigins", { enumerable: true, get: function () { return env_1.getAllowedOrigins; } });
Object.defineProperty(exports, "getWebSocketOrigins", { enumerable: true, get: function () { return env_1.getWebSocketOrigins; } });
// Export database configuration
var database_1 = require("./database");
Object.defineProperty(exports, "databaseConfig", { enumerable: true, get: function () { return database_1.databaseConfig; } });
Object.defineProperty(exports, "redisConfig", { enumerable: true, get: function () { return database_1.redisConfig; } });
Object.defineProperty(exports, "kafkaConfig", { enumerable: true, get: function () { return database_1.kafkaConfig; } });
// Export authentication configuration
var auth_1 = require("./auth");
Object.defineProperty(exports, "jwtConfig", { enumerable: true, get: function () { return auth_1.jwtConfig; } });
Object.defineProperty(exports, "passwordConfig", { enumerable: true, get: function () { return auth_1.passwordConfig; } });
Object.defineProperty(exports, "bcryptConfig", { enumerable: true, get: function () { return auth_1.bcryptConfig; } });
Object.defineProperty(exports, "gmailOAuthConfig", { enumerable: true, get: function () { return auth_1.gmailOAuthConfig; } });
Object.defineProperty(exports, "exchangeOAuthConfig", { enumerable: true, get: function () { return auth_1.exchangeOAuthConfig; } });
Object.defineProperty(exports, "googleCalendarOAuthConfig", { enumerable: true, get: function () { return auth_1.googleCalendarOAuthConfig; } });
// Export service configuration
var services_1 = require("./services");
Object.defineProperty(exports, "aiServiceConfig", { enumerable: true, get: function () { return services_1.aiServiceConfig; } });
Object.defineProperty(exports, "vectorDBConfig", { enumerable: true, get: function () { return services_1.vectorDBConfig; } });
Object.defineProperty(exports, "emailServiceConfig", { enumerable: true, get: function () { return services_1.emailServiceConfig; } });
Object.defineProperty(exports, "monitoringConfig", { enumerable: true, get: function () { return services_1.monitoringConfig; } });
// Export feature flags
var features_1 = require("./features");
Object.defineProperty(exports, "features", { enumerable: true, get: function () { return features_1.features; } });
Object.defineProperty(exports, "isFeatureEnabled", { enumerable: true, get: function () { return features_1.isFeatureEnabled; } });
Object.defineProperty(exports, "requireFeature", { enumerable: true, get: function () { return features_1.requireFeature; } });
// Export server configuration
var server_1 = require("./server");
Object.defineProperty(exports, "serverConfig", { enumerable: true, get: function () { return server_1.serverConfig; } });
Object.defineProperty(exports, "websocketConfig", { enumerable: true, get: function () { return server_1.websocketConfig; } });
// Export cache configuration
var cache_1 = require("./cache");
Object.defineProperty(exports, "cacheTTL", { enumerable: true, get: function () { return cache_1.cacheTTL; } });
Object.defineProperty(exports, "cacheKeys", { enumerable: true, get: function () { return cache_1.cacheKeys; } });
// Export messaging configuration
var messaging_1 = require("./messaging");
Object.defineProperty(exports, "kafkaTopics", { enumerable: true, get: function () { return messaging_1.kafkaTopics; } });
Object.defineProperty(exports, "eventTypes", { enumerable: true, get: function () { return messaging_1.eventTypes; } });
