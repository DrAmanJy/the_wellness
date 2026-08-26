import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ConflictError } from '@wellness/utils';

import { productService } from './product.service';
import { factories } from '../test/factories';

describe('ProductService - Categories Assignment', () => {
  let user: import('../test/factories').FactoryUser;
  let product: import('../test/factories').FactoryProduct;
  let cat1: import('../test/factories').FactoryCategory;
  let cat2: import('../test/factories').FactoryCategory;
  let cat3: import('../test/factories').FactoryCategory;

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

      const slugs = fetched.categories.map((c: { slug: string }) => c.slug);
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
        productService.updateProductCategories(product.id, [cat1.id, cat2.id], cat3.id),
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
      expect(fetched.categories[0]?.slug).toBe('cat-3');
    });

    it('empty categoryIds clears assignments', async () => {
      await productService.updateProductCategories(product.id, [cat1.id, cat2.id]);
      await productService.updateProductCategories(product.id, []);

      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.categories).toHaveLength(0);
      expect(fetched.categoryPrimaryId).toBeNull();
    });

    it('throws constraint error for invalid category id (not found)', async () => {
      await expect(
        productService.updateProductCategories(product.id, [
          '00000000-0000-0000-0000-000000000000',
        ]),
      ).rejects.toThrow();
    });

    it('throws error when assigning a soft-deleted or inactive category', async () => {
      const deletedCat = await factories.createCategory({ slug: 'deleted-cat' });
      const { categoryService } = await import('./category.service');
      await categoryService.deleteCategory(deletedCat.id);

      await expect(
        productService.updateProductCategories(product.id, [deletedCat.id]),
      ).rejects.toThrow();
    });

    it('throws error when assigning to a deleted product', async () => {
      const deletedProduct = await factories.createProduct();
      await productService.deleteProduct(deletedProduct.id);

      await expect(
        productService.updateProductCategories(deletedProduct.id, [cat1.id]),
      ).rejects.toThrow();
    });
  });
});
