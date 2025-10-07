import { z } from 'zod';
import { EmailSchema, PhoneSchema } from './base.schema';

/**
 * User subscription plans
 */
export const SubscriptionPlanSchema = z.enum(['free', 'professional', 'team', 'enterprise']);
export const SubscriptionStatusSchema = z.enum(['active', 'cancelled', 'expired', 'trialing']);

/**
 * Notification preferences
 */
export const NotificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
});

/**
 * User profile
 */
export const UserProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(), // IANA timezone
  phone: PhoneSchema.optional(),
  bio: z.string().max(500).optional(),
});

/**
 * User preferences
 */
export const UserPreferencesSchema = z.object({
  language: z.string().length(2).default('en'), // ISO 639-1
  notifications: NotificationPreferencesSchema.optional(),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
});

/**
 * User subscription
 */
export const SubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema,
  status: SubscriptionStatusSchema,
  startedAt: z.date(),
  expiresAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  features: z.array(z.string()).optional(),
});

/**
 * Complete user schema
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: EmailSchema,
  emailVerified: z.boolean().default(false),
  profile: UserProfileSchema,
  preferences: UserPreferencesSchema,
  subscription: SubscriptionSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * User registration schema
 */
export const UserRegistrationSchema = z.object({
  email: EmailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  timezone: z.string().optional(),
});

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;

/**
 * User login schema
 */
export const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

/**
 * User update schema
 */
export const UserUpdateSchema = z.object({
  profile: UserProfileSchema.partial().optional(),
  preferences: UserPreferencesSchema.partial().optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: EmailSchema,
});

/**
 * Password reset confirmation schema
 */
export const PasswordResetConfirmSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});
