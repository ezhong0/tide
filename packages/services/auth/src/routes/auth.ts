import { Router } from 'express';
import { validateBody } from '@tide/validation';
import { UserRegistrationSchema, UserLoginSchema } from '@tide/validation';
import { register, login, refreshToken } from '../controllers/auth.controller';

export const authRouter: Router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
authRouter.post('/register', validateBody(UserRegistrationSchema), register);

/**
 * POST /auth/login
 * Login with email and password
 */
authRouter.post('/login', validateBody(UserLoginSchema), login);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
authRouter.post('/refresh', refreshToken);
