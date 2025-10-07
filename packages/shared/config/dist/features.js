"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.features = void 0;
exports.isFeatureEnabled = isFeatureEnabled;
exports.requireFeature = requireFeature;
const env_1 = require("./env");
/**
 * Feature flags for the platform
 */
exports.features = {
    ai: env_1.env.ENABLE_AI_FEATURES,
    emailSync: env_1.env.ENABLE_EMAIL_SYNC,
    calendarSync: env_1.env.ENABLE_CALENDAR_SYNC,
    workflowEngine: env_1.env.ENABLE_WORKFLOW_ENGINE,
};
/**
 * Check if a feature is enabled
 */
function isFeatureEnabled(feature) {
    return exports.features[feature];
}
/**
 * Require a feature to be enabled or throw error
 */
function requireFeature(feature) {
    if (!isFeatureEnabled(feature)) {
        throw new Error(`Feature "${feature}" is not enabled`);
    }
}
