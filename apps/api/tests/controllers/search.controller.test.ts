import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../../src/app';

describe('Search API Controllers', () => {
  describe('GET /api/search', () => {
    it('returns search results for valid query', async () => {
      const res = await request(app).get('/api/search?q=health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('categories');
    });

    it('returns 400 for empty query string', async () => {
      const res = await request(app).get('/api/search?q=');
      expect(res.status).toBe(400);
    });
  });
});
