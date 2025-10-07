import { Request, Response, NextFunction } from 'express';
/**
 * Register a new user
 */
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Login with email and password
 */
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Refresh access token using refresh token
 */
export declare function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map