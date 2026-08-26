import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { auth } from '@wellness/auth';

import { requireAuth } from './auth.middleware';

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

  const expectUnauthorized = () => {
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      })
    );
    expect((req as any).auth).toBeUndefined(); // Important security invariant
  };

  it('throws 401 if session is missing completely', async () => {
    getSessionSpy.mockResolvedValue(null);
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if Better Auth throws an internal error', async () => {
    getSessionSpy.mockRejectedValue(new Error('Internal Auth Error'));
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if session object is completely empty', async () => {
    getSessionSpy.mockResolvedValue({});
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if session.user exists but session.session is missing', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: 'user-1' } });
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if session.session exists but session.user is missing', async () => {
    getSessionSpy.mockResolvedValue({ session: { id: 'sess-1' } });
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if session.user.id is empty string', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: '' }, session: { id: 'sess-1' } });
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if session.user.id is undefined', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: undefined }, session: { id: 'sess-1' } });
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('throws 401 if session.session.id is empty string', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: 'user-1' }, session: { id: '' } });
    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));
    expectUnauthorized();
  });

  it('attaches auth context and passes when session is perfectly valid', async () => {
    getSessionSpy.mockResolvedValue({
      session: { id: 'session-123' },
      user: { id: 'user-123' },
    });

    requireAuth(req as Request, res as Response, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(req.auth).toEqual({
      userId: 'user-123',
      sessionId: 'session-123',
      roles: [], // Verifying roles initialized as []
    });
    expect(next).toHaveBeenCalledTimes(1); // exactly once
    expect(next).toHaveBeenCalledWith(); // success has no args
  });

  it('passes headers to getSession correctly', async () => {
    getSessionSpy.mockResolvedValue({
      session: { id: 'session-123' },
      user: { id: 'user-123' },
    });

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
