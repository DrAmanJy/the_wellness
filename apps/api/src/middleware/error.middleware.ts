import { Request, Response, NextFunction } from 'express';

import { ApiError } from '@wellness/contracts';
import { AppError } from '@wellness/utils';

import { logger } from '../lib/logger';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let errors: unknown = undefined;

  // Type guards
  const isObject = typeof err === 'object' && err !== null;
  const errName = isObject && 'name' in err ? err.name : undefined;
  const errCode = isObject && 'code' in err ? err.code : undefined;
  const errCause = isObject && 'cause' in err ? err.cause : undefined;
  const errCauseCode =
    typeof errCause === 'object' && errCause !== null && 'code' in errCause
      ? errCause.code
      : undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (errName === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors =
      (isObject && 'errors' in err ? err.errors : undefined) ||
      (isObject && 'issues' in err ? err.issues : undefined);
  } else if (
    errCode === '23505' ||
    errCauseCode === '23505' ||
    (errName === 'PostgresError' && errCode === '23505')
  ) {
    // Postgres unique constraint violation
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A resource with that identifier already exists';
  } else if (
    errCode === '22P02' ||
    errCauseCode === '22P02' ||
    (errName === 'PostgresError' && errCode === '22P02')
  ) {
    // Postgres invalid text representation (e.g. malformed UUID)
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'Invalid identifier format';
  }

  // Log error
  const errMessage = isObject && 'message' in err ? err.message : 'Unknown error';
  if (statusCode === 500) {
    logger.error({ err, reqId: req.id }, 'Unhandled Exception');
  } else {
    logger.warn({ err: errMessage, reqId: req.id }, 'AppError');
  }

  const response: ApiError & { errors?: unknown } = {
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
