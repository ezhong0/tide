/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email?: string;
                role?: string;
            };
        }
    }
}
/**
 * JWT Authentication Middleware
 * Validates JWT token from Authorization header
 */
export declare const authenticateJWT: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Role-based Authorization Middleware
 * Requires specific role(s) to access endpoint
 */
export declare const requireRole: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Helper to get user ID from request
 */
export declare const getUserId: (req: Request) => string | undefined;
/**
 * Helper to require user ID from request
 */
export declare const requireUserId: (req: Request, res: Response) => string | null;
//# sourceMappingURL=auth.d.ts.map