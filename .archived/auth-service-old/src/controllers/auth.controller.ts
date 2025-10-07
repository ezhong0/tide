import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne, transaction } from '@tide/database';
import { logger } from '@tide/logger';
import { AuthErrors } from '@tide/errors';
import { jwtConfig, bcryptConfig } from '@tide/config';
import { createUserId } from '@tide/types';
import type { PoolClient } from 'pg';

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: boolean;
  status: string;
}

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
}

/**
 * Register a new user
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, timezone = 'UTC' } = req.body;

    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`.trim();

    // Check if user already exists
    const existingUser = await queryOne<User>(
      'SELECT id FROM tide.users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser) {
      throw AuthErrors.userAlreadyExists(email);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, bcryptConfig.saltRounds);

    // Create user and profile in transaction
    const result = await transaction(async (client: PoolClient) => {
      // Create user
      const [user] = await client.query<User>(
        `INSERT INTO tide.users (email, password_hash, name, timezone, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING id, email, name, email_verified, status, created_at`,
        [email.toLowerCase(), passwordHash, name, timezone]
      ).then(r => r.rows);

      // Create user profile
      await client.query(
        `INSERT INTO tide.user_profiles (user_id, preferences)
         VALUES ($1, $2)`,
        [user.id, JSON.stringify({})]
      );

      return user;
    });

    const userId = createUserId(result.id);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: userId, email: result.email, type: 'access' },
      jwtConfig.accessTokenSecret,
      { expiresIn: jwtConfig.accessTokenExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: userId, type: 'refresh' },
      jwtConfig.refreshTokenSecret,
      { expiresIn: jwtConfig.refreshTokenExpiry } as jwt.SignOptions
    );

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await query(
      `INSERT INTO tide.refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [result.id, refreshToken, expiresAt]
    );

    logger.info({ userId, email: result.email }, 'User registered successfully');

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
  } catch (error) {
    next(error);
  }
}

/**
 * Login with email and password
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Get user
    const user = await queryOne<User>(
      `SELECT id, email, name, password_hash, email_verified, status
       FROM tide.users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email.toLowerCase()]
    );

    if (!user) {
      throw AuthErrors.invalidCredentials();
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw AuthErrors.accountSuspended();
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw AuthErrors.invalidCredentials();
    }

    const userId = createUserId(user.id);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: userId, email: user.email, type: 'access' },
      jwtConfig.accessTokenSecret,
      { expiresIn: jwtConfig.accessTokenExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: userId, type: 'refresh' },
      jwtConfig.refreshTokenSecret,
      { expiresIn: jwtConfig.refreshTokenExpiry } as jwt.SignOptions
    );

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await query(
      `INSERT INTO tide.refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    // Update last login
    await query(
      'UPDATE tide.users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    logger.info({ userId, email: user.email }, 'User logged in successfully');

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
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw AuthErrors.invalidToken();
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret);
    } catch (error) {
      throw AuthErrors.invalidToken();
    }

    if (decoded.type !== 'refresh') {
      throw AuthErrors.invalidToken();
    }

    // Check if refresh token exists and is not expired
    const storedToken = await queryOne<RefreshTokenRow>(
      `SELECT id, user_id, expires_at
       FROM tide.refresh_tokens
       WHERE token = $1 AND revoked_at IS NULL`,
      [refreshToken]
    );

    if (!storedToken) {
      throw AuthErrors.invalidToken();
    }

    // Check expiration
    if (new Date(storedToken.expires_at) < new Date()) {
      throw AuthErrors.tokenExpired();
    }

    // Get user
    const user = await queryOne<User>(
      `SELECT id, email, name, status
       FROM tide.users
       WHERE id = $1 AND deleted_at IS NULL`,
      [storedToken.user_id]
    );

    if (!user || user.status !== 'active') {
      throw AuthErrors.invalidToken();
    }

    const userId = createUserId(user.id);

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: userId, email: user.email, type: 'access' },
      jwtConfig.accessTokenSecret,
      { expiresIn: jwtConfig.accessTokenExpiry } as jwt.SignOptions
    );

    logger.info({ userId }, 'Access token refreshed');

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
}
