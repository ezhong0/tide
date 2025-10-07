import { Request, Response, NextFunction } from 'express';
import { TideError } from '@tide/errors';
/**
 * Global error handling middleware
 */
export declare function errorHandler(error: Error | TideError, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=error-handler.d.ts.map