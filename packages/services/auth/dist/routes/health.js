"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const database_1 = require("@tide/database");
const logger_1 = require("@tide/logger");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', async (req, res) => {
    try {
        // Test database connection
        await (0, database_1.query)('SELECT 1');
        res.json({
            status: 'healthy',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '0.1.0',
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Health check failed');
        res.status(503).json({
            status: 'unhealthy',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
        });
    }
});
//# sourceMappingURL=health.js.map