import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
