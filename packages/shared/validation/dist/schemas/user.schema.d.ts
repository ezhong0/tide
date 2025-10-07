import { z } from 'zod';
/**
 * User subscription plans
 */
export declare const SubscriptionPlanSchema: z.ZodEnum<["free", "professional", "team", "enterprise"]>;
export declare const SubscriptionStatusSchema: z.ZodEnum<["active", "cancelled", "expired", "trialing"]>;
/**
 * Notification preferences
 */
export declare const NotificationPreferencesSchema: z.ZodObject<{
    email: z.ZodDefault<z.ZodBoolean>;
    push: z.ZodDefault<z.ZodBoolean>;
    sms: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    push: boolean;
    email: boolean;
    sms: boolean;
}, {
    push?: boolean | undefined;
    email?: boolean | undefined;
    sms?: boolean | undefined;
}>;
/**
 * User profile
 */
export declare const UserProfileSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    avatar: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    avatar?: string | undefined;
    timezone?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    avatar?: string | undefined;
    timezone?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
}>;
/**
 * User preferences
 */
export declare const UserPreferencesSchema: z.ZodObject<{
    language: z.ZodDefault<z.ZodString>;
    notifications: z.ZodOptional<z.ZodObject<{
        email: z.ZodDefault<z.ZodBoolean>;
        push: z.ZodDefault<z.ZodBoolean>;
        sms: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        push: boolean;
        email: boolean;
        sms: boolean;
    }, {
        push?: boolean | undefined;
        email?: boolean | undefined;
        sms?: boolean | undefined;
    }>>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
    dateFormat: z.ZodDefault<z.ZodEnum<["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]>>;
    timeFormat: z.ZodDefault<z.ZodEnum<["12h", "24h"]>>;
}, "strip", z.ZodTypeAny, {
    language: string;
    theme: "light" | "dark" | "auto";
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    timeFormat: "12h" | "24h";
    notifications?: {
        push: boolean;
        email: boolean;
        sms: boolean;
    } | undefined;
}, {
    language?: string | undefined;
    notifications?: {
        push?: boolean | undefined;
        email?: boolean | undefined;
        sms?: boolean | undefined;
    } | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
    dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
    timeFormat?: "12h" | "24h" | undefined;
}>;
/**
 * User subscription
 */
export declare const SubscriptionSchema: z.ZodObject<{
    plan: z.ZodEnum<["free", "professional", "team", "enterprise"]>;
    status: z.ZodEnum<["active", "cancelled", "expired", "trialing"]>;
    startedAt: z.ZodDate;
    expiresAt: z.ZodOptional<z.ZodDate>;
    cancelledAt: z.ZodOptional<z.ZodDate>;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "cancelled" | "expired" | "trialing";
    plan: "free" | "professional" | "team" | "enterprise";
    startedAt: Date;
    expiresAt?: Date | undefined;
    cancelledAt?: Date | undefined;
    features?: string[] | undefined;
}, {
    status: "active" | "cancelled" | "expired" | "trialing";
    plan: "free" | "professional" | "team" | "enterprise";
    startedAt: Date;
    expiresAt?: Date | undefined;
    cancelledAt?: Date | undefined;
    features?: string[] | undefined;
}>;
/**
 * Complete user schema
 */
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    emailVerified: z.ZodDefault<z.ZodBoolean>;
    profile: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    }>;
    preferences: z.ZodObject<{
        language: z.ZodDefault<z.ZodString>;
        notifications: z.ZodOptional<z.ZodObject<{
            email: z.ZodDefault<z.ZodBoolean>;
            push: z.ZodDefault<z.ZodBoolean>;
            sms: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            push: boolean;
            email: boolean;
            sms: boolean;
        }, {
            push?: boolean | undefined;
            email?: boolean | undefined;
            sms?: boolean | undefined;
        }>>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
        dateFormat: z.ZodDefault<z.ZodEnum<["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]>>;
        timeFormat: z.ZodDefault<z.ZodEnum<["12h", "24h"]>>;
    }, "strip", z.ZodTypeAny, {
        language: string;
        theme: "light" | "dark" | "auto";
        dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
        timeFormat: "12h" | "24h";
        notifications?: {
            push: boolean;
            email: boolean;
            sms: boolean;
        } | undefined;
    }, {
        language?: string | undefined;
        notifications?: {
            push?: boolean | undefined;
            email?: boolean | undefined;
            sms?: boolean | undefined;
        } | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
        timeFormat?: "12h" | "24h" | undefined;
    }>;
    subscription: z.ZodObject<{
        plan: z.ZodEnum<["free", "professional", "team", "enterprise"]>;
        status: z.ZodEnum<["active", "cancelled", "expired", "trialing"]>;
        startedAt: z.ZodDate;
        expiresAt: z.ZodOptional<z.ZodDate>;
        cancelledAt: z.ZodOptional<z.ZodDate>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "cancelled" | "expired" | "trialing";
        plan: "free" | "professional" | "team" | "enterprise";
        startedAt: Date;
        expiresAt?: Date | undefined;
        cancelledAt?: Date | undefined;
        features?: string[] | undefined;
    }, {
        status: "active" | "cancelled" | "expired" | "trialing";
        plan: "free" | "professional" | "team" | "enterprise";
        startedAt: Date;
        expiresAt?: Date | undefined;
        cancelledAt?: Date | undefined;
        features?: string[] | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastLoginAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: string;
    emailVerified: boolean;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    };
    preferences: {
        language: string;
        theme: "light" | "dark" | "auto";
        dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
        timeFormat: "12h" | "24h";
        notifications?: {
            push: boolean;
            email: boolean;
            sms: boolean;
        } | undefined;
    };
    subscription: {
        status: "active" | "cancelled" | "expired" | "trialing";
        plan: "free" | "professional" | "team" | "enterprise";
        startedAt: Date;
        expiresAt?: Date | undefined;
        cancelledAt?: Date | undefined;
        features?: string[] | undefined;
    };
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date | undefined;
}, {
    email: string;
    id: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    };
    preferences: {
        language?: string | undefined;
        notifications?: {
            push?: boolean | undefined;
            email?: boolean | undefined;
            sms?: boolean | undefined;
        } | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
        timeFormat?: "12h" | "24h" | undefined;
    };
    subscription: {
        status: "active" | "cancelled" | "expired" | "trialing";
        plan: "free" | "professional" | "team" | "enterprise";
        startedAt: Date;
        expiresAt?: Date | undefined;
        cancelledAt?: Date | undefined;
        features?: string[] | undefined;
    };
    createdAt: Date;
    updatedAt: Date;
    emailVerified?: boolean | undefined;
    lastLoginAt?: Date | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
/**
 * User registration schema
 */
export declare const UserRegistrationSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    timezone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    timezone?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    timezone?: string | undefined;
}>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
/**
 * User login schema
 */
export declare const UserLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
/**
 * User update schema
 */
export declare const UserUpdateSchema: z.ZodObject<{
    profile: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        timezone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        firstName?: string | undefined;
        lastName?: string | undefined;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    }, {
        firstName?: string | undefined;
        lastName?: string | undefined;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    }>>;
    preferences: z.ZodOptional<z.ZodObject<{
        language: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        notifications: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            email: z.ZodDefault<z.ZodBoolean>;
            push: z.ZodDefault<z.ZodBoolean>;
            sms: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            push: boolean;
            email: boolean;
            sms: boolean;
        }, {
            push?: boolean | undefined;
            email?: boolean | undefined;
            sms?: boolean | undefined;
        }>>>;
        theme: z.ZodOptional<z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>>;
        dateFormat: z.ZodOptional<z.ZodDefault<z.ZodEnum<["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]>>>;
        timeFormat: z.ZodOptional<z.ZodDefault<z.ZodEnum<["12h", "24h"]>>>;
    }, "strip", z.ZodTypeAny, {
        language?: string | undefined;
        notifications?: {
            push: boolean;
            email: boolean;
            sms: boolean;
        } | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
        timeFormat?: "12h" | "24h" | undefined;
    }, {
        language?: string | undefined;
        notifications?: {
            push?: boolean | undefined;
            email?: boolean | undefined;
            sms?: boolean | undefined;
        } | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
        timeFormat?: "12h" | "24h" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    profile?: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    } | undefined;
    preferences?: {
        language?: string | undefined;
        notifications?: {
            push: boolean;
            email: boolean;
            sms: boolean;
        } | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
        timeFormat?: "12h" | "24h" | undefined;
    } | undefined;
}, {
    profile?: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        avatar?: string | undefined;
        timezone?: string | undefined;
        phone?: string | undefined;
        bio?: string | undefined;
    } | undefined;
    preferences?: {
        language?: string | undefined;
        notifications?: {
            push?: boolean | undefined;
            email?: boolean | undefined;
            sms?: boolean | undefined;
        } | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | undefined;
        timeFormat?: "12h" | "24h" | undefined;
    } | undefined;
}>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
/**
 * Password reset request schema
 */
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
/**
 * Password reset confirmation schema
 */
export declare const PasswordResetConfirmSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
