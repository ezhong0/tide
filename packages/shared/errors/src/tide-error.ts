import { ErrorCode, ERROR_STATUS_MAP } from './codes';

/**
 * Error detail structure for API responses
 */
export interface ErrorDetail {
  code: string;
  message: string;
  details?: unknown;
  timestamp?: number;
  requestId?: string;
  stack?: string;
}

/**
 * Base error class for all Tide platform errors
 */
export class TideError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly timestamp: number;
  public readonly isOperational: boolean;
  public requestId?: string;

  constructor(
    code: ErrorCode,
    message: string,
    details?: unknown,
    statusCode?: number,
    isOperational: boolean = true
  ) {
    super(message);

    this.name = 'TideError';
    this.code = code;
    this.statusCode = statusCode || ERROR_STATUS_MAP[code] || 500;
    this.details = details;
    this.timestamp = Date.now();
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Alias for details (for compatibility)
   */
  get metadata(): unknown {
    return this.details;
  }

  /**
   * Convert error to API response format
   */
  toJSON(): ErrorDetail {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }

  /**
   * Convert error to string representation
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(this.statusCode);
  }

  /**
   * Check if error is client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

/**
 * Error for unexpected/unknown errors
 */
export class UnexpectedError extends TideError {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorCode.INTERNAL_ERROR,
      message,
      { originalMessage: originalError?.message, originalStack: originalError?.stack },
      500,
      false // Not operational - unexpected
    );
    this.name = 'UnexpectedError';
  }
}

/**
 * Convert unknown errors to TideError
 */
export function toTideError(error: unknown): TideError {
  if (error instanceof TideError) {
    return error;
  }

  if (error instanceof Error) {
    return new UnexpectedError(error.message, error);
  }

  return new UnexpectedError(String(error));
}
