/**
 * Authentication API Contracts
 *
 * Zod schemas for authentication endpoints
 */
import { z } from 'zod';
export declare const RefreshTokenRequestSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const RevokeTokenRequestSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    emailProvider: z.ZodEnum<["gmail", "outlook"]>;
    calendarProvider: z.ZodEnum<["google", "outlook"]>;
    timezone: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name: string;
    emailProvider: "gmail" | "outlook";
    calendarProvider: "outlook" | "google";
    timezone: string;
    createdAt: string;
}, {
    id: string;
    email: string;
    name: string;
    emailProvider: "gmail" | "outlook";
    calendarProvider: "outlook" | "google";
    timezone: string;
    createdAt: string;
}>;
export declare const TokenPairSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
    tokenType: z.ZodDefault<z.ZodLiteral<"Bearer">>;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType?: "Bearer" | undefined;
}>;
export declare const GetCurrentUserResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    emailProvider: z.ZodEnum<["gmail", "outlook"]>;
    calendarProvider: z.ZodEnum<["google", "outlook"]>;
    timezone: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name: string;
    emailProvider: "gmail" | "outlook";
    calendarProvider: "outlook" | "google";
    timezone: string;
    createdAt: string;
}, {
    id: string;
    email: string;
    name: string;
    emailProvider: "gmail" | "outlook";
    calendarProvider: "outlook" | "google";
    timezone: string;
    createdAt: string;
}>;
export declare const RefreshTokenResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
    tokenType: z.ZodDefault<z.ZodLiteral<"Bearer">>;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType?: "Bearer" | undefined;
}>;
export declare const LogoutResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
}>;
export declare const RevokeTokenResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
}>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type RevokeTokenRequest = z.infer<typeof RevokeTokenRequestSchema>;
export type RevokeTokenResponse = z.infer<typeof RevokeTokenResponseSchema>;
export type GetCurrentUserResponse = z.infer<typeof GetCurrentUserResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export declare const AuthContracts: {
    readonly getCurrentUser: {
        readonly method: "GET";
        readonly path: "/auth/me";
        readonly request: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
        readonly response: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
            emailProvider: z.ZodEnum<["gmail", "outlook"]>;
            calendarProvider: z.ZodEnum<["google", "outlook"]>;
            timezone: z.ZodString;
            createdAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            email: string;
            name: string;
            emailProvider: "gmail" | "outlook";
            calendarProvider: "outlook" | "google";
            timezone: string;
            createdAt: string;
        }, {
            id: string;
            email: string;
            name: string;
            emailProvider: "gmail" | "outlook";
            calendarProvider: "outlook" | "google";
            timezone: string;
            createdAt: string;
        }>;
    };
    readonly logout: {
        readonly method: "POST";
        readonly path: "/auth/logout";
        readonly request: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            success: boolean;
        }, {
            message: string;
            success: boolean;
        }>;
    };
    readonly refreshToken: {
        readonly method: "POST";
        readonly path: "/auth/refresh";
        readonly request: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
        }, {
            refreshToken: string;
        }>;
        readonly response: z.ZodObject<{
            accessToken: z.ZodString;
            refreshToken: z.ZodString;
            expiresIn: z.ZodNumber;
            tokenType: z.ZodDefault<z.ZodLiteral<"Bearer">>;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
            accessToken: string;
            expiresIn: number;
            tokenType: "Bearer";
        }, {
            refreshToken: string;
            accessToken: string;
            expiresIn: number;
            tokenType?: "Bearer" | undefined;
        }>;
    };
    readonly revokeToken: {
        readonly method: "POST";
        readonly path: "/auth/revoke";
        readonly request: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
        }, {
            refreshToken: string;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            success: boolean;
        }, {
            message: string;
            success: boolean;
        }>;
    };
};
//# sourceMappingURL=auth.contracts.d.ts.map