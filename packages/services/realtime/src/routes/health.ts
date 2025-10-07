import { Router, Request, Response } from 'express';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', (req: Request, res: Response) => {
  const uptime = (Date.now() - startTime) / 1000;

  res.json({
    status: 'healthy',
    service: 'realtime-service',
    timestamp: new Date().toISOString(),
    uptime,
    version: '0.1.0',
    websocket: {
      enabled: true,
      path: '/realtime'
    }
  });
});
