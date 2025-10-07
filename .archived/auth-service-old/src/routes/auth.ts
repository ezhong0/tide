import { Router } from 'express';
import { validateBody } from '@tide/validation';
import { UserRegistrationSchema, UserLoginSchema } from '@tide/validation';
import { register, login, refreshToken } from '../controllers/auth.controller';
import { authRateLimiter, tokenRefreshLimiter } from '../middleware/rate-limiter';

export const authRouter: Router = Router();

/**
 * POST /auth/register
 * Register a new user
 * Rate limited: 5 requests per 15 minutes per IP
 */
authRouter.post(
  '/register',
  authRateLimiter,
  validateBody(UserRegistrationSchema),
  register
);

/**
 * POST /auth/login
 * Login with email and password
 * Rate limited: 5 requests per 15 minutes per IP
 */
authRouter.post(
  '/login',
  authRateLimiter,
  validateBody(UserLoginSchema),
  login
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * Rate limited: 10 requests per 15 minutes per IP
 */
authRouter.post('/refresh', tokenRefreshLimiter, refreshToken);
