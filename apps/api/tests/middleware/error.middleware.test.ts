import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';

import { AppError } from '@wellness/utils';

import { errorHandler } from '../../src/middleware/error.middleware';

// Mock logger
vi.mock('../../src/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Error Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: MockInstance;
  let jsonMock: MockInstance;

  beforeEach(() => {
    req = { id: 'req-123' } as Partial<Request>;
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock as unknown as (code: number) => Response } as Partial<Response>;
    next = vi.fn();
  });

  it('maps AppError correctly', () => {
    const error = new AppError(400, 'CUSTOM_ERROR', 'Custom Error');

    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'CUSTOM_ERROR',
        message: 'Custom Error',
      },
    });
  });

  it('maps ZodError correctly', () => {
    const error = Object.assign(new Error('Zod Validation Failed'), {
      name: 'ZodError',
      errors: [{ path: ['field'], message: 'Required' }],
    });

    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
      errors: [{ path: ['field'], message: 'Required' }],
    });
  });

  it('maps Postgres unique constraint violation (23505) to 409', () => {
    const error = Object.assign(new Error('duplicate key value'), { code: '23505' });

    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A resource with that identifier already exists',
      },
    });
  });

  it('maps Postgres invalid text representation (22P02) to 400', () => {
    const error = Object.assign(new Error('invalid uuid'), { code: '22P02' });

    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid identifier format',
      },
    });
  });

  it('maps unknown errors to 500 without leaking details', () => {
    const error = new Error('Secret database password is password123');

    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });
});
