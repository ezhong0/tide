import { z } from 'zod';
declare const JWTPayloadSchema: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    iat: z.ZodNumber;
    exp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    userId: string;
    iat: number;
    exp: number;
}, {
    email: string;
    name: string;
    userId: string;
    iat: number;
    exp: number;
}>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
/**
 * Generate JWT access token
 */
export declare function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
/**
 * Generate JWT refresh token
 */
export declare function generateRefreshToken(userId: string): string;
/**
 * Verify and decode JWT token
 */
export declare function verifyToken(token: string): JWTPayload;
/**
 * Decode token without verification (for debugging)
 */
export declare function decodeToken(token: string): JWTPayload | null;
export {};
//# sourceMappingURL=jwt.d.ts.map