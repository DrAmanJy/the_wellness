import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { factories } from '../test/factories';

describe('Product API Controllers', () => {
  let adminToken: string;
  let customerToken: string;
  let adminId: string;

  beforeEach(async () => {
    // 1. Create an admin user and session
    const adminUser = await factories.createUser();
    adminId = adminUser.id;
    await factories.assignRole(adminUser.id, 'admin');
    const adminSession = await factories.createSession(adminUser.id);
    adminToken = adminSession.token;

    // 2. Create a normal customer user and session
    const customerUser = await factories.createUser();
    const customerSession = await factories.createSession(customerUser.id);
    customerToken = customerSession.token;
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('GET /api/products', () => {
    it('returns public products with default cursor pagination', async () => {
      // Create active and draft products
      await factories.createProduct({ name: 'Active Prod', slug: 'active-prod', status: 'active' });
      await factories.createProduct({ name: 'Draft Prod', slug: 'draft-prod', status: 'draft' });

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Ensure only active product is returned
      const slugs = res.body.data.items.map((p: any) => p.slug);
      expect(slugs).toContain('active-prod');
      expect(slugs).not.toContain('draft-prod');

      // Validate pagination shape
      expect(res.body.data).toHaveProperty('nextCursor');
      expect(res.body.data).toHaveProperty('hasMore');
    });

    it('handles limit and invalid limit queries correctly', async () => {
      const res1 = await request(app).get('/api/products?limit=100');
      expect(res1.status).toBe(200); // 100 should be the max allowed limit

      const res2 = await request(app).get('/api/products?limit=200');
      expect(res2.status).toBe(400); // Exceeds max limit

      const res3 = await request(app).get('/api/products?limit=-5');
      expect(res3.status).toBe(400); // Negative limit
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns a specific active product', async () => {
      await factories.createProduct({ slug: 'find-me', status: 'active' });

      const res = await request(app).get('/api/products/find-me');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('find-me');
    });

    it('returns 404 for draft/archived/deleted products', async () => {
      await factories.createProduct({ slug: 'hidden-draft', status: 'draft' });

      const res = await request(app).get('/api/products/hidden-draft');
      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/products/does-not-exist');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    const validPayload = {
      name: 'New Admin Product',
      slug: 'new-admin-product',
      description: 'Test description',
      categoryIds: []
    };

    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(validPayload);

      expect(res.status).toBe(401);
    });

    it('rejects customer requests (403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`better-auth.session_token=${customerToken}`])
        .send(validPayload);

      expect(res.status).toBe(403);
    });

    it('creates product as admin (201)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('new-admin-product');
    });

    it('returns 409 for duplicate slug', async () => {
      await factories.createProduct({ slug: 'duplicate-admin' });

      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ ...validPayload, slug: 'duplicate-admin' });

      expect(res.status).toBe(409);
  });

  describe('PATCH /api/products/:id', () => {
    it('updates product successfully as admin', async () => {
      const p = await factories.createProduct({ name: 'Old' });
      const res = await request(app)
        .patch(`/api/products/${p.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New');
    });

    it('rejects unauthenticated requests for update', async () => {
      const res = await request(app).patch('/api/products/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes product successfully as admin', async () => {
      const p = await factories.createProduct();
      const res = await request(app)
        .delete(`/api/products/${p.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deletedAt).toBeDefined();
    });

    it('rejects unauthenticated requests for delete', async () => {
      const res = await request(app).delete('/api/products/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/products/:id/categories', () => {
    it('updates categories successfully as admin', async () => {
      const p = await factories.createProduct();
      const c = await factories.createCategory();

      const res = await request(app)
        .put(`/api/products/${p.id}/categories`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ categoryIds: [c.id], primaryCategoryId: c.id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 409 if primary is not in assigned list', async () => {
      const p = await factories.createProduct();
      const c = await factories.createCategory();
      const c2 = await factories.createCategory();

      const res = await request(app)
        .put(`/api/products/${p.id}/categories`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ categoryIds: [c.id], primaryCategoryId: c2.id });

      expect(res.status).toBe(409);
    });
  });
});
});
