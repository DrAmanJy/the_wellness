import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../../src/app';

describe('Analytics API Controllers', () => {
  describe('GET /api/analytics', () => {
    it('returns analytics summary data', async () => {
      const res = await request(app).get('/api/analytics');
      const body = res.body as {
        success: boolean;
        data: { totalOrdersCount: number; productPerformance: unknown[] };
      };
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(typeof body.data.totalOrdersCount).toBe('number');
      expect(Array.isArray(body.data.productPerformance)).toBe(true);
    });
  });

  describe('GET /api/analytics/products', () => {
    it('returns products analytics list', async () => {
      const res = await request(app).get('/api/analytics/products');
      const body = res.body as { success: boolean; data: unknown[] };
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
