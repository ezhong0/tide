/**
 * Express Request type augmentation
 * Adds custom properties to Express Request interface
 */

import { Request } from 'express';

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
