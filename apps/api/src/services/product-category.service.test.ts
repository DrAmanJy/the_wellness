import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { productService } from './product.service';
import { factories } from '../test/factories';
import { ConflictError } from '@wellness/utils';

describe('ProductService - Categories Assignment', () => {
  let user: any;
  let product: any;
  let cat1: any;
  let cat2: any;
  let cat3: any;

  beforeEach(async () => {
    user = await factories.createUser();
    product = await factories.createProduct({ createdBy: user.id, updatedBy: user.id });
    cat1 = await factories.createCategory({ slug: 'cat-1' });
    cat2 = await factories.createCategory({ slug: 'cat-2' });
    cat3 = await factories.createCategory({ slug: 'cat-3' });
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('updateProductCategories', () => {
    it('assigns categories to product successfully', async () => {
      await productService.updateProductCategories(product.id, [cat1.id, cat2.id]);
      
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.categories).toHaveLength(2);
      
      const slugs = fetched.categories.map((c: any) => c.slug);
      expect(slugs).toContain('cat-1');
      expect(slugs).toContain('cat-2');
    });

    it('assigns primary category successfully if in assigned list', async () => {
      await productService.updateProductCategories(product.id, [cat1.id, cat2.id], cat1.id);
      
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.categoryPrimaryId).toBe(cat1.id);
    });

    it('throws ConflictError if primary category is not in assigned list', async () => {
      await expect(
        productService.updateProductCategories(product.id, [cat1.id, cat2.id], cat3.id)
      ).rejects.toThrow(ConflictError);
      
      // Ensure transaction rolled back
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.categories).toHaveLength(0); // Should be rolled back to 0
    });

    it('completely replaces old categories on update', async () => {
      await productService.updateProductCategories(product.id, [cat1.id, cat2.id]);
      await productService.updateProductCategories(product.id, [cat3.id]);
      
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.categories).toHaveLength(1);
      expect(fetched.categories?.[0]?.slug).toBe('cat-3');
    });

    it('throws constraint error for invalid category id', async () => {
      let error: any;
      try {
        await productService.updateProductCategories(product.id, ['00000000-0000-0000-0000-000000000000']);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(String(error.cause || error)).toMatch(/violates foreign key constraint/);
    });
  });
});
