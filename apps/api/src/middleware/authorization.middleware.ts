import { Request, Response, NextFunction } from 'express';
import { db, userRole, role, eq } from '@wellness/db';
import { AppError, UnauthorizedError } from '@wellness/utils';
import { asyncHandler } from '@wellness/utils';

export const resolveRoles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }

    const userRoles = await db
      .select({ name: role.name })
      .from(userRole)
      .innerJoin(role, eq(userRole.roleId, role.id))
      .where(eq(userRole.userId, req.auth.userId));

    req.auth.roles = userRoles.map((r) => r.name);
    next();
  },
);

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }

    const hasRole = req.auth.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    next();
  };
};
