import { ErrorResponse } from './types';

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

export class UpstreamFetchError extends Error {
  public details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.name = 'UpstreamFetchError';
    this.details = details;
  }
}

export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtractionError';
  }
}

export function errorToHttpResponse(error: Error): { status: number; body: ErrorResponse } {
  if (error instanceof InvalidRequestError) {
    return {
      status: 400,
      body: {
        error: 'InvalidRequest',
        message: error.message,
      },
    };
  }

  if (error instanceof UpstreamFetchError) {
    return {
      status: 502,
      body: {
        error: 'FetchError',
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof ExtractionError) {
    return {
      status: 500,
      body: {
        error: 'ExtractionError',
        message: error.message,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: 'InternalError',
      message: 'An unexpected error occurred.',
    },
  };
}
