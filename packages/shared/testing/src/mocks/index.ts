import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

/**
 * Mock Express Request
 */
export function mockRequest(overrides: Partial<Request> = {}): Request {
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
  } as Request;
}

/**
 * Mock Express Response
 */
export function mockResponse(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    headersSent: false,
  };
  return res as Response;
}

/**
 * Mock Express Next Function
 */
export function mockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

/**
 * Mock Logger
 */
export function mockLogger(): Logger {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn().mockReturnThis(),
  } as unknown as Logger;
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
