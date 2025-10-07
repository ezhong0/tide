import { Router } from 'express';
import { query } from '@tide/database';
import { logger } from '@tide/logger';

export const healthRouter: Router = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');

    res.json({
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(503).json({
      status: 'unhealthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});
