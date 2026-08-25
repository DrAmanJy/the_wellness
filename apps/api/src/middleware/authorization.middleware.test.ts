import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveRoles, requireRole } from './authorization.middleware';
import { Request, Response, NextFunction } from 'express';
import { db } from '@wellness/db';

describe('Authorization Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let selectSpy: any;

  beforeEach(() => {
    req = { auth: { userId: 'user-123', sessionId: 'sess-123', roles: [] } };
    res = {};
    next = vi.fn();
    
    // Create a chainable mock for db.select().from().innerJoin().where()
    const mockQueryBuilder = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ name: 'customer' }])
    };
    selectSpy = vi.spyOn(db, 'select').mockReturnValue(mockQueryBuilder as any);
  });

  afterEach(() => {
    selectSpy.mockRestore();
  });

  describe('resolveRoles', () => {
    it('throws 401 if auth context is missing entirely', async () => {
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

    it('throws 401 if auth userId is missing in context', async () => {
      // @ts-expect-error - Simulating missing userId for testing
      delete req.auth?.userId;
      resolveRoles(req as Request, res as Response, next);
      await new Promise((r) => setTimeout(r, 0));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });

    it('resolves roles from database and attaches to context', async () => {
      // Setup mock to return 'customer' and 'editor'
      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ name: 'customer' }, { name: 'editor' }])
      };
      selectSpy.mockReturnValue(mockQueryBuilder as any);

      resolveRoles(req as Request, res as Response, next);
      await new Promise((r) => setTimeout(r, 0));

      expect(req.auth?.roles).toEqual(['customer', 'editor']);
      expect(next).toHaveBeenCalledWith(); // success
    });

    it('handles user with zero roles gracefully (empty array)', async () => {
      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([])
      };
      selectSpy.mockReturnValue(mockQueryBuilder as any);

      resolveRoles(req as Request, res as Response, next);
      await new Promise((r) => setTimeout(r, 0));

      expect(req.auth?.roles).toEqual([]);
      expect(next).toHaveBeenCalledWith(); // success
    });

    it('passes database errors down the chain for global error handler', async () => {
      const dbError = new Error('Database connection failed');
      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(dbError)
      };
      selectSpy.mockReturnValue(mockQueryBuilder as any);

      resolveRoles(req as Request, res as Response, next);
      await new Promise((r) => setTimeout(r, 0));

      expect(next).toHaveBeenCalledWith(dbError); // passes exact error to next()
    });
  });

  describe('requireRole', () => {
    it('allows access if user has exact required role', () => {
      req.auth!.roles = ['customer', 'admin'];
      const middleware = requireRole('admin');

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('throws 403 Forbidden if user completely lacks required role', () => {
      req.auth!.roles = ['customer'];
      const middleware = requireRole('admin');

      expect(() => middleware(req as Request, res as Response, next)).toThrow('Forbidden');
    });

    it('throws 403 Forbidden if user has no roles', () => {
      req.auth!.roles = [];
      const middleware = requireRole('admin');

      expect(() => middleware(req as Request, res as Response, next)).toThrow('Forbidden');
    });

    it('throws 401 Unauthorized if auth context is somehow completely missing before this step', () => {
      delete req.auth;
      const middleware = requireRole('admin');

      expect(() => middleware(req as Request, res as Response, next)).toThrow('Unauthorized');
    });

    it('throws 401 Unauthorized if roles array is undefined on auth context', () => {
      delete (req.auth as any).roles;
      const middleware = requireRole('admin');

      expect(() => middleware(req as Request, res as Response, next)).toThrow('Unauthorized');
    });
  });
});
