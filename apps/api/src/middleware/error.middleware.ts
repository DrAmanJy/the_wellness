import { Request, Response, NextFunction } from 'express';
import { AppError } from '@wellness/utils';
import { ApiError } from '@wellness/contracts';
import { logger } from '../lib/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  }

  // Log error
  if (statusCode === 500) {
    logger.error({ err, reqId: req.id }, 'Unhandled Exception');
  } else {
    logger.warn({ err: err.message, reqId: req.id }, 'AppError');
  }

  const response: ApiError = {
    success: false,
    error: {
      code,
      message,
    },
  };

  res.status(statusCode).json(response);
};
