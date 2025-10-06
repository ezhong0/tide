import { FastifyInstance } from 'fastify';
import { createApp } from '../../app.js';

describe('Health Check Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('environment', 'test');
    });

    it('should return valid timestamp format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = JSON.parse(response.body);
      const timestamp = new Date(body.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });

    it('should return uptime as a number', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = JSON.parse(response.body);

      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');

      // Should contain standard Prometheus metrics
      expect(response.body).toContain('process_cpu_user_seconds_total');
      expect(response.body).toContain('nodejs_version_info');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-route',
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('message', 'Route not found');
      expect(body.error).toHaveProperty('statusCode', 404);
      expect(body.error).toHaveProperty('path', '/non-existent-route');
    });
  });
});
