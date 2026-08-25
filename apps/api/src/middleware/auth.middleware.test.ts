import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requireAuth } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { auth } from '@wellness/auth';

describe('Authentication Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let getSessionSpy: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = vi.fn();
    getSessionSpy = vi.spyOn(auth.api, 'getSession');
  });

  afterEach(() => {
    getSessionSpy.mockRestore();
  });

  it('throws 401 if session is missing completely', async () => {
    getSessionSpy.mockResolvedValue(null);

    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  });

  it('throws 401 if Better Auth throws an internal error', async () => {
    getSessionSpy.mockRejectedValue(new Error('Internal Auth Error'));

    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  });

  it('throws 401 if session object is malformed (missing session info)', async () => {
    // Session returned but missing user or session ID
    getSessionSpy.mockResolvedValue({} as any);

    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  });

  it('attaches auth context and passes when session is perfectly valid', async () => {
    getSessionSpy.mockResolvedValue({
      session: { id: 'session-123' },
      user: { id: 'user-123' },
    } as any);

    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(req.auth).toEqual({
      userId: 'user-123',
      sessionId: 'session-123',
      roles: [],
    });
    expect(next).toHaveBeenCalledWith(); // success has no args
  });

  it('passes headers to getSession correctly', async () => {
    getSessionSpy.mockResolvedValue({
      session: { id: 'session-123' },
      user: { id: 'user-123' },
    } as any);

    req.headers = { cookie: 'test-cookie' };

    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(auth.api.getSession).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.anything(),
      })
    );
    expect(next).toHaveBeenCalledWith();
  });
});
