"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const validation_1 = require("@tide/validation");
const validation_2 = require("@tide/validation");
const auth_controller_1 = require("../controllers/auth.controller");
const rate_limiter_1 = require("../middleware/rate-limiter");
exports.authRouter = (0, express_1.Router)();
/**
 * POST /auth/register
 * Register a new user
 * Rate limited: 5 requests per 15 minutes per IP
 */
exports.authRouter.post('/register', rate_limiter_1.authRateLimiter, (0, validation_1.validateBody)(validation_2.UserRegistrationSchema), auth_controller_1.register);
/**
 * POST /auth/login
 * Login with email and password
 * Rate limited: 5 requests per 15 minutes per IP
 */
exports.authRouter.post('/login', rate_limiter_1.authRateLimiter, (0, validation_1.validateBody)(validation_2.UserLoginSchema), auth_controller_1.login);
/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * Rate limited: 10 requests per 15 minutes per IP
 */
exports.authRouter.post('/refresh', rate_limiter_1.tokenRefreshLimiter, auth_controller_1.refreshToken);
//# sourceMappingURL=auth.js.map