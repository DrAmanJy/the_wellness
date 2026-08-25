import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productService } from './product.service';
import { factories } from '../test/factories';
import { db, products, productCategories, eq, user } from '@wellness/db';
import { ConflictError } from '@wellness/utils';

// Mock DB for isolated testing, but to test real transaction rollbacks
// we ideally use a real test DB. For this example, we'll demonstrate
// the rollback behavior using a test Postgres instance via Vitest.

describe('ProductService', () => {
  beforeEach(async () => {
    // Ensure test user exists
    await factories.createUser({ id: 'test-user-id' });
    await factories.createUser({ id: 'user-1' });
    await factories.createUser({ id: 'user-2' });
    await factories.createUser({ id: 'user-3' });
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  it('rolls back product creation if category assignment fails', async () => {
    const validProductData = {
      name: 'Test Product',
      slug: 'test-product-' + Date.now(),
      description: 'A test product',
      categoryIds: ['invalid-uuid-that-causes-fk-violation'], // This should throw a DB error
    };

    let errorThrown = false;
    try {
      await productService.createProduct(validProductData, 'test-user-id');
    } catch (e) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(true);

    // Verify the product was NOT created due to transaction rollback
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.slug, validProductData.slug));
    expect(allProducts.length).toBe(0); // Should be rolled back
  });

  it('creates product successfully with valid transaction', async () => {
    const validProductData = {
      name: 'Test Product Success',
      slug: 'test-product-success-' + Date.now(),
      description: 'A test product',
      categoryIds: [],
    };

    const newProduct = await productService.createProduct(validProductData, 'test-user-id');
    expect(newProduct).toBeDefined();
    expect(newProduct.slug).toBe(validProductData.slug);

    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.slug, validProductData.slug));
    expect(allProducts.length).toBe(1);
  });

  it('rejects concurrent duplicate slug requests via database constraint', async () => {
    const duplicateSlug = 'concurrent-duplicate-slug';

    const productData = {
      name: 'Concurrent Product',
      slug: duplicateSlug,
      description: 'Test concurrent insertions',
    };

    // Fire 3 simultaneous insertions with the exact same slug
    const promises = [
      productService.createProduct(productData, 'user-1'),
      productService.createProduct(productData, 'user-2'),
      productService.createProduct(productData, 'user-3'),
    ];

    const results = await Promise.allSettled(promises);

    // Exactly one should succeed, the rest should fail with a DB unique constraint error
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(2);

    // Verify only 1 exists in DB
    const allProducts = await db.select().from(products).where(eq(products.slug, duplicateSlug));
    expect(allProducts.length).toBe(1);
  });

  describe('Read & Delete Operations', () => {
    it('fetches product by slug successfully', async () => {
      const p = await factories.createProduct({ slug: 'found-me' });
      const found = await productService.getProductBySlug('found-me');
      expect(found).toBeDefined();
      expect(found.id).toBe(p.id);
    });

    it('throws NotFoundError for non-existent product slug', async () => {
      await expect(productService.getProductBySlug('does-not-exist'))
        .rejects.toThrow();
    });

    it('updates product successfully', async () => {
      const p = await factories.createProduct({ name: 'Old' });
      const updated = await productService.updateProduct(p.id, { name: 'New' }, 'user-1');
      expect(updated.name).toBe('New');
    });

    it('throws NotFoundError when updating non-existent product', async () => {
      await expect(productService.updateProduct('00000000-0000-0000-0000-000000000000', { name: 'New' }, 'user-1'))
        .rejects.toThrow();
    });

    it('deletes product successfully', async () => {
      const p = await factories.createProduct();
      const deleted = await productService.deleteProduct(p.id);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundError when deleting non-existent product', async () => {
      await expect(productService.deleteProduct('00000000-0000-0000-0000-000000000000'))
        .rejects.toThrow();
    });

    it('hides soft-deleted products from public catalog', async () => {
      const p = await factories.createProduct({ name: 'To Delete' });
      await productService.deleteProduct(p.id);
      const list = await productService.getPublicProducts(10);
      expect(list.items.find(x => x.id === p.id)).toBeUndefined();
    });

    it('supports cursor pagination for public catalog', async () => {
      const p1 = await factories.createProduct({ slug: 'prod-1' });
      const p2 = await factories.createProduct({ slug: 'prod-2' });
      
      const page1 = await productService.getPublicProducts(1);
      expect(page1.items.length).toBe(1);
      expect(page1.hasMore).toBe(true);

      if (page1.nextCursor) {
        const page2 = await productService.getPublicProducts(1, page1.nextCursor);
        expect(page2.items.length).toBe(1);
      }
    });
  });
});
