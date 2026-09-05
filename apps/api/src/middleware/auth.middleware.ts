import { fromNodeHeaders } from 'better-auth/node';
import { Request, Response, NextFunction } from 'express';

import { auth } from '@wellness/auth';
import { UnauthorizedError, asyncHandler } from '@wellness/utils';

export interface AuthContext {
  userId: string;
  sessionId: string;
  roles: readonly string[];
}

declare module 'express' {
  interface Request {
    auth?: AuthContext;
  }
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let session;
  try {
    session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user.id || !session.session.id) {
      throw new UnauthorizedError();
    }
  } catch {
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
