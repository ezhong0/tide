"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetConfirmSchema = exports.PasswordResetRequestSchema = exports.UserUpdateSchema = exports.UserLoginSchema = exports.UserRegistrationSchema = exports.UserSchema = exports.SubscriptionSchema = exports.UserPreferencesSchema = exports.UserProfileSchema = exports.NotificationPreferencesSchema = exports.SubscriptionStatusSchema = exports.SubscriptionPlanSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
/**
 * User subscription plans
 */
exports.SubscriptionPlanSchema = zod_1.z.enum(['free', 'professional', 'team', 'enterprise']);
exports.SubscriptionStatusSchema = zod_1.z.enum(['active', 'cancelled', 'expired', 'trialing']);
/**
 * Notification preferences
 */
exports.NotificationPreferencesSchema = zod_1.z.object({
    email: zod_1.z.boolean().default(true),
    push: zod_1.z.boolean().default(true),
    sms: zod_1.z.boolean().default(false),
});
/**
 * User profile
 */
exports.UserProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    avatar: zod_1.z.string().url().optional(),
    timezone: zod_1.z.string().optional(), // IANA timezone
    phone: base_schema_1.PhoneSchema.optional(),
    bio: zod_1.z.string().max(500).optional(),
});
/**
 * User preferences
 */
exports.UserPreferencesSchema = zod_1.z.object({
    language: zod_1.z.string().length(2).default('en'), // ISO 639-1
    notifications: exports.NotificationPreferencesSchema.optional(),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).default('auto'),
    dateFormat: zod_1.z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
    timeFormat: zod_1.z.enum(['12h', '24h']).default('12h'),
});
/**
 * User subscription
 */
exports.SubscriptionSchema = zod_1.z.object({
    plan: exports.SubscriptionPlanSchema,
    status: exports.SubscriptionStatusSchema,
    startedAt: zod_1.z.date(),
    expiresAt: zod_1.z.date().optional(),
    cancelledAt: zod_1.z.date().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Complete user schema
 */
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: base_schema_1.EmailAddressSchema,
    emailVerified: zod_1.z.boolean().default(false),
    profile: exports.UserProfileSchema,
    preferences: exports.UserPreferencesSchema,
    subscription: exports.SubscriptionSchema,
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    lastLoginAt: zod_1.z.date().optional(),
});
/**
 * User registration schema
 */
exports.UserRegistrationSchema = zod_1.z.object({
    email: base_schema_1.EmailAddressSchema,
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    timezone: zod_1.z.string().optional(),
});
/**
 * User login schema
 */
exports.UserLoginSchema = zod_1.z.object({
    email: base_schema_1.EmailAddressSchema,
    password: zod_1.z.string().min(1),
});
/**
 * User update schema
 */
exports.UserUpdateSchema = zod_1.z.object({
    profile: exports.UserProfileSchema.partial().optional(),
    preferences: exports.UserPreferencesSchema.partial().optional(),
});
/**
 * Password reset request schema
 */
exports.PasswordResetRequestSchema = zod_1.z.object({
    email: base_schema_1.EmailAddressSchema,
});
/**
 * Password reset confirmation schema
 */
exports.PasswordResetConfirmSchema = zod_1.z.object({
    token: zod_1.z.string().uuid(),
    newPassword: zod_1.z.string()
        .min(8)
        .max(128)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/),
});
