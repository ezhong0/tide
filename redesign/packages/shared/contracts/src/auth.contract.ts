import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { UserSchema, ErrorResponseSchema } from '@tide/types';

const c = initContract();

export const authContract = c.router({
  // Register
  register: {
    method: 'POST',
    path: '/auth/register',
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string(),
      timezone: z.string(),
      locale: z.string().optional(),
    }),
    responses: {
      201: z.object({
        user: UserSchema,
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
      400: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Register a new user',
  },

  // Login
  login: {
    method: 'POST',
    path: '/auth/login',
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    responses: {
      200: z.object({
        user: UserSchema,
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Login',
  },

  // Logout
  logout: {
    method: 'POST',
    path: '/auth/logout',
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Logout',
  },

  // Refresh token
  refreshToken: {
    method: 'POST',
    path: '/auth/refresh',
    body: z.object({
      refreshToken: z.string(),
    }),
    responses: {
      200: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Refresh access token',
  },

  // Get current user
  getCurrentUser: {
    method: 'GET',
    path: '/auth/me',
    responses: {
      200: UserSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get current user',
  },

  // Update current user
  updateCurrentUser: {
    method: 'PATCH',
    path: '/auth/me',
    body: z.object({
      name: z.string().optional(),
      timezone: z.string().optional(),
      locale: z.string().optional(),
      settings: z.record(z.unknown()).optional(),
    }),
    responses: {
      200: UserSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Update current user',
  },

  // Change password
  changePassword: {
    method: 'POST',
    path: '/auth/change-password',
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }),
    responses: {
      204: z.object({}),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Change password',
  },

  // Request password reset
  requestPasswordReset: {
    method: 'POST',
    path: '/auth/forgot-password',
    body: z.object({
      email: z.string().email(),
    }),
    responses: {
      204: z.object({}),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Request password reset',
  },

  // Reset password
  resetPassword: {
    method: 'POST',
    path: '/auth/reset-password',
    body: z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    }),
    responses: {
      204: z.object({}),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Reset password',
  },
});
