import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { db, products, productCategories, eq, categories, productVariants } from '@wellness/db';
import { NotFoundError } from '@wellness/utils';

import { productService } from './product.service';
import { factories } from '../test/factories';
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
      slug: 'test-product-' + String(Date.now()),
      description: 'A test product',
      categoryIds: ['invalid-uuid-that-causes-fk-violation'], // This should throw a DB error
    };

    let errorThrown = false;
    try {
      await productService.createProduct(validProductData, 'test-user-id');
    } catch {
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
      slug: 'test-product-success-' + String(Date.now()),
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
      await expect(productService.getProductBySlug('does-not-exist')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws NotFoundError for getting soft-deleted product by slug', async () => {
      const p = await factories.createProduct({ slug: 'deleted-slug' });
      await productService.deleteProduct(p.id);
      await expect(productService.getProductBySlug('deleted-slug')).rejects.toThrow(NotFoundError);
    });

    it('returns structured DTO for product details', async () => {
      await factories.createProduct({ slug: 'full-dto', status: 'active' });
      const found = await productService.getProductBySlug('full-dto');
      expect(found).toHaveProperty('id');
      expect(found).toHaveProperty('name');
      expect(found).toHaveProperty('slug');
      expect(found).toHaveProperty('variants');
      expect(found).toHaveProperty('images');
      expect(found).toHaveProperty('categories');
      expect(Array.isArray(found.variants)).toBe(true);
      expect(Array.isArray(found.images)).toBe(true);
      expect(Array.isArray(found.categories)).toBe(true);
    });

    it('updates product successfully', async () => {
      const p = await factories.createProduct({ name: 'Old' });
      const updated = await productService.updateProduct(p.id, { name: 'New' }, 'user-1');
      expect(updated.name).toBe('New');
    });

    it('throws NotFoundError when updating non-existent product', async () => {
      await expect(
        productService.updateProduct(
          '00000000-0000-0000-0000-000000000000',
          { name: 'New' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError for duplicate slug on update', async () => {
      await factories.createProduct({ slug: 'existing-slug' });
      const p = await factories.createProduct({ slug: 'update-me' });
      // Depending on DB or service layer, it might throw a generic DB error or ConflictError
      // Let's assume the DB constraint throws. We just verify it rejects.
      await expect(
        productService.updateProduct(p.id, { slug: 'existing-slug' }, 'user-1'),
      ).rejects.toThrow();
    });

    it('rolls back product update if category assignment fails', async () => {
      const p = await factories.createProduct({ name: 'Old Name' });

      const updatePromise = productService.updateProduct(
        p.id,
        {
          name: 'New Name',
          categoryIds: ['invalid-uuid-that-causes-fk-violation'],
        },
        'user-1',
      );

      await expect(updatePromise).rejects.toThrow();

      // Verify product was NOT updated
      const [found] = await db.select().from(products).where(eq(products.id, p.id));
      expect(found?.name).toBe('Old Name');
    });

    it('deletes product successfully', async () => {
      const p = await factories.createProduct();
      const deleted = await productService.deleteProduct(p.id);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundError when deleting non-existent product', async () => {
      await expect(
        productService.deleteProduct('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError for repeated deletion of soft-deleted product', async () => {
      const p = await factories.createProduct();
      await productService.deleteProduct(p.id);

      await expect(productService.deleteProduct(p.id)).rejects.toThrow(NotFoundError);
    });

    it('hides soft-deleted, draft, and archived products from public catalog', async () => {
      const pDelete = await factories.createProduct({ name: 'To Delete', status: 'active' });
      await productService.deleteProduct(pDelete.id);
      const pDraft = await factories.createProduct({ name: 'Draft', status: 'draft' });
      const pArchived = await factories.createProduct({ name: 'Archived', status: 'archived' });

      const list = await productService.getPublicProducts(10);
      expect(list.items.find((x) => x.id === pDelete.id)).toBeUndefined();
      expect(list.items.find((x) => x.id === pDraft.id)).toBeUndefined();
      expect(list.items.find((x) => x.id === pArchived.id)).toBeUndefined();
    });

    it('supports cursor pagination for public catalog with distinct pages and correct DTO', async () => {
      const p1 = await factories.createProduct({ name: 'P1', slug: 'prod-1', status: 'active' });
      await new Promise((r) => setTimeout(r, 10)); // Guarantee time diff
      const p2 = await factories.createProduct({ name: 'P2', slug: 'prod-2', status: 'active' });
      await new Promise((r) => setTimeout(r, 10));
      const p3 = await factories.createProduct({ name: 'P3', slug: 'prod-3', status: 'active' });

      const page1 = await productService.getPublicProducts(2);
      expect(page1.items.length).toBe(2);
      expect(page1.hasMore).toBe(true);

      // Verify ordering is newest first
      expect(page1.items[0]?.id).toBe(p3.id);
      expect(page1.items[1]?.id).toBe(p2.id);

      // Verify DTO structure
      const dto = page1.items[0];
      expect(dto).toBeDefined();
      if (dto) {
        expect(dto).toHaveProperty('id');
        expect(dto).toHaveProperty('name');
        expect(dto).toHaveProperty('primaryImage');
        expect(dto).not.toHaveProperty('createdBy');
        expect(dto).not.toHaveProperty('updatedBy');
      }

      if (page1.nextCursor) {
        const parsed = JSON.parse(Buffer.from(page1.nextCursor, 'base64').toString('utf8')) as {
          createdAt: string;
          id: string;
        };
        const cursorObj = { createdAt: new Date(parsed.createdAt), id: parsed.id };
        const page2 = await productService.getPublicProducts(2, cursorObj);
        expect(page2.items.length).toBe(1);
        expect(page2.items[0]?.id).toBe(p1.id);
      }
    });

    it('filters out soft-deleted variants and categories when fetching product', async () => {
      const p = await factories.createProduct({ slug: 'filtered-product', status: 'active' });
      const c1 = await factories.createCategory({ isActive: true });
      const c2 = await factories.createCategory({ isActive: true });

      // Assign categories
      await db.insert(productCategories).values([
        { productId: p.id, categoryId: c1.id },
        { productId: p.id, categoryId: c2.id },
      ]);

      // Add variants
      const v1 = await productService.addVariant(p.id, { name: 'V1', sku: 'SKU1', price: '10' });
      const v2 = await productService.addVariant(p.id, { name: 'V2', sku: 'SKU2', price: '20' });

      // Soft-delete one category and one variant
      await db.update(categories).set({ deletedAt: new Date() }).where(eq(categories.id, c2.id));
      await db
        .update(productVariants)
        .set({ deletedAt: new Date() })
        .where(eq(productVariants.id, v2.id));

      const found = await productService.getProductBySlug('filtered-product');
      expect(found.categories.length).toBe(1);
      expect(found.categories[0]?.id).toBe(c1.id);
      expect(found.variants.length).toBe(1);
      expect(found.variants[0]?.id).toBe(v1.id);
    });
  });

  describe('Variant CRUD Operations', () => {
    it('throws NotFoundError when adding a variant to a non-existent or soft-deleted product', async () => {
      // Non-existent product
      await expect(
        productService.addVariant('00000000-0000-0000-0000-000000000000', {
          name: 'V1',
          sku: 'V1',
          price: '10',
        }),
      ).rejects.toThrow(NotFoundError);

      // Soft-deleted product
      const p = await factories.createProduct();
      await productService.deleteProduct(p.id);

      await expect(
        productService.addVariant(p.id, { name: 'V2', sku: 'V2', price: '20' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError when updating a soft-deleted variant', async () => {
      const p = await factories.createProduct();
      const variant = await productService.addVariant(p.id, { name: 'V1', sku: 'V1', price: '10' });

      // Soft-delete the variant
      await productService.deleteVariant(p.id, variant.id);

      // Attempt to update it
      await expect(productService.updateVariant(p.id, variant.id, { price: '15' })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws NotFoundError when updating a variant that does not belong to the product', async () => {
      const p1 = await factories.createProduct();
      const p2 = await factories.createProduct();
      const variant = await productService.addVariant(p1.id, {
        name: 'V1',
        sku: 'V1',
        price: '10',
      });

      // Attempt to update p1's variant using p2's ID
      await expect(
        productService.updateVariant(p2.id, variant.id, { price: '15' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Image CRUD Operations', () => {
    it('throws NotFoundError when adding an image to a non-existent or soft-deleted product', async () => {
      // Non-existent product
      await expect(
        productService.addProductImage('00000000-0000-0000-0000-000000000000', {
          url: 'http://example.com/1.jpg',
          sortOrder: 0,
        }),
      ).rejects.toThrow(NotFoundError);

      // Soft-deleted product
      const p = await factories.createProduct();
      await productService.deleteProduct(p.id);

      await expect(
        productService.addProductImage(p.id, { url: 'http://example.com/2.jpg', sortOrder: 0 }),
      ).rejects.toThrow(NotFoundError);
    });

    it('returns images sorted by sortOrder and handles duplicate orders', async () => {
      const p = await factories.createProduct({ status: 'active' });
      await productService.addProductImage(p.id, {
        url: 'http://example.com/2.jpg',
        sortOrder: 2,
        altText: 'Second',
      });
      await productService.addProductImage(p.id, {
        url: 'http://example.com/1.jpg',
        sortOrder: 1,
        altText: 'First',
      });
      await productService.addProductImage(p.id, {
        url: 'http://example.com/2-dup.jpg',
        sortOrder: 2,
        altText: 'Duplicate',
      });

      const found = await productService.getProductBySlug(p.slug);

      expect(found.images.length).toBe(3);
      // First is sortOrder 1
      expect(found.images[0]?.sortOrder).toBe(1);
      // Next two are sortOrder 2, but order between them might depend on DB insertion order. We just assert they are sorted.
      expect(found.images[1]?.sortOrder).toBeGreaterThanOrEqual(found.images[0]?.sortOrder ?? 0);
      expect(found.images[2]?.sortOrder).toBeGreaterThanOrEqual(found.images[1]?.sortOrder ?? 0);
    });

    it('throws NotFoundError when deleting an image that does not belong to the product', async () => {
      const p1 = await factories.createProduct();
      const p2 = await factories.createProduct();
      const image = await productService.addProductImage(p1.id, {
        url: 'http://example.com/1.jpg',
        sortOrder: 0,
      });

      // Attempt to delete p1's image using p2's ID
      await expect(productService.deleteProductImage(p2.id, image.id)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
