import crypto from 'crypto';
import { User, UserId, DomainEvent } from '@tide/types';
import { createLogger } from '@tide/utils';
import { EventBus } from '@tide/event-bus';
import { DatabaseClient } from './db/client.js';
import { JWTService } from './utils/jwt.js';
import { PasswordService } from './utils/password.js';

const logger = createLogger('auth-service');

export class AuthService {
  constructor(
    private db: DatabaseClient,
    private jwt: JWTService,
    private password: PasswordService,
    private eventBus: EventBus
  ) {}

  getRouter() {
    return {
      register: async ({ body }: any) => {
        try {
          // Validate password
          const validation = this.password.validate(body.password);
          if (!validation.valid) {
            return {
              status: 400 as const,
              body: {
                code: 'VALIDATION_ERROR' as const,
                message: validation.errors.join(', '),
                timestamp: Date.now(),
              },
            };
          }

          // Check if user already exists
          const existingUser = await this.db.query(
            'SELECT id FROM tide.users WHERE email = $1',
            [body.email]
          );

          if (existingUser.rows.length > 0) {
            return {
              status: 409 as const,
              body: {
                code: 'VALIDATION_ERROR' as const,
                message: 'User with this email already exists',
                timestamp: Date.now(),
              },
            };
          }

          // Hash password
          const { hash, salt } = await this.password.hash(body.password);

          // Create user and credentials in a transaction
          const result = await this.db.transaction(async (client) => {
            // Create user
            const userResult = await client.query<User>(
              `INSERT INTO tide.users (email, name, timezone, locale)
               VALUES ($1, $2, $3, $4)
               RETURNING *`,
              [body.email, body.name, body.timezone, body.locale || 'en-US']
            );

            const user = userResult.rows[0]!;

            // Create credentials
            await client.query(
              `INSERT INTO auth.credentials (user_id, password_hash, password_salt)
               VALUES ($1, $2, $3)`,
              [user.id, hash, salt]
            );

            return user;
          });

          // Generate tokens
          const tokens = this.jwt.generateTokenPair(result.id, result.email);

          // Store refresh token
          const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

          await this.db.query(
            `INSERT INTO auth.refresh_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [result.id, tokenHash, expiresAt]
          );

          // Publish user created event
          const event: DomainEvent = {
            id: crypto.randomUUID(),
            type: 'user.created',
            aggregateId: result.id,
            aggregateType: 'user',
            payload: { user: result },
            metadata: {
              userId: result.id as UserId,
              timestamp: Date.now(),
              version: 1,
            },
          };

          await this.eventBus.publish(event);

          logger.info('User registered', { userId: result.id, email: result.email });

          return {
            status: 201 as const,
            body: {
              user: result,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          };
        } catch (error) {
          logger.error('Registration failed', error as Error);
          return {
            status: 500 as const,
            body: {
              code: 'INTERNAL_ERROR' as const,
              message: 'Registration failed',
              timestamp: Date.now(),
            },
          };
        }
      },

      login: async ({ body }: any) => {
        try {
          // Get user and credentials
          const result = await this.db.query<User & { password_hash: string; password_salt: string }>(
            `SELECT u.*, c.password_hash, c.password_salt
             FROM tide.users u
             JOIN auth.credentials c ON u.id = c.user_id
             WHERE u.email = $1`,
            [body.email]
          );

          if (result.rows.length === 0) {
            return {
              status: 401 as const,
              body: {
                code: 'UNAUTHORIZED' as const,
                message: 'Invalid credentials',
                timestamp: Date.now(),
              },
            };
          }

          const user = result.rows[0]!;

          // Verify password
          const valid = await this.password.verify(
            body.password,
            user.password_hash,
            user.password_salt
          );

          if (!valid) {
            return {
              status: 401 as const,
              body: {
                code: 'UNAUTHORIZED' as const,
                message: 'Invalid credentials',
                timestamp: Date.now(),
              },
            };
          }

          // Generate tokens
          const tokens = this.jwt.generateTokenPair(user.id, user.email);

          // Store refresh token
          const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          await this.db.query(
            `INSERT INTO auth.refresh_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, tokenHash, expiresAt]
          );

          // Update last active
          await this.db.query(
            'UPDATE tide.users SET last_active_at = NOW() WHERE id = $1',
            [user.id]
          );

          logger.info('User logged in', { userId: user.id, email: user.email });

          // Remove sensitive fields
          const { password_hash, password_salt, ...userWithoutPassword } = user;

          return {
            status: 200 as const,
            body: {
              user: userWithoutPassword,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          };
        } catch (error) {
          logger.error('Login failed', error as Error);
          return {
            status: 500 as const,
            body: {
              code: 'INTERNAL_ERROR' as const,
              message: 'Login failed',
              timestamp: Date.now(),
            },
          };
        }
      },

      logout: async () => {
        // In a real implementation, we would:
        // 1. Get the user from the auth context
        // 2. Revoke the refresh token
        // For now, just return success
        return {
          status: 204 as const,
          body: {},
        };
      },

      refreshToken: async ({ body }: any) => {
        try {
          // Verify refresh token
          const payload = this.jwt.verify(body.refreshToken);

          if (payload.type !== 'refresh') {
            return {
              status: 401 as const,
              body: {
                code: 'UNAUTHORIZED' as const,
                message: 'Invalid refresh token',
                timestamp: Date.now(),
              },
            };
          }

          // Check if refresh token exists and is not revoked
          const tokenHash = crypto.createHash('sha256').update(body.refreshToken).digest('hex');

          const tokenResult = await this.db.query(
            `SELECT * FROM auth.refresh_tokens
             WHERE token_hash = $1 AND expires_at > NOW() AND revoked_at IS NULL`,
            [tokenHash]
          );

          if (tokenResult.rows.length === 0) {
            return {
              status: 401 as const,
              body: {
                code: 'UNAUTHORIZED' as const,
                message: 'Invalid or expired refresh token',
                timestamp: Date.now(),
              },
            };
          }

          // Revoke old refresh token
          await this.db.query(
            'UPDATE auth.refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
            [tokenHash]
          );

          // Generate new tokens
          const tokens = this.jwt.generateTokenPair(payload.userId as UserId, payload.email);

          // Store new refresh token
          const newTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          await this.db.query(
            `INSERT INTO auth.refresh_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [payload.userId, newTokenHash, expiresAt]
          );

          logger.info('Token refreshed', { userId: payload.userId });

          return {
            status: 200 as const,
            body: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          };
        } catch (error) {
          logger.error('Token refresh failed', error as Error);
          return {
            status: 401 as const,
            body: {
              code: 'UNAUTHORIZED' as const,
              message: 'Token refresh failed',
              timestamp: Date.now(),
            },
          };
        }
      },

      getCurrentUser: async () => {
        // In a real implementation, we would get the user ID from the auth middleware
        // For now, return a placeholder
        return {
          status: 401 as const,
          body: {
            code: 'UNAUTHORIZED' as const,
            message: 'Not implemented',
            timestamp: Date.now(),
          },
        };
      },

      updateCurrentUser: async () => {
        return {
          status: 401 as const,
          body: {
            code: 'UNAUTHORIZED' as const,
            message: 'Not implemented',
            timestamp: Date.now(),
          },
        };
      },

      changePassword: async () => {
        return {
          status: 204 as const,
          body: {},
        };
      },

      requestPasswordReset: async () => {
        return {
          status: 204 as const,
          body: {},
        };
      },

      resetPassword: async () => {
        return {
          status: 204 as const,
          body: {},
        };
      },
    };
  }
}
