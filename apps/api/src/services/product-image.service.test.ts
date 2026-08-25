import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { productService } from './product.service';
import { factories } from '../test/factories';
import { NotFoundError } from '@wellness/utils';

describe('ProductService - Images', () => {
  let user: any;
  let product: any;
  let variant: any;

  beforeEach(async () => {
    user = await factories.createUser();
    product = await factories.createProduct({ createdBy: user.id, updatedBy: user.id, status: 'active' });
    variant = await productService.addVariant(product.id, {
      name: 'Variant 1',
      sku: 'TEST-IMG-V1',
      price: '10.00'
    });
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('addProductImage', () => {
    it('adds product-level image successfully', async () => {
      const img = await productService.addProductImage(product.id, {
        url: 'https://example.com/img1.jpg',
        altText: 'Test Image',
        sortOrder: 1,
        isPrimary: true
      });
      
      expect(img.id).toBeDefined();
      expect(img.url).toBe('https://example.com/img1.jpg');
      
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.images).toHaveLength(1);
      expect(fetched.images?.[0]?.isPrimary).toBe(true);
    });

    it('adds variant-specific image successfully', async () => {
      const img = await productService.addProductImage(product.id, {
        url: 'https://example.com/variant1.jpg',
        variantId: variant.id,
        sortOrder: 0
      });
      
      expect(img.variantId).toBe(variant.id);
    });

    it('throws error for invalid productId (FK constraint)', async () => {
      let error: any;
      try {
        await productService.addProductImage('00000000-0000-0000-0000-000000000000', {
          url: 'https://example.com/img1.jpg'
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(String(error.cause || error)).toMatch(/violates foreign key constraint/);
    });

    it('unsets other primary images when a new one is set to primary', async () => {
      const img1 = await productService.addProductImage(product.id, {
        url: 'https://example.com/1.jpg',
        isPrimary: true
      });
      
      const img2 = await productService.addProductImage(product.id, {
        url: 'https://example.com/2.jpg',
        isPrimary: true
      });
      
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.images).toHaveLength(2);
      
      const p1 = fetched.images.find((i: any) => i.id === img1!.id);
      const p2 = fetched.images.find((i: any) => i.id === img2!.id);
      
      expect(p1?.isPrimary).toBe(false);
      expect(p2?.isPrimary).toBe(true);
    });

    it('rejects concurrent assignments of multiple primary images via database constraint', async () => {
      // Create two non-primary images first
      const img1 = await productService.addProductImage(product.id, {
        url: 'https://example.com/c1.jpg',
        isPrimary: false
      });
      const img2 = await productService.addProductImage(product.id, {
        url: 'https://example.com/c2.jpg',
        isPrimary: false
      });

      // To test the exact race condition where the application logic evaluates to true for both, 
      // we bypass the service's updateProductImage transaction (which serializes safely normally)
      // and forcefully execute concurrent Drizzle queries against the DB constraint directly
      const { db, productImages, eq } = await import('@wellness/db');
      
      const p1_query = db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, img1!.id));
      const p2_query = db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, img2!.id));
      
      // We expect one to succeed and one to fail due to the partial unique index
      const results = await Promise.allSettled([p1_query, p2_query]);
      
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      
      if (rejected[0]?.status === 'rejected') {
        const err: any = rejected[0].reason;
        const isConstraint = err.code === '23505' || 
          (err.cause && err.cause.code === '23505') || 
          (err.name === 'PostgresError' && err.code === '23505') ||
          (err.message && err.message.includes('duplicate key value'));
        expect(isConstraint).toBe(true);
      }
    });
  });

  describe('updateProductImage', () => {
    it('updates image data and handles primary image transaction', async () => {
      const img1 = await productService.addProductImage(product.id, {
        url: 'https://example.com/1.jpg',
        isPrimary: true
      });
      
      const img2 = await productService.addProductImage(product.id, {
        url: 'https://example.com/2.jpg',
        isPrimary: false
      });
      
      // Update img2 to be primary
      await productService.updateProductImage(img2.id, { isPrimary: true });
      
      const fetched = await productService.getProductBySlug(product.slug);
      const p1 = fetched.images.find((i: any) => i.id === img1!.id);
      const p2 = fetched.images.find((i: any) => i.id === img2!.id);
      
      expect(p1?.isPrimary).toBe(false); // Should have been unset
      expect(p2?.isPrimary).toBe(true);
    });

    it('throws NotFoundError for invalid image ID', async () => {
      await expect(
        productService.updateProductImage('00000000-0000-0000-0000-000000000000', { isPrimary: true })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteProductImage', () => {
    it('deletes image permanently', async () => {
      const img = await productService.addProductImage(product.id, {
        url: 'https://example.com/delete-me.jpg'
      });
      
      await productService.deleteProductImage(img.id);
      
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.images).toHaveLength(0);
    });

    it('throws NotFoundError for non-existent image', async () => {
      await expect(
        productService.deleteProductImage('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
