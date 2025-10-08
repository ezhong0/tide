"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTypes = exports.kafkaTopics = exports.cacheKeys = exports.cacheTTL = exports.serverConfig = exports.requireFeature = exports.isFeatureEnabled = exports.features = exports.serviceUrls = exports.monitoringConfig = exports.vectorConfig = exports.aiServiceConfig = exports.azureOAuthConfig = exports.googleOAuthConfig = exports.supabaseConfig = exports.kafkaConfig = exports.redisConfig = exports.databaseConfig = exports.getAllowedOrigins = exports.getKafkaBrokers = exports.isTest = exports.isDevelopment = exports.isProduction = exports.env = void 0;
// Export environment configuration
var env_1 = require("./env");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return env_1.env; } });
Object.defineProperty(exports, "isProduction", { enumerable: true, get: function () { return env_1.isProduction; } });
Object.defineProperty(exports, "isDevelopment", { enumerable: true, get: function () { return env_1.isDevelopment; } });
Object.defineProperty(exports, "isTest", { enumerable: true, get: function () { return env_1.isTest; } });
Object.defineProperty(exports, "getKafkaBrokers", { enumerable: true, get: function () { return env_1.getKafkaBrokers; } });
Object.defineProperty(exports, "getAllowedOrigins", { enumerable: true, get: function () { return env_1.getAllowedOrigins; } });
// Export database configuration
var database_1 = require("./database");
Object.defineProperty(exports, "databaseConfig", { enumerable: true, get: function () { return database_1.databaseConfig; } });
Object.defineProperty(exports, "redisConfig", { enumerable: true, get: function () { return database_1.redisConfig; } });
Object.defineProperty(exports, "kafkaConfig", { enumerable: true, get: function () { return database_1.kafkaConfig; } });
// Export authentication configuration (Supabase-first)
var auth_1 = require("./auth");
Object.defineProperty(exports, "supabaseConfig", { enumerable: true, get: function () { return auth_1.supabaseConfig; } });
Object.defineProperty(exports, "googleOAuthConfig", { enumerable: true, get: function () { return auth_1.googleOAuthConfig; } });
Object.defineProperty(exports, "azureOAuthConfig", { enumerable: true, get: function () { return auth_1.azureOAuthConfig; } });
// Export service configuration
var services_1 = require("./services");
Object.defineProperty(exports, "aiServiceConfig", { enumerable: true, get: function () { return services_1.aiServiceConfig; } });
Object.defineProperty(exports, "vectorConfig", { enumerable: true, get: function () { return services_1.vectorConfig; } });
Object.defineProperty(exports, "monitoringConfig", { enumerable: true, get: function () { return services_1.monitoringConfig; } });
Object.defineProperty(exports, "serviceUrls", { enumerable: true, get: function () { return services_1.serviceUrls; } });
// Export feature flags
var features_1 = require("./features");
Object.defineProperty(exports, "features", { enumerable: true, get: function () { return features_1.features; } });
Object.defineProperty(exports, "isFeatureEnabled", { enumerable: true, get: function () { return features_1.isFeatureEnabled; } });
Object.defineProperty(exports, "requireFeature", { enumerable: true, get: function () { return features_1.requireFeature; } });
// Export server configuration
var server_1 = require("./server");
Object.defineProperty(exports, "serverConfig", { enumerable: true, get: function () { return server_1.serverConfig; } });
// Export cache configuration
var cache_1 = require("./cache");
Object.defineProperty(exports, "cacheTTL", { enumerable: true, get: function () { return cache_1.cacheTTL; } });
Object.defineProperty(exports, "cacheKeys", { enumerable: true, get: function () { return cache_1.cacheKeys; } });
// Export messaging configuration
var messaging_1 = require("./messaging");
Object.defineProperty(exports, "kafkaTopics", { enumerable: true, get: function () { return messaging_1.kafkaTopics; } });
Object.defineProperty(exports, "eventTypes", { enumerable: true, get: function () { return messaging_1.eventTypes; } });
