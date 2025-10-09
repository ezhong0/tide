/**
 * Correlation Middleware Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { correlationMiddleware, getCorrelationId, createCorrelatedHeaders } from './correlation.js';
describe('correlationMiddleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        mockReq = {
            headers: {},
            method: 'GET',
            path: '/test',
            ip: '127.0.0.1',
            get: vi.fn((header) => {
                if (header === 'user-agent')
                    return 'test-agent';
                return undefined;
            }),
            correlationId: undefined,
        };
        mockRes = {
            setHeader: vi.fn(),
            on: vi.fn(),
            statusCode: 200,
        };
        mockNext = vi.fn();
    });
    it('should generate correlation ID if not provided', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockReq.correlationId).toBeDefined();
        expect(typeof mockReq.correlationId).toBe('string');
        expect(mockReq.correlationId?.length).toBeGreaterThan(0);
    });
    it('should use existing correlation ID from header', () => {
        const existingId = 'existing-correlation-id';
        mockReq.headers = { 'x-correlation-id': existingId };
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockReq.correlationId).toBe(existingId);
    });
    it('should set correlation ID headers on response', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-Correlation-ID', mockReq.correlationId);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', mockReq.correlationId);
    });
    it('should call next middleware', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledOnce();
    });
    it('should handle array correlation ID header', () => {
        mockReq.headers = { 'x-correlation-id': 'first-id' };
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockReq.correlationId).toBe('first-id');
    });
    it('should track response time', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        // Verify response finish handler was registered
        expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
        // Get the finish callback
        const finishCallback = mockRes.on.mock.calls.find((call) => call[0] === 'finish')?.[1];
        expect(finishCallback).toBeDefined();
        // Call the finish callback
        if (finishCallback) {
            finishCallback();
        }
    });
    it('should use x-request-id header if x-correlation-id not present', () => {
        const requestId = 'request-id-123';
        mockReq.headers = { 'x-request-id': requestId };
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockReq.correlationId).toBe(requestId);
    });
    it('should use request-id header as fallback', () => {
        const requestId = 'fallback-request-id';
        mockReq.headers = { 'request-id': requestId };
        correlationMiddleware(mockReq, mockRes, mockNext);
        expect(mockReq.correlationId).toBe(requestId);
    });
});
describe('getCorrelationId', () => {
    it('should return correlation ID from request', () => {
        const req = { correlationId: 'test-id' };
        expect(getCorrelationId(req)).toBe('test-id');
    });
    it('should return undefined if no correlation ID', () => {
        const req = {};
        expect(getCorrelationId(req)).toBeUndefined();
    });
});
describe('createCorrelatedHeaders', () => {
    it('should create headers with correlation ID from request', () => {
        const req = { correlationId: 'test-id' };
        const headers = createCorrelatedHeaders(req);
        expect(headers['X-Correlation-ID']).toBe('test-id');
    });
    it('should generate new correlation ID if request has none', () => {
        const req = {};
        const headers = createCorrelatedHeaders(req);
        expect(headers['X-Correlation-ID']).toBeDefined();
        expect(typeof headers['X-Correlation-ID']).toBe('string');
    });
    it('should merge additional headers', () => {
        const req = { correlationId: 'test-id' };
        const additionalHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' };
        const headers = createCorrelatedHeaders(req, additionalHeaders);
        expect(headers['X-Correlation-ID']).toBe('test-id');
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Authorization']).toBe('Bearer token');
    });
});
//# sourceMappingURL=correlation.test.js.map