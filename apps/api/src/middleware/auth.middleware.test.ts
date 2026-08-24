import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { auth } from '@wellness/auth';

vi.mock('@wellness/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe('Authentication Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('throws 401 if session is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    requireAuth(req as Request, res as Response, next);

    await new Promise((r) => setTimeout(r, 0));

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  });

  it('attaches auth context if session is valid', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
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
});
