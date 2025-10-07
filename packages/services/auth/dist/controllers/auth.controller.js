"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@tide/database");
const logger_1 = require("@tide/logger");
const errors_1 = require("@tide/errors");
const config_1 = require("@tide/config");
const types_1 = require("@tide/types");
/**
 * Register a new user
 */
async function register(req, res, next) {
    try {
        const { email, password, name, timezone = 'UTC' } = req.body;
        // Check if user already exists
        const existingUser = await (0, database_1.queryOne)('SELECT id FROM tide.users WHERE email = $1', [email.toLowerCase()]);
        if (existingUser) {
            throw errors_1.AuthErrors.userAlreadyExists(email);
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, config_1.bcryptConfig.saltRounds);
        // Create user and profile in transaction
        const result = await (0, database_1.transaction)(async (client) => {
            // Create user
            const [user] = await client.query(`INSERT INTO tide.users (email, password_hash, name, timezone, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING id, email, name, email_verified, status, created_at`, [email.toLowerCase(), passwordHash, name, timezone]).then(r => r.rows);
            // Create user profile
            await client.query(`INSERT INTO tide.user_profiles (user_id, preferences)
         VALUES ($1, $2)`, [user.id, JSON.stringify({})]);
            return user;
        });
        const userId = (0, types_1.createUserId)(result.id);
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({ userId: userId, email: result.email, type: 'access' }, config_1.jwtConfig.accessTokenSecret, { expiresIn: config_1.jwtConfig.accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: userId, type: 'refresh' }, config_1.jwtConfig.refreshTokenSecret, { expiresIn: config_1.jwtConfig.refreshTokenExpiry });
        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await (0, database_1.query)(`INSERT INTO tide.refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`, [result.id, refreshToken, expiresAt]);
        logger_1.logger.info({ userId, email: result.email }, 'User registered successfully');
        res.status(201).json({
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
                emailVerified: result.email_verified,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Login with email and password
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        // Get user
        const user = await (0, database_1.queryOne)(`SELECT id, email, name, password_hash, email_verified, status
       FROM tide.users
       WHERE email = $1 AND deleted_at IS NULL`, [email.toLowerCase()]);
        if (!user) {
            throw errors_1.AuthErrors.invalidCredentials();
        }
        // Check if user is active
        if (user.status !== 'active') {
            throw errors_1.AuthErrors.accountSuspended();
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw errors_1.AuthErrors.invalidCredentials();
        }
        const userId = (0, types_1.createUserId)(user.id);
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({ userId: userId, email: user.email, type: 'access' }, config_1.jwtConfig.accessTokenSecret, { expiresIn: config_1.jwtConfig.accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: userId, type: 'refresh' }, config_1.jwtConfig.refreshTokenSecret, { expiresIn: config_1.jwtConfig.refreshTokenExpiry });
        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await (0, database_1.query)(`INSERT INTO tide.refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`, [user.id, refreshToken, expiresAt]);
        // Update last login
        await (0, database_1.query)('UPDATE tide.users SET last_login_at = NOW() WHERE id = $1', [user.id]);
        logger_1.logger.info({ userId, email: user.email }, 'User logged in successfully');
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.email_verified,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Refresh access token using refresh token
 */
async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw errors_1.AuthErrors.invalidToken();
        }
        // Verify refresh token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.jwtConfig.refreshTokenSecret);
        }
        catch (error) {
            throw errors_1.AuthErrors.invalidToken();
        }
        if (decoded.type !== 'refresh') {
            throw errors_1.AuthErrors.invalidToken();
        }
        // Check if refresh token exists and is not expired
        const storedToken = await (0, database_1.queryOne)(`SELECT id, user_id, expires_at
       FROM tide.refresh_tokens
       WHERE token = $1 AND revoked_at IS NULL`, [refreshToken]);
        if (!storedToken) {
            throw errors_1.AuthErrors.invalidToken();
        }
        // Check expiration
        if (new Date(storedToken.expires_at) < new Date()) {
            throw errors_1.AuthErrors.tokenExpired();
        }
        // Get user
        const user = await (0, database_1.queryOne)(`SELECT id, email, name, status
       FROM tide.users
       WHERE id = $1 AND deleted_at IS NULL`, [storedToken.user_id]);
        if (!user || user.status !== 'active') {
            throw errors_1.AuthErrors.invalidToken();
        }
        const userId = (0, types_1.createUserId)(user.id);
        // Generate new access token
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: userId, email: user.email, type: 'access' }, config_1.jwtConfig.accessTokenSecret, { expiresIn: config_1.jwtConfig.accessTokenExpiry });
        logger_1.logger.info({ userId }, 'Access token refreshed');
        res.json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map