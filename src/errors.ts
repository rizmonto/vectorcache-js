/**
 * Custom error classes for Vectorcache SDK
 */

import { VectorcacheError } from './types';

export class VectorcacheAPIError extends Error implements VectorcacheError {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'VectorcacheAPIError';
    this.status = status;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VectorcacheAPIError);
    }
  }
}

export class VectorcacheAuthenticationError extends VectorcacheAPIError {
  constructor(message: string = 'Invalid or missing API key') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'VectorcacheAuthenticationError';
  }
}

export class VectorcacheRateLimitError extends VectorcacheAPIError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'VectorcacheRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class VectorcacheValidationError extends VectorcacheAPIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'VectorcacheValidationError';
  }
}

export class VectorcacheNetworkError extends VectorcacheAPIError {
  constructor(message: string = 'Network error occurred') {
    super(message, undefined, 'NETWORK_ERROR');
    this.name = 'VectorcacheNetworkError';
  }
}

export class VectorcacheTimeoutError extends VectorcacheAPIError {
  constructor(message: string = 'Request timeout') {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'VectorcacheTimeoutError';
  }
}

export class VectorcacheServerError extends VectorcacheAPIError {
  constructor(message: string = 'Internal server error', status: number = 500) {
    super(message, status, 'SERVER_ERROR');
    this.name = 'VectorcacheServerError';
  }
}

/**
 * Factory function to create appropriate error based on HTTP response
 */
export function createErrorFromResponse(
  response: Response,
  responseBody?: any
): VectorcacheAPIError {
  const { status, statusText } = response;
  const message = responseBody?.message || responseBody?.detail || statusText || 'Unknown error';

  switch (status) {
    case 400:
      return new VectorcacheValidationError(message, responseBody);
    case 401:
    case 403:
      return new VectorcacheAuthenticationError(message);
    case 408:
      return new VectorcacheTimeoutError(message);
    case 429:
      const retryAfter = response.headers.get('Retry-After');
      return new VectorcacheRateLimitError(
        message,
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new VectorcacheServerError(message, status);
    default:
      return new VectorcacheAPIError(message, status, 'API_ERROR', responseBody);
  }
}