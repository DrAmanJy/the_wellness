import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { auth } from '@wellness/auth';

import { requireAuth } from '../../src/middleware/auth.middleware';

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

describe('Authentication Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let getSessionSpy: {
    mockRestore: () => void;
    mockResolvedValue: (v: unknown) => void;
    mockRejectedValue: (e: Error) => void;
  };

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    getSessionSpy = vi.spyOn(auth.api, 'getSession') as unknown as {
      mockRestore: () => void;
      mockResolvedValue: (v: unknown) => void;
      mockRejectedValue: (e: Error) => void;
    };
  });

  afterEach(() => {
    getSessionSpy.mockRestore();
  });

  const expectUnauthorized = (next: ReturnType<typeof vi.fn>) => {
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
    expect((req as Request).auth).toBeUndefined(); // Important security invariant
  };

  it('throws 401 if session is missing completely', async () => {
    getSessionSpy.mockResolvedValue(null);
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if Better Auth throws an internal error', async () => {
    getSessionSpy.mockRejectedValue(new Error('Internal Auth Error'));
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if session object is completely empty', async () => {
    getSessionSpy.mockResolvedValue({});
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if session.user exists but session.session is missing', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: 'user-1' } });
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if session.session exists but session.user is missing', async () => {
    getSessionSpy.mockResolvedValue({ session: { id: 'sess-1' } });
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if session.user.id is empty string', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: '' }, session: { id: 'sess-1' } });
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if session.user.id is undefined', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: undefined }, session: { id: 'sess-1' } });
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('throws 401 if session.session.id is empty string', async () => {
    getSessionSpy.mockResolvedValue({ user: { id: 'user-1' }, session: { id: '' } });
    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;
    expectUnauthorized(next);
  });

  it('attaches auth context and passes when session is perfectly valid', async () => {
    getSessionSpy.mockResolvedValue({
      session: { id: 'session-123' },
      user: { id: 'user-123' },
    });

    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;

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

    const { next, called } = createNextWithPromise();
    requireAuth(req as Request, res as Response, next);
    await called;

    expect(auth.api.getSession).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          asymmetricMatch: (value: unknown): boolean => value instanceof Headers,
        },
      }),
    );
    expect(next).toHaveBeenCalledWith();
  });
});
