import { Request, Response, NextFunction } from 'express';
import { AppError } from '@wellness/utils';
import { ApiError } from '@wellness/contracts';
import { logger } from '../lib/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let errors: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = (err as any).errors || (err as any).issues;
  } else if ((err as any).code === '23505' || (err.cause && (err.cause as any).code === '23505') || (err.name === 'PostgresError' && (err as any).code === '23505')) {
    // Postgres unique constraint violation
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A resource with that identifier already exists';
  } else if ((err as any).code === '22P02' || (err.cause && (err.cause as any).code === '22P02') || (err.name === 'PostgresError' && (err as any).code === '22P02')) {
    // Postgres invalid text representation (e.g. malformed UUID)
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'Invalid identifier format';
  }

  // Log error
  if (statusCode === 500) {
    logger.error({ err, reqId: req.id }, 'Unhandled Exception');
  } else {
    logger.warn({ err: err.message, reqId: req.id }, 'AppError');
  }

  const response: ApiError & { errors?: any } = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};
