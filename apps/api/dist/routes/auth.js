import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { encrypt } from '../utils/encryption.js';
import { env } from '../config/env.js';
/**
 * Authentication routes
 */
export async function authRoutes(app) {
    // Google OAuth - Start flow
    app.get('/auth/google', async (request, reply) => {
        if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
            return reply.status(503).send({
                error: {
                    message: 'Google OAuth not configured',
                    statusCode: 503,
                },
            });
        }
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/calendar',
        ];
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes.join(' '));
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        return reply.redirect(authUrl.toString());
    });
    // Google OAuth - Callback
    app.get('/auth/google/callback', async (request, reply) => {
        const { code } = request.query;
        if (!code) {
            return reply.status(400).send({
                error: {
                    message: 'No authorization code provided',
                    statusCode: 400,
                },
            });
        }
        try {
            // Exchange code for tokens
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: env.GOOGLE_CLIENT_ID,
                    client_secret: env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: env.GOOGLE_REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            });
            const tokens = await tokenResponse.json();
            // Get user info
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });
            const userInfo = await userInfoResponse.json();
            // Encrypt credentials
            const encryptedCredentials = encrypt({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                scope: tokens.scope?.split(' ') || [],
            });
            // Create or update user
            const [user] = await db
                .insert(users)
                .values({
                email: userInfo.email,
                name: userInfo.name,
                emailProvider: 'gmail',
                emailCredentials: encryptedCredentials,
                calendarProvider: 'google',
                calendarCredentials: encryptedCredentials, // Same OAuth tokens
            })
                .onConflictDoUpdate({
                target: users.email,
                set: {
                    emailCredentials: encryptedCredentials,
                    calendarCredentials: encryptedCredentials,
                    lastActiveAt: new Date(),
                },
            })
                .returning();
            // Generate JWT
            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                name: user.name,
            });
            const refreshToken = generateRefreshToken(user.id);
            // Redirect to frontend with tokens
            const redirectUrl = new URL(env.CORS_ORIGIN.split(',')[0]);
            redirectUrl.pathname = '/auth/callback';
            redirectUrl.searchParams.set('access_token', accessToken);
            redirectUrl.searchParams.set('refresh_token', refreshToken);
            return reply.redirect(redirectUrl.toString());
        }
        catch (error) {
            request.log.error({ err: error }, 'Google OAuth callback failed');
            return reply.status(500).send({
                error: {
                    message: 'OAuth authentication failed',
                    statusCode: 500,
                },
            });
        }
    });
    // Microsoft OAuth - Start flow
    app.get('/auth/microsoft', async (request, reply) => {
        if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_CLIENT_SECRET) {
            return reply.status(503).send({
                error: {
                    message: 'Microsoft OAuth not configured',
                    statusCode: 503,
                },
            });
        }
        const scopes = [
            'openid',
            'profile',
            'email',
            'offline_access',
            'https://graph.microsoft.com/Mail.ReadWrite',
            'https://graph.microsoft.com/Calendars.ReadWrite',
        ];
        const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
        authUrl.searchParams.set('client_id', env.MICROSOFT_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', env.MICROSOFT_REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes.join(' '));
        authUrl.searchParams.set('response_mode', 'query');
        return reply.redirect(authUrl.toString());
    });
    // Microsoft OAuth - Callback
    app.get('/auth/microsoft/callback', async (request, reply) => {
        const { code } = request.query;
        if (!code) {
            return reply.status(400).send({
                error: {
                    message: 'No authorization code provided',
                    statusCode: 400,
                },
            });
        }
        try {
            // Exchange code for tokens
            const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: env.MICROSOFT_CLIENT_ID,
                    client_secret: env.MICROSOFT_CLIENT_SECRET,
                    redirect_uri: env.MICROSOFT_REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            });
            const tokens = await tokenResponse.json();
            // Get user info
            const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });
            const userInfo = await userInfoResponse.json();
            // Encrypt credentials
            const encryptedCredentials = encrypt({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                scope: tokens.scope?.split(' ') || [],
            });
            // Create or update user
            const [user] = await db
                .insert(users)
                .values({
                email: userInfo.mail || userInfo.userPrincipalName,
                name: userInfo.displayName,
                emailProvider: 'outlook',
                emailCredentials: encryptedCredentials,
                calendarProvider: 'outlook',
                calendarCredentials: encryptedCredentials,
            })
                .onConflictDoUpdate({
                target: users.email,
                set: {
                    emailCredentials: encryptedCredentials,
                    calendarCredentials: encryptedCredentials,
                    lastActiveAt: new Date(),
                },
            })
                .returning();
            // Generate JWT
            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                name: user.name,
            });
            const refreshToken = generateRefreshToken(user.id);
            // Redirect to frontend with tokens
            const redirectUrl = new URL(env.CORS_ORIGIN.split(',')[0]);
            redirectUrl.pathname = '/auth/callback';
            redirectUrl.searchParams.set('access_token', accessToken);
            redirectUrl.searchParams.set('refresh_token', refreshToken);
            return reply.redirect(redirectUrl.toString());
        }
        catch (error) {
            request.log.error({ err: error }, 'Microsoft OAuth callback failed');
            return reply.status(500).send({
                error: {
                    message: 'OAuth authentication failed',
                    statusCode: 500,
                },
            });
        }
    });
    // Get current user
    app.get('/auth/me', {
        preHandler: async (request, reply) => {
            const { authenticate: auth } = await import('../middleware/auth.js');
            await auth(request, reply);
        },
        handler: async (request, reply) => {
            const [user] = await db
                .select({
                id: users.id,
                email: users.email,
                name: users.name,
                emailProvider: users.emailProvider,
                calendarProvider: users.calendarProvider,
                timezone: users.timezone,
                createdAt: users.createdAt,
            })
                .from(users)
                .where(eq(users.id, request.user.id));
            if (!user) {
                return reply.status(404).send({
                    error: {
                        message: 'User not found',
                        statusCode: 404,
                    },
                });
            }
            return user;
        },
    });
    // Logout (client-side token removal)
    app.post('/auth/logout', {
        preHandler: async (request, reply) => {
            const { authenticate: auth } = await import('../middleware/auth.js');
            await auth(request, reply);
        },
        handler: async (request, reply) => {
            // In a real implementation, you might want to:
            // 1. Revoke OAuth tokens
            // 2. Add JWT to blacklist (if using Redis)
            // 3. Clear session data
            return { success: true };
        },
    });
}
//# sourceMappingURL=auth.js.map