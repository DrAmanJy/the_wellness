import { Request, Response, NextFunction } from 'express';

import { db, user, eq } from '@wellness/db';
import { AppError, UnauthorizedError } from '@wellness/utils';
import { asyncHandler } from '@wellness/utils';

import type { AuthContext } from './auth.middleware';

export const resolveRoles = asyncHandler(
  async (req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) => {
    if (!req.auth?.userId) {
      throw new UnauthorizedError();
    }

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, req.auth.userId),
      columns: { role: true },
    });

    req.auth.roles = currentUser?.role ? [currentUser.role] : [];
    next();
  },
);

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) => {
    if (!req.auth || !Array.isArray(req.auth.roles)) {
      throw new UnauthorizedError();
    }

    const hasRole = req.auth.roles.some((r: string) => allowedRoles.includes(r));
    if (!hasRole) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    next();
  };
};
