import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../../src/app';

describe('Order API Controllers', () => {
  describe('GET /api/orders authentication', () => {
    it('returns 401 when user is not logged in', async () => {
      const res = await request(app).get('/api/orders');
      const body = res.body as { success: boolean };
      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/orders authentication', () => {
    it('returns 401 when user is not logged in', async () => {
      const res = await request(app).post('/api/orders').send({});
      const body = res.body as { success: boolean };
      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });
  });
});
