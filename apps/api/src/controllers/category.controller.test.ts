import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { app } from '../app';
import { factories } from '../test/factories';
import { CategoryResponse, CategoryListResponse } from '../test/test-utils';

describe('Category API Controllers', () => {
  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    // 1. Create an admin user and session
    const adminUser = await factories.createUser();

    await factories.assignRole(adminUser.id, 'admin');
    const adminSession = await factories.createSession(adminUser.id);
    adminToken = adminSession.token;

    // 2. Create a normal customer user and session (no special role)
    const customerUser = await factories.createUser();
    const customerSession = await factories.createSession(customerUser.id);
    customerToken = customerSession.token;
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('GET /api/categories', () => {
    it('returns only active, public, non-deleted categories', async () => {
      await factories.createCategory({ name: 'Active Cat', slug: 'active-cat', isActive: true });
      await factories.createCategory({
        name: 'Inactive Cat',
        slug: 'inactive-cat',
        isActive: false,
      });
      const deletedCat = await factories.createCategory({
        name: 'Deleted Cat',
        slug: 'deleted-cat',
        isActive: true,
      });
      const { db, categories, eq } = await import('@wellness/db');
      await db
        .update(categories)
        .set({ deletedAt: new Date() })
        .where(eq(categories.id, deletedCat.id));

      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect((res.body as CategoryListResponse).success).toBe(true);
      expect((res.body as CategoryListResponse).data.length).toBe(1);

      // Ensure only the active category is returned
      const slugs = (res.body as CategoryListResponse).data.map((c) => c.slug);
      expect(slugs).toContain('active-cat');
      expect(slugs).not.toContain('inactive-cat');
      expect(slugs).not.toContain('deleted-cat');

      // Verify DTO structure doesn't leak internal fields
      const dto = (res.body as CategoryListResponse).data[0];
      expect(dto).not.toHaveProperty('createdBy');
      expect(dto).not.toHaveProperty('updatedBy');
      expect(dto).not.toHaveProperty('deletedAt');
      expect(dto).not.toHaveProperty('createdAt');
      expect(dto).not.toHaveProperty('updatedAt');
      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('slug');
    });
  });

  describe('GET /api/categories/:slug', () => {
    it('returns a category by slug', async () => {
      await factories.createCategory({ name: 'Find Me', slug: 'find-me', isActive: true });
      const res = await request(app).get('/api/categories/find-me');
      expect(res.status).toBe(200);
      expect((res.body as CategoryResponse).success).toBe(true);
      expect((res.body as CategoryResponse).data.name).toBe('Find Me');
    });

    it('returns 404 for non-existent category slug', async () => {
      const res = await request(app).get('/api/categories/does-not-exist');
      expect(res.status).toBe(404);
      expect((res.body as CategoryResponse).success).toBe(false);
    });

    it('returns 404 for inactive category slug', async () => {
      await factories.createCategory({
        name: 'Inactive Cat',
        slug: 'inactive-cat',
        isActive: false,
      });
      const res = await request(app).get('/api/categories/inactive-cat');
      expect(res.status).toBe(404);
    });

    it('returns 404 for soft-deleted category slug', async () => {
      const deletedCat = await factories.createCategory({
        name: 'Deleted Cat',
        slug: 'deleted-cat',
        isActive: true,
      });
      const { db, categories, eq } = await import('@wellness/db');
      await db
        .update(categories)
        .set({ deletedAt: new Date() })
        .where(eq(categories.id, deletedCat.id));

      const res = await request(app).get('/api/categories/deleted-cat');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/categories', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'No Auth', slug: 'no-auth' });

      expect(res.status).toBe(401);
    });

    it('rejects customers / non-admins (403)', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${customerToken}`])
        .send({ name: 'Customer Cat', slug: 'customer-cat' });

      expect(res.status).toBe(403);
    });

    it('creates a category as admin (201)', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New Cat', slug: 'new-cat' });

      expect(res.status).toBe(201);
      expect((res.body as CategoryResponse).success).toBe(true);
      expect((res.body as CategoryResponse).data.slug).toBe('new-cat');
    });

    it('returns 400 for bad payloads', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: '' }); // Invalid, slug missing, name empty

      expect(res.status).toBe(400);
      expect((res.body as CategoryResponse).success).toBe(false);
      // Ensure we get Zod validation errors, not stack traces
      expect((res.body as CategoryResponse).errors).toBeDefined();
    });

    it('returns 409 for duplicate slug', async () => {
      await factories.createCategory({ slug: 'dup-slug' });

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'Dup', slug: 'dup-slug' });

      expect(res.status).toBe(409);
    });

    it('returns 409 for deleted parent on create', async () => {
      const deletedParent = await factories.createCategory();
      const { db, categories, eq } = await import('@wellness/db');
      await db
        .update(categories)
        .set({ deletedAt: new Date() })
        .where(eq(categories.id, deletedParent.id));

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'Child', slug: 'child', parentId: deletedParent.id });

      expect(res.status).toBe(409);
    });

    it('creates a category as employee (201)', async () => {
      const employeeUser = await factories.createUser();
      await factories.assignRole(employeeUser.id, 'employee');
      const employeeSession = await factories.createSession(employeeUser.id);

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${employeeSession.token}`])
        .send({ name: 'Employee Cat', slug: 'emp-cat' });

      expect(res.status).toBe(201);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('returns 409 when deleting a category with products', async () => {
      const cat = await factories.createCategory();
      // the factory automatically handles cleanup, we'll manually link in the test
      // actually, just mocking the DB structure

      // Let's rely on the service-level check logic since controllers delegate to services.
      // Wait, we need to link it actually for real integration.
      const product = await factories.createProduct();
      const { db, productCategories } = await import('@wellness/db');
      await db.insert(productCategories).values({ productId: product.id, categoryId: cat.id });

      const res = await request(app)
        .delete(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`]);

      expect(res.status).toBe(409);
    });

    it('returns 404 for malformed UUID or non-existent category', async () => {
      const res = await request(app)
        .delete(`/api/categories/invalid-uuid`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`]);

      expect(res.status).toBe(400); // Because UUID validation fails in Zod first

      const res2 = await request(app)
        .delete(`/api/categories/00000000-0000-0000-0000-000000000000`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`]);

      expect(res2.status).toBe(404);
    });

    it('successfully soft-deletes a category', async () => {
      const cat = await factories.createCategory();
      const res = await request(app)
        .delete(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`]);
      expect(res.status).toBe(200);
      expect((res.body as CategoryResponse).success).toBe(true);
    });

    it('successfully soft-deletes a category as employee', async () => {
      const employeeUser = await factories.createUser();
      await factories.assignRole(employeeUser.id, 'employee');
      const employeeSession = await factories.createSession(employeeUser.id);

      const cat = await factories.createCategory();
      const res = await request(app)
        .delete(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${employeeSession.token}`]);
      expect(res.status).toBe(200);
    });

    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).delete('/api/categories/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });

    it('rejects customer requests for delete (403)', async () => {
      const cat = await factories.createCategory();
      const res = await request(app)
        .delete(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${customerToken}`]);
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).patch('/api/categories/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });

    it('rejects customer requests for update (403)', async () => {
      const cat = await factories.createCategory({ name: 'Old' });
      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${customerToken}`])
        .send({ name: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('updates a category successfully', async () => {
      const cat = await factories.createCategory({ name: 'Old' });
      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New' });

      expect(res.status).toBe(200);
      expect((res.body as CategoryResponse).success).toBe(true);
      expect((res.body as CategoryResponse).data.name).toBe('New');
    });

    it('updates a category successfully as employee', async () => {
      const employeeUser = await factories.createUser();
      await factories.assignRole(employeeUser.id, 'employee');
      const employeeSession = await factories.createSession(employeeUser.id);

      const cat = await factories.createCategory({ name: 'Old' });
      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${employeeSession.token}`])
        .send({ name: 'New Emp' });

      expect(res.status).toBe(200);
      expect((res.body as CategoryResponse).data.name).toBe('New Emp');
    });

    it('returns 404 for updating non-existent category', async () => {
      const res = await request(app)
        .patch(`/api/categories/00000000-0000-0000-0000-000000000000`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New' });

      expect(res.status).toBe(404);
    });

    it('returns 409 for duplicate slug on update', async () => {
      await factories.createCategory({ slug: 'existing-slug' });
      const cat = await factories.createCategory({ slug: 'my-slug' });

      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ slug: 'existing-slug' });

      expect(res.status).toBe(409);
    });

    it('returns 409 for self-parenting', async () => {
      const cat = await factories.createCategory();

      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ parentId: cat.id }); // self-parenting

      expect(res.status).toBe(409);
    });

    it('returns 409 for deleted parent on update', async () => {
      const deletedParent = await factories.createCategory();
      const { db, categories, eq } = await import('@wellness/db');
      await db
        .update(categories)
        .set({ deletedAt: new Date() })
        .where(eq(categories.id, deletedParent.id));

      const cat = await factories.createCategory();

      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ parentId: deletedParent.id });

      expect(res.status).toBe(409);
    });
  });
});
