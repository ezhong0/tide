import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { databaseConfig, jwtConfig } from '@tide/config';
import app from '../../index';

/**
 * Auth Service Integration Tests
 *
 * Tests critical authentication flows:
 * - User registration
 * - User login
 * - Token refresh
 * - Invalid credentials handling
 */

describe('Auth Service - Critical Flows', () => {
  let pool: Pool;
  const testEmail = `test-${Date.now()}@tide.test`;
  const testPassword = 'TestPassword123!';
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Initialize database connection
    pool = new Pool({
      connectionString: databaseConfig.url,
      ssl: false,
      max: 5,
    });

    // Test connection
    await pool.query('SELECT 1');
  });

  afterAll(async () => {
    // Cleanup test user
    await pool.query('DELETE FROM tide.users WHERE email = $1', [testEmail]);
    await pool.end();
  });

  describe('Infrastructure Health', () => {
    it('should connect to PostgreSQL', async () => {
      const result = await pool.query('SELECT 1 as value');
      expect(result.rows[0].value).toBe(1);
    });

    it('should have users table', async () => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'tide'
          AND table_name = 'users'
      `);
      expect(result.rows).toHaveLength(1);
    });

    it('should respond to health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
          timezone: 'America/New_York',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user.name).toBe('Test User');

      // Store tokens for later tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      // Verify tokens are valid JWTs
      const decodedAccess = jwt.decode(accessToken) as any;
      expect(decodedAccess.type).toBe('access');
      expect(decodedAccess.email).toBe(testEmail);

      const decodedRefresh = jwt.decode(refreshToken) as any;
      expect(decodedRefresh.type).toBe('refresh');
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'Duplicate',
        });

      expect(response.status).toBe(409); // Conflict
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: testEmail,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testEmail);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@tide.test',
          password: testPassword,
        });

      expect(response.status).toBe(401);
    });

    it('should be case-insensitive for email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail.toUpperCase(),
          password: testPassword,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');

      // Verify new access token is valid
      const decoded = jwt.decode(response.body.accessToken) as any;
      expect(decoded.type).toBe('access');
      expect(decoded.email).toBe(testEmail);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid.token.here',
        });

      expect(response.status).toBe(401);
    });

    it('should reject expired refresh token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 'test_user', type: 'refresh' },
        jwtConfig.refreshTokenSecret,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: expiredToken,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Performance Requirements', () => {
    it('should complete registration in <500ms', async () => {
      const uniqueEmail = `perf-${Date.now()}@tide.test`;
      const startTime = Date.now();

      await request(app)
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: testPassword,
          firstName: 'Perf',
          lastName: 'Test',
        });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500);

      // Cleanup
      await pool.query('DELETE FROM tide.users WHERE email = $1', [uniqueEmail]);
    });

    it('should complete login in <300ms', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Security', () => {
    it('should hash passwords (not store plaintext)', async () => {
      const result = await pool.query(
        'SELECT password_hash FROM tide.users WHERE email = $1',
        [testEmail]
      );

      const hash = result.rows[0].password_hash;
      // bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
      expect(hash).not.toBe(testPassword);
    });

    it('should store refresh tokens', async () => {
      const result = await pool.query(
        `SELECT COUNT(*) as count
         FROM tide.refresh_tokens rt
         JOIN tide.users u ON rt.user_id = u.id
         WHERE u.email = $1 AND rt.revoked_at IS NULL`,
        [testEmail]
      );

      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });

    it('should have proper token expiration times', async () => {
      const decoded = jwt.decode(accessToken) as any;
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;

      // Access token should expire in ~15 minutes (900 seconds)
      expect(expiresIn).toBeGreaterThan(0);
      expect(expiresIn).toBeLessThan(1200); // 20 minutes max
    });
  });
});
