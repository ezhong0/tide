"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const validation_1 = require("@tide/validation");
const validation_2 = require("@tide/validation");
const auth_controller_1 = require("../controllers/auth.controller");
exports.authRouter = (0, express_1.Router)();
/**
 * POST /auth/register
 * Register a new user
 */
exports.authRouter.post('/register', (0, validation_1.validateBody)(validation_2.UserRegistrationSchema), auth_controller_1.register);
/**
 * POST /auth/login
 * Login with email and password
 */
exports.authRouter.post('/login', (0, validation_1.validateBody)(validation_2.UserLoginSchema), auth_controller_1.login);
/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
exports.authRouter.post('/refresh', auth_controller_1.refreshToken);
//# sourceMappingURL=auth.js.map