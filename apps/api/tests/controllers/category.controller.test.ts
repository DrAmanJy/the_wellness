import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { app } from '../../src/app';
import { factories } from '../helpers/factories';

describe('Category API Controllers', () => {
  let adminToken: string;

  beforeEach(async () => {
    const adminUser = await factories.createUser();
    await factories.assignRole(adminUser.id, 'admin');
    const adminSession = await factories.createSession(adminUser.id);
    adminToken = adminSession.token;
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('GET /api/categories', () => {
    it('returns categories list', async () => {
      const res = await request(app).get('/api/categories');
      const body = res.body as { success: boolean; data: unknown[] };
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('POST /api/categories', () => {
    it('creates a category as admin', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New Category', slug: `cat-${String(Date.now())}` });

      const body = res.body as { success: boolean; data: { name: string } };
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('New Category');
    });

    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Unauth Category', slug: `cat-unauth-${String(Date.now())}` });

      expect(res.status).toBe(401);
    });
  });
});
