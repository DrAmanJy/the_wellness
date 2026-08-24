import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveRoles, requireRole } from './authorization.middleware';
import { Request, Response, NextFunction } from 'express';
import { db } from '@wellness/db';

vi.mock('@wellness/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ name: 'customer' }]),
  },
  userRole: {},
  role: {},
  eq: vi.fn(),
}));

describe('Authorization Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { auth: { userId: 'user-123', sessionId: 'sess-123', roles: [] } };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('resolveRoles', () => {
    it('throws 401 if auth context is missing', async () => {
      delete req.auth;
      resolveRoles(req as Request, res as Response, next);
      await new Promise((r) => setTimeout(r, 0));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });

    it('resolves roles and attaches to context', async () => {
      resolveRoles(req as Request, res as Response, next);
      await new Promise((r) => setTimeout(r, 0));
      expect(req.auth?.roles).toEqual(['customer']);
      expect(next).toHaveBeenCalledWith(); // success
    });
  });

  describe('requireRole', () => {
    it('allows access if user has required role', () => {
      req.auth!.roles = ['customer', 'admin'];
      const middleware = requireRole('admin');

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('throws 403 if user lacks required role', () => {
      req.auth!.roles = ['customer'];
      const middleware = requireRole('admin');

      expect(() => middleware(req as Request, res as Response, next)).toThrow('Forbidden');
    });
  });
});
