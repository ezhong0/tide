"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// Load .env from project root
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../../../../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("@tide/logger");
const health_1 = require("./routes/health");
const auth_1 = require("./routes/auth");
const error_handler_1 = require("./middleware/error-handler");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    const requestLogger = logger_1.logger.child({
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    requestLogger.info('Request received');
    next();
});
// Routes
app.use('/health', health_1.healthRouter);
app.use('/auth', auth_1.authRouter);
// Error handling (must be last)
app.use(error_handler_1.errorHandler);
// Start server
const PORT = process.env.AUTH_SERVICE_PORT ? parseInt(process.env.AUTH_SERVICE_PORT) : 4001;
app.listen(PORT, () => {
    logger_1.logger.info({ port: PORT, service: 'auth' }, 'Auth service started');
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map