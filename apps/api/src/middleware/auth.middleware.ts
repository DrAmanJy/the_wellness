import { Request, Response, NextFunction } from 'express';
import { auth } from '@wellness/auth';
import { UnauthorizedError } from '@wellness/utils';
import { asyncHandler } from '@wellness/utils';

export interface AuthContext {
  userId: string;
  sessionId: string;
  roles: readonly string[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });

  if (!session || !session.user || !session.session) {
    throw new UnauthorizedError();
  }

  // Initialize auth context without roles first
  req.auth = {
    userId: session.user.id,
    sessionId: session.session.id,
    roles: [],
  };

  next();
});
