import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { factories } from '../test/factories';

describe('Category API Controllers', () => {
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

    // 2. Create a normal customer user and session (no special role)
    const customerUser = await factories.createUser();
    const customerSession = await factories.createSession(customerUser.id);
    customerToken = customerSession.token;
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('GET /api/categories', () => {
    it('returns only active, public categories', async () => {
      await factories.createCategory({ name: 'Active Cat', slug: 'active-cat', isActive: true });
      await factories.createCategory({ name: 'Inactive Cat', slug: 'inactive-cat', isActive: false });

      const res = await request(app).get('/api/categories');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      
      // Ensure the inactive category is completely hidden
      const slugs = res.body.data.map((c: any) => c.slug);
      expect(slugs).toContain('active-cat');
      expect(slugs).not.toContain('inactive-cat');
    });
  });

  describe('GET /api/categories/:slug', () => {
    it('returns a category by slug', async () => {
      await factories.createCategory({ name: 'Find Me', slug: 'find-me', isActive: true });
      const res = await request(app).get('/api/categories/find-me');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Find Me');
    });

    it('returns 404 for non-existent category slug', async () => {
      const res = await request(app).get('/api/categories/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
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
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('new-cat');
    });

    it('returns 400 for bad payloads', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: '' }); // Invalid, slug missing, name empty
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      // Ensure we get Zod validation errors, not stack traces
      expect(res.body.errors).toBeDefined();
    });

    it('returns 409 for duplicate slug', async () => {
      await factories.createCategory({ slug: 'dup-slug' });
      
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'Dup', slug: 'dup-slug' });
      
      expect(res.status).toBe(409);
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
      expect(res.body.success).toBe(true);
      expect(res.body.data.deletedAt).toBeDefined();
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).patch('/api/categories/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });

    it('updates a category successfully', async () => {
      const cat = await factories.createCategory({ name: 'Old' });
      const res = await request(app)
        .patch(`/api/categories/${cat.id}`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New');
    });

    it('returns 404 for updating non-existent category', async () => {
      const res = await request(app)
        .patch(`/api/categories/00000000-0000-0000-0000-000000000000`)
        .set('Cookie', [`better-auth.session_token=${adminToken}`])
        .send({ name: 'New' });
      
      expect(res.status).toBe(404);
    });
  });
});
