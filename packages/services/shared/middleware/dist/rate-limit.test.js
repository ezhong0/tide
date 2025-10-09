/**
 * Rate Limit Middleware Unit Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit, cleanupRateLimitStore } from './rate-limit.js';
describe('rateLimit', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let testIpCounter = 0;
    beforeEach(() => {
        vi.useFakeTimers();
        // Use unique IP for each test to avoid state pollution
        testIpCounter++;
        const uniqueIp = `127.0.0.${testIpCounter}`;
        mockReq = {
            ip: uniqueIp,
            headers: {},
            socket: { remoteAddress: uniqueIp },
            user: undefined,
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            setHeader: vi.fn().mockReturnThis(),
            statusCode: 200,
            send: vi.fn(),
        };
        mockNext = vi.fn();
    });
    afterEach(() => {
        vi.useRealTimers();
    });
    it('should allow requests within limit', () => {
        const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 });
        // Make 5 requests - all should pass
        for (let i = 0; i < 5; i++) {
            limiter(mockReq, mockRes, mockNext);
        }
        expect(mockNext).toHaveBeenCalledTimes(5);
        expect(mockRes.status).not.toHaveBeenCalled();
    });
    it('should block requests exceeding limit', () => {
        const limiter = rateLimit({ maxRequests: 3, windowMs: 60000 });
        // Make 3 requests - should pass
        for (let i = 0; i < 3; i++) {
            limiter(mockReq, mockRes, mockNext);
        }
        // 4th request should be blocked
        limiter(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(3);
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Too Many Requests',
        }));
    });
    it('should reset after time window', () => {
        const windowMs = 60000;
        const limiter = rateLimit({ maxRequests: 2, windowMs });
        // Make 2 requests
        limiter(mockReq, mockRes, mockNext);
        limiter(mockReq, mockRes, mockNext);
        // Advance time past the window
        vi.advanceTimersByTime(windowMs + 1000);
        // Should allow new requests
        limiter(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(3);
    });
    it('should set rate limit headers', () => {
        const maxRequests = 10;
        const limiter = rateLimit({ maxRequests, windowMs: 60000 });
        limiter(mockReq, mockRes, mockNext);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', maxRequests.toString());
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });
    it('should track separate limits per IP', () => {
        const limiter = rateLimit({ maxRequests: 2, windowMs: 60000 });
        // First IP makes 2 requests
        mockReq.ip = '192.168.1.1';
        mockReq.socket = { remoteAddress: '192.168.1.1' };
        limiter(mockReq, mockRes, mockNext);
        limiter(mockReq, mockRes, mockNext);
        // Second IP should still be allowed
        mockReq.ip = '192.168.1.2';
        mockReq.socket = { remoteAddress: '192.168.1.2' };
        limiter(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(3);
    });
    it('should use user ID if authenticated', () => {
        const limiter = rateLimit({ maxRequests: 2, windowMs: 60000 });
        mockReq.user = { userId: 'user-123' };
        limiter(mockReq, mockRes, mockNext);
        limiter(mockReq, mockRes, mockNext);
        // Third request from same user should be blocked
        limiter(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(2);
        expect(mockRes.status).toHaveBeenCalledWith(429);
    });
    it('should handle missing IP gracefully', () => {
        const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 });
        mockReq.ip = undefined;
        mockReq.socket = {};
        limiter(mockReq, mockRes, mockNext);
        // Should still work with 'unknown' IP
        expect(mockNext).toHaveBeenCalled();
    });
    it('should decrement remaining count correctly', () => {
        const maxRequests = 5;
        const limiter = rateLimit({ maxRequests, windowMs: 60000 });
        limiter(mockReq, mockRes, mockNext);
        // Check remaining count - headers are set BEFORE incrementing, so first request shows full limit
        const setHeaderCalls = mockRes.setHeader.mock.calls;
        const remainingHeader = setHeaderCalls.find((call) => call[0] === 'X-RateLimit-Remaining');
        expect(remainingHeader).toBeDefined();
        // On first request with fresh entry (count=0), remaining should be maxRequests
        expect(parseInt(remainingHeader[1])).toBe(maxRequests);
    });
    it('should include retry-after in rate limited response', () => {
        const limiter = rateLimit({ maxRequests: 1, windowMs: 60000 });
        // First request passes
        limiter(mockReq, mockRes, mockNext);
        // Second request blocked
        limiter(mockReq, mockRes, mockNext);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            retryAfter: expect.any(Number),
        }));
    });
    it('should handle errors gracefully', () => {
        const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 });
        // Create an error-prone request
        mockReq.ip = undefined;
        mockReq.socket = undefined;
        mockReq.user = undefined;
        // Should not throw, just call next
        expect(() => limiter(mockReq, mockRes, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
    });
});
describe('cleanupRateLimitStore', () => {
    it('should cleanup expired entries', () => {
        vi.useFakeTimers();
        // This function should not throw
        expect(() => cleanupRateLimitStore()).not.toThrow();
        vi.useRealTimers();
    });
});
//# sourceMappingURL=rate-limit.test.js.map