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

import { fromNodeHeaders } from 'better-auth/node';

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let session;
  try {
    session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  } catch (e) {
    throw new UnauthorizedError();
  }

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
