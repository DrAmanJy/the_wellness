import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AppError } from '@wellness/utils';

import { errorHandler } from './error.middleware';

// Mock logger
vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Error Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    req = { id: 'req-123' } as any;
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock };
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
      }
    });
  });

  it('maps ZodError correctly', () => {
    const error = new Error('Zod Validation Failed');
    error.name = 'ZodError';
    (error as any).errors = [{ path: ['field'], message: 'Required' }];
    
    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
      errors: [{ path: ['field'], message: 'Required' }]
    });
  });

  it('maps Postgres unique constraint violation (23505) to 409', () => {
    const error = new Error('duplicate key value');
    (error as any).code = '23505';
    
    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A resource with that identifier already exists',
      }
    });
  });

  it('maps Postgres invalid text representation (22P02) to 400', () => {
    const error = new Error('invalid uuid');
    (error as any).code = '22P02';
    
    errorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid identifier format',
      }
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
      }
    });
  });
});
