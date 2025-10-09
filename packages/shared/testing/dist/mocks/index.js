/**
 * Mock Express Request
 */
export function mockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        method: 'GET',
        path: '/test',
        url: '/test',
        correlationId: 'test-correlation-id',
        ...overrides,
    };
}
/**
 * Mock Express Response
 */
export function mockResponse() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        headersSent: false,
    };
    return res;
}
/**
 * Mock Express Next Function
 */
export function mockNext() {
    return vi.fn();
}
/**
 * Mock Logger
 */
export function mockLogger() {
    return {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn().mockReturnThis(),
    };
}
/**
 * Mock Database Client
 */
export function mockDatabaseClient() {
    return {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        execute: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
}
//# sourceMappingURL=index.js.map