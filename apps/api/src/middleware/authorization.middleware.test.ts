import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';

import { db } from '@wellness/db';
import { AppError } from '@wellness/utils';

import type { AuthContext } from './auth.middleware';
import { resolveRoles, requireRole } from './authorization.middleware';

/**
 * Create a next function that resolves a promise when called.
 * This replaces setTimeout-based microtask flushing with deterministic signaling.
 */
function createNextWithPromise() {
  let resolve: () => void;
  const called = new Promise<void>((r) => {
    resolve = r;
  });
  const fn = vi.fn(() => {
    resolve();
  });
  return { next: fn as unknown as NextFunction & ReturnType<typeof vi.fn>, called };
}

describe('Authorization Middleware', () => {
  let req: Partial<Request & { auth?: AuthContext }>;
  let res: Partial<Response>;
  let next: NextFunction;
  let selectSpy: MockInstance;

  beforeEach(() => {
    req = { auth: { userId: 'user-123', sessionId: 'sess-123', roles: [] } };
    res = {};
    next = vi.fn();

    // Create a chainable mock for db.select().from().innerJoin().where()
    const mockQueryBuilder = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ name: 'customer' }]),
    };
    selectSpy = vi.spyOn(db, 'select').mockReturnValue(mockQueryBuilder as never);
  });

  afterEach(() => {
    selectSpy.mockRestore();
  });

  describe('resolveRoles', () => {
    it('throws 401 if auth context is missing entirely', async () => {
      delete req.auth;
      const { next: promiseNext, called } = createNextWithPromise();
      resolveRoles(req as Request, res as Response, promiseNext);
      await called;

      expect(promiseNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });

    it('throws 401 if auth userId is missing in context', async () => {
      // Simulate missing userId for testing
      delete (req.auth as unknown as { userId?: string }).userId;
      const { next: promiseNext, called } = createNextWithPromise();
      resolveRoles(req as Request, res as Response, promiseNext);
      await called;

      expect(promiseNext).toHaveBeenCalledWith(
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
        where: vi.fn().mockResolvedValue([{ name: 'customer' }, { name: 'editor' }]),
      };
      selectSpy.mockReturnValue(mockQueryBuilder);

      const { next: promiseNext, called } = createNextWithPromise();
      resolveRoles(req as Request, res as Response, promiseNext);
      await called;

      expect(req.auth?.roles).toEqual(['customer', 'editor']);
      expect(promiseNext).toHaveBeenCalledWith(); // success
    });

    it('handles user with zero roles gracefully (empty array)', async () => {
      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      selectSpy.mockReturnValue(mockQueryBuilder);

      const { next: promiseNext, called } = createNextWithPromise();
      resolveRoles(req as Request, res as Response, promiseNext);
      await called;

      expect(req.auth?.roles).toEqual([]);
      expect(promiseNext).toHaveBeenCalledWith(); // success
    });

    it('passes database errors down the chain for global error handler', async () => {
      const dbError = new Error('Database connection failed');
      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(dbError),
      };
      selectSpy.mockReturnValue(mockQueryBuilder);

      const { next: promiseNext, called } = createNextWithPromise();
      resolveRoles(req as Request, res as Response, promiseNext);
      await called;

      expect(promiseNext).toHaveBeenCalledWith(dbError); // passes exact error to next()
      expect(req.auth?.roles).toEqual([]); // Roles must not be populated silently
    });
  });

  describe('requireRole', () => {
    it('allows access if user has exact required role', () => {
      req.auth = { userId: '1', sessionId: '1', roles: ['customer', 'admin'] };
      const middleware = requireRole('admin');

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('allows access if user has one of the allowed roles (employee)', () => {
      req.auth = { userId: '1', sessionId: '1', roles: ['employee'] };
      const middleware = requireRole('employee', 'admin');

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('allows access if user has one of the allowed roles (admin)', () => {
      req.auth = { userId: '1', sessionId: '1', roles: ['admin'] };
      const middleware = requireRole('employee', 'admin');

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('throws 403 Forbidden if user is customer but requires admin', () => {
      req.auth = { userId: '1', sessionId: '1', roles: ['customer'] };
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(403);
      }
    });

    it('throws 403 Forbidden if user has no roles', () => {
      req.auth = { userId: '1', sessionId: '1', roles: [] };
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(403);
      }
    });

    it('throws 403 Forbidden for role with whitespace (e.g. "admin ")', () => {
      req.auth = { userId: '1', sessionId: '1', roles: ['admin '] };
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(403);
      }
    });

    it('throws 401 Unauthorized if auth context is somehow completely missing before this step', () => {
      delete req.auth;
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('throws 401 Unauthorized if roles array is undefined on auth context', () => {
      delete (req.auth as unknown as { roles?: readonly string[] }).roles;
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('throws 401 Unauthorized if roles is a string instead of array', () => {
      (req as { auth: { userId: string; sessionId: string; roles: unknown } }).auth = {
        userId: '1',
        sessionId: '1',
        roles: 'admin',
      };
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('throws 401 Unauthorized if roles is an object instead of array', () => {
      (req as { auth: { userId: string; sessionId: string; roles: unknown } }).auth = {
        userId: '1',
        sessionId: '1',
        roles: { admin: true },
      };
      const middleware = requireRole('admin');

      try {
        middleware(req as Request, res as Response, next);
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });
  });
});
