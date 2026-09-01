import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { app } from '../app';
import { factories } from '../test/factories';
import { getResponseBody, ProductListResponse, ProductResponse } from '../test/test-utils';

describe('Product API Controllers', () => {
  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    // 1. Create an admin user and session
    const adminUser = await factories.createUser();

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
      const bodyList = getResponseBody<ProductListResponse>(res);
      expect(bodyList.success).toBe(true);

      // Ensure only active product is returned
      const slugs = bodyList.data.items.map((p) => p.slug);
      expect(slugs).toContain('active-prod');
      expect(slugs).not.toContain('draft-prod');

      // Exact-key assertion for ProductListDTO
      const item = bodyList.data.items[0];
      if (item) {
        const itemKeys = Object.keys(item).sort();
        expect(itemKeys).toEqual(
          [
            'id',
            'name',
            'slug',
            'shortDescription',
            'brand',
            'primaryImage',
            'startingPrice',
            'compareAtPrice',
            'isFeatured',
          ].sort(),
        );
      }

      // Validate pagination shape
      expect(bodyList.data).toHaveProperty('nextCursor');
      expect(bodyList.data).toHaveProperty('hasMore');
    });

    it('handles limit and invalid limit queries correctly', async () => {
      const res1 = await request(app).get('/api/products?limit=100');
      expect(res1.status).toBe(200); // 100 should be the max allowed limit

      const res2 = await request(app).get('/api/products?limit=200');
      expect(res2.status).toBe(400); // Exceeds max limit

      const res3 = await request(app).get('/api/products?limit=-5');
      expect(res3.status).toBe(400); // Negative limit
    });

    it('rejects invalid cursor', async () => {
      const res = await request(app).get('/api/products?cursor=not-a-valid-cursor');
      expect(res.status).toBe(400);

      // Malformed date within a valid JSON structure
      const malformedCursor = Buffer.from(
        JSON.stringify({ createdAt: 'not-a-date', id: '123' }),
      ).toString('base64');
      const res2 = await request(app).get(`/api/products?cursor=${malformedCursor}`);
      expect(res2.status).toBe(400);
    });

    it('produces distinct pages with no duplicates and deterministic ordering', async () => {
      const sameTime = new Date('2025-01-01T00:00:00Z');

      // Use fixed UUIDs so we can deterministically test the fallback ID sort
      const id1 = '11111111-1111-1111-1111-111111111111';
      const id2 = '22222222-2222-2222-2222-222222222222';
      const id3 = '33333333-3333-3333-3333-333333333333';

      await factories.createProduct({
        id: id1,
        name: 'P1',
        slug: 'p1',
        status: 'active',
        createdAt: sameTime,
      });
      await factories.createProduct({
        id: id2,
        name: 'P2',
        slug: 'p2',
        status: 'active',
        createdAt: sameTime,
      });
      await factories.createProduct({
        id: id3,
        name: 'P3',
        slug: 'p3',
        status: 'active',
        createdAt: sameTime,
      });

      // Page size 2 should split the 3 tied records
      const res1 = await request(app).get('/api/products?limit=2');
      expect(res1.status).toBe(200);
      const page1 = (res1.body as ProductListResponse).data.items;
      expect(page1.length).toBe(2);

      const res2 = await request(app).get(
        `/api/products?limit=2&cursor=${(res1.body as ProductListResponse).data.nextCursor ?? ''}`,
      );
      expect(res2.status).toBe(200);
      const page2 = (res2.body as ProductListResponse).data.items;
      expect(page2.length).toBe(1);

      const allIds = [...page1.map((p) => p.id), ...page2.map((p) => p.id)];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(3); // No duplicates

      // Verify ordering is deterministic (descending by createdAt, then descending by id)
      // Since createdAt is the same, they should be sorted by ID descending
      expect(page1[0]?.slug).toBe('p3'); // id3
      expect(page1[1]?.slug).toBe('p2'); // id2
      expect(page2[0]?.slug).toBe('p1'); // id1
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns a specific active product', async () => {
      const p = await factories.createProduct({ slug: 'find-me', status: 'active' });
      await factories.createVariant(p.id);
      await factories.createProductImage(p.id);

      const { db, productCategories } = await import('@wellness/db');
      const c = await factories.createCategory();
      await db.insert(productCategories).values({ productId: p.id, categoryId: c.id });

      const res = await request(app).get('/api/products/find-me');

      expect(res.status).toBe(200);
      const body = getResponseBody<ProductResponse>(res);
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('find-me');

      // Exact-key assertion for ProductDetailDTO
      const productKeys = Object.keys(body.data).sort();
      expect(productKeys).toEqual(
        [
          'id',
          'name',
          'slug',
          'description',
          'shortDescription',
          'brand',
          'status',
          'isFeatured',
          'categoryPrimaryId',
          'tags',
          'attributes',
          'specifications',
          'ingredients',
          'benefits',
          'seo',
          'categories',
          'variants',
          'images',
          'createdAt',
          'updatedAt',
        ].sort(),
      );

      const firstVariant = body.data.variants[0];
      if (firstVariant) {
        expect(Object.keys(firstVariant).sort()).toEqual(
          [
            'id',
            'productId',
            'name',
            'sku',
            'price',
            'compareAtPrice',
            'currency',
            'weight',
            'length',
            'width',
            'height',
            'isActive',
            'sortOrder',
            'createdAt',
            'updatedAt',
          ].sort(),
        );
      }

      const firstImage = body.data.images[0];
      if (!firstImage) throw new Error('Expected firstImage to be defined');
      expect(Object.keys(firstImage).sort()).toEqual(
        [
          'id',
          'productId',
          'variantId',
          'url',
          'altText',
          'sortOrder',
          'isPrimary',
          'createdAt',
        ].sort(),
      );

      const firstCategory = body.data.categories[0];
      if (firstCategory) {
        expect(Object.keys(firstCategory).sort()).toEqual(['id', 'name', 'slug'].sort());
      }
    });

    it('returns 404 for draft/archived/deleted products', async () => {
      await factories.createProduct({ slug: 'hidden-draft', status: 'draft' });
      await factories.createProduct({ slug: 'hidden-archived', status: 'archived' });
      const deletedProd = await factories.createProduct({
        slug: 'hidden-deleted',
        status: 'active',
      });

      const { db, products, eq } = await import('@wellness/db');
      await db
        .update(products)
        .set({ deletedAt: new Date() })
        .where(eq(products.id, deletedProd.id));

      const res1 = await request(app).get('/api/products/hidden-draft');
      expect(res1.status).toBe(404);

      const res2 = await request(app).get('/api/products/hidden-archived');
      expect(res2.status).toBe(404);

      const res3 = await request(app).get('/api/products/hidden-deleted');
      expect(res3.status).toBe(404);
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
      categoryIds: [],
    };

    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).post('/api/products').send(validPayload);

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
      const body = getResponseBody<ProductResponse>(res);
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('new-admin-product');

      // Exact-key assertion for ProductMutationDTO
      const mutationKeys = Object.keys(body.data).sort();
      expect(mutationKeys).toEqual(
        [
          'id',
          'name',
          'slug',
          'description',
          'shortDescription',
          'brand',
          'status',
          'isFeatured',
          'categoryPrimaryId',
          'tags',
          'attributes',
          'specifications',
          'ingredients',
          'benefits',
          'seo',
          'createdAt',
          'updatedAt',
        ].sort(),
      );
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
        const body = getResponseBody<ProductResponse>(res);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('New');
      });

      it('rejects unauthenticated requests for update', async () => {
        const res = await request(app).patch('/api/products/00000000-0000-0000-0000-000000000000');
        expect(res.status).toBe(401);
      });

      it('rejects customer requests for update (403)', async () => {
        const p = await factories.createProduct({ name: 'Old' });
        const res = await request(app)
          .patch(`/api/products/${p.id}`)
          .set('Cookie', [`better-auth.session_token=${customerToken}`])
          .send({ name: 'Hacked' });
        expect(res.status).toBe(403);
      });
    });

    describe('DELETE /api/products/:id', () => {
      it('successfully soft-deletes a product', async () => {
        const p = await factories.createProduct();
        const res = await request(app)
          .delete(`/api/products/${p.id}`)
          .set('Cookie', [`better-auth.session_token=${adminToken}`]);

        expect(res.status).toBe(200);
        const body = getResponseBody<ProductResponse>(res);
        expect(body.success).toBe(true);
      });

      it('rejects unauthenticated requests for delete', async () => {
        const res = await request(app).delete('/api/products/00000000-0000-0000-0000-000000000000');
        expect(res.status).toBe(401);
      });

      it('rejects customer requests for delete (403)', async () => {
        const p = await factories.createProduct();
        const res = await request(app)
          .delete(`/api/products/${p.id}`)
          .set('Cookie', [`better-auth.session_token=${customerToken}`]);
        expect(res.status).toBe(403);
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
        const body = getResponseBody<ProductResponse>(res);
        expect(body.success).toBe(true);
      });

      it('returns 409 if primary is not in assigned list', async () => {
        const p = await factories.createProduct();
        const c = await factories.createCategory();
        const c2 = await factories.createCategory();

        const res = await request(app)
          .put(`/api/products/${p.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${adminToken}`])
          .send({ categoryIds: [c.id], primaryCategoryId: c2.id });

        expect(res.status).toBe(409); // Changed to 409 to match controller fix expectations
      });

      it('rejects unauthenticated and customer requests for update categories', async () => {
        const p = await factories.createProduct();
        const res1 = await request(app).put(`/api/products/${p.id}/categories`);
        expect(res1.status).toBe(401);

        const res2 = await request(app)
          .put(`/api/products/${p.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${customerToken}`]);
        expect(res2.status).toBe(403);
      });

      it('returns 400 for malformed body and invalid UUID in update categories', async () => {
        const p = await factories.createProduct();
        const res1 = await request(app)
          .put(`/api/products/${p.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${adminToken}`])
          .send({ categoryIds: 'not-an-array' });
        expect(res1.status).toBe(400);

        const res2 = await request(app)
          .put(`/api/products/${p.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${adminToken}`])
          .send({ categoryIds: ['invalid-uuid'] });
        expect(res2.status).toBe(400);
      });

      it('updates categories successfully as employee', async () => {
        const employeeUser = await factories.createUser();
        await factories.assignRole(employeeUser.id, 'employee');
        const employeeSession = await factories.createSession(employeeUser.id);

        const p = await factories.createProduct();
        const c = await factories.createCategory();

        const res = await request(app)
          .put(`/api/products/${p.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${employeeSession.token}`])
          .send({ categoryIds: [c.id], primaryCategoryId: c.id });

        expect(res.status).toBe(200);
      }, 10000);

      it('returns 409 when assigning deleted category or to deleted product', async () => {
        const p = await factories.createProduct();
        const deletedCat = await factories.createCategory();
        const { db, categories, products, eq } = await import('@wellness/db');
        await db
          .update(categories)
          .set({ deletedAt: new Date() })
          .where(eq(categories.id, deletedCat.id));

        const res1 = await request(app)
          .put(`/api/products/${p.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${adminToken}`])
          .send({ categoryIds: [deletedCat.id], primaryCategoryId: deletedCat.id });

        expect(res1.status).toBe(409); // Domain error

        const deletedProd = await factories.createProduct();
        await db
          .update(products)
          .set({ deletedAt: new Date() })
          .where(eq(products.id, deletedProd.id));
        const validCat = await factories.createCategory();

        const res2 = await request(app)
          .put(`/api/products/${deletedProd.id}/categories`)
          .set('Cookie', [`better-auth.session_token=${adminToken}`])
          .send({ categoryIds: [validCat.id], primaryCategoryId: validCat.id });

        expect(res2.status).toBe(404); // Product not found returns 404 because service checks existence
      });
    });
  });
});
