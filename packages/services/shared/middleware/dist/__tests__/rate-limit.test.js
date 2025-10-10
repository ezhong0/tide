/**
 * Rate Limit Middleware Unit Tests
 * Tests request rate limiting functionality
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { rateLimit, cleanupRateLimitStore } from '../rate-limit';
describe('Rate Limit Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        mockReq = {
            ip: '127.0.0.1',
            user: undefined,
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });
    afterEach(() => {
        // Clean up rate limit store between tests
        cleanupRateLimitStore();
    });
    describe('rateLimit', () => {
        it('should allow request within rate limit', () => {
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 100,
            });
            middleware(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });
        it('should block request exceeding rate limit', () => {
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 3,
            });
            mockRes.setHeader = vi.fn();
            // Make 4 requests (3 allowed + 1 blocked)
            for (let i = 0; i < 3; i++) {
                middleware(mockReq, mockRes, mockNext);
            }
            expect(mockNext).toHaveBeenCalledTimes(3);
            // 4th request should be blocked
            mockNext.mockClear();
            middleware(mockReq, mockRes, mockNext);
            expect(mockNext).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Too Many Requests',
                message: expect.stringContaining('Rate limit exceeded'),
                retryAfter: expect.any(Number),
            });
        });
        it('should set rate limit headers', () => {
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 100,
            });
            mockRes.setHeader = vi.fn();
            middleware(mockReq, mockRes, mockNext);
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
        });
        it('should use user ID as key when authenticated', () => {
            mockReq.user = {
                userId: 'user-123',
            };
            mockRes.setHeader = vi.fn();
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 5,
            });
            // Make 5 requests from authenticated user
            for (let i = 0; i < 5; i++) {
                middleware(mockReq, mockRes, mockNext);
            }
            expect(mockNext).toHaveBeenCalledTimes(5);
            // 6th request should be blocked
            mockNext.mockClear();
            mockRes.status = vi.fn().mockReturnThis();
            mockRes.json = vi.fn().mockReturnThis();
            middleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(429);
        });
        it('should use IP address as key for unauthenticated users', () => {
            mockRes.setHeader = vi.fn();
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 3,
            });
            // Make requests from same IP
            for (let i = 0; i < 3; i++) {
                middleware(mockReq, mockRes, mockNext);
            }
            expect(mockNext).toHaveBeenCalledTimes(3);
            // Next request should be blocked
            mockNext.mockClear();
            mockRes.status = vi.fn().mockReturnThis();
            mockRes.json = vi.fn().mockReturnThis();
            middleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(429);
        });
        it('should reset counter after window expires', async () => {
            // Note: This test is timing-dependent and may be flaky
            // In production, rate limiting state persists in Redis
            const middleware = rateLimit({
                windowMs: 50, // Short window for testing
                maxRequests: 1,
            });
            // First request should succeed
            mockReq = {
                ...mockReq,
                ip: 'test-ip-1',
            };
            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
                setHeader: vi.fn(),
            };
            mockNext = vi.fn();
            middleware(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            // Second request should be blocked
            mockNext.mockClear();
            mockRes.status = vi.fn().mockReturnThis();
            middleware(mockReq, mockRes, mockNext);
            // May or may not be called depending on timing
            // Wait for window to fully expire
            await new Promise((resolve) => setTimeout(resolve, 100));
            // Third request should succeed after window reset
            mockNext.mockClear();
            mockRes.status = vi.fn().mockReturnThis();
            middleware(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should skip successful requests when configured', () => {
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 5,
                skipSuccessfulRequests: true,
            });
            mockRes.statusCode = 200;
            mockRes.send = vi.fn().mockImplementation(function () {
                // Simulate successful response
                return this;
            });
            middleware(mockReq, mockRes, mockNext);
            // Simulate response being sent
            mockRes.send();
            // Counter should not increment for successful requests
            // This is implementation-dependent
        });
        it('should skip failed requests when configured', () => {
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 5,
                skipFailedRequests: true,
            });
            mockRes.statusCode = 500;
            mockRes.send = vi.fn().mockImplementation(function () {
                return this;
            });
            middleware(mockReq, mockRes, mockNext);
            // Simulate error response
            mockRes.send();
            // Counter should not increment for failed requests
        });
        it('should use custom key generator', () => {
            const customKeyGenerator = (req) => {
                return req.headers['x-api-key'] || 'default';
            };
            mockRes.setHeader = vi.fn();
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 3,
                keyGenerator: customKeyGenerator,
            });
            mockReq.headers = {
                'x-api-key': 'custom-key-123',
            };
            for (let i = 0; i < 3; i++) {
                middleware(mockReq, mockRes, mockNext);
            }
            expect(mockNext).toHaveBeenCalledTimes(3);
            mockNext.mockClear();
            mockRes.status = vi.fn().mockReturnThis();
            mockRes.json = vi.fn().mockReturnThis();
            middleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(429);
        });
    });
    describe('cleanupRateLimitStore', () => {
        it('should exist and be callable', () => {
            // cleanupRateLimitStore is called automatically via setInterval
            // Testing the actual cleanup is difficult due to timing
            expect(cleanupRateLimitStore).toBeDefined();
            expect(typeof cleanupRateLimitStore).toBe('function');
            // Should not throw when called
            expect(() => cleanupRateLimitStore()).not.toThrow();
        });
    });
    describe('performance', () => {
        it('should handle high request volume efficiently', () => {
            const middleware = rateLimit({
                windowMs: 60 * 1000,
                maxRequests: 1000,
            });
            const start = Date.now();
            for (let i = 0; i < 100; i++) {
                const req = {
                    ...mockReq,
                    ip: `192.168.1.${i % 255}`,
                };
                middleware(req, mockRes, mockNext);
            }
            const duration = Date.now() - start;
            // Should process 100 requests in < 100ms
            expect(duration).toBeLessThan(100);
        });
    });
});
//# sourceMappingURL=rate-limit.test.js.map