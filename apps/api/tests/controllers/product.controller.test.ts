import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../../src/app';

describe('Product API Controllers', () => {
  describe('GET /api/products', () => {
    it('returns products list', async () => {
      const res = await request(app).get('/api/products');
      const body = res.body as { success: boolean; data: { items: unknown[] } };
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data.items)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('creates a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'Comprehensive test product description.',
          sellingPrice: '100.00',
          mrp: '150.00',
          images: [
            'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_product1.jpg',
            'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_product2.jpg',
          ],
        });

      const body = res.body as { success: boolean; data: { name: string } };
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Test Product');
    });
  });
});
