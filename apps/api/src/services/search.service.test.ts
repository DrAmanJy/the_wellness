import { describe, expect, it, beforeAll, afterAll } from 'vitest';

import { db, productVariants } from '@wellness/db';

import { searchService } from './search.service';
import { factories } from '../test/factories';

describe('SearchService', () => {
  beforeAll(async () => {
    await factories.cleanup();
  });

  afterAll(async () => {
    await factories.cleanup();
  });

  describe('searchCatalog', () => {
    it('returns empty for short or empty queries', async () => {
      const res1 = await searchService.searchCatalog('');
      expect(res1.products).toHaveLength(0);
      expect(res1.categories).toHaveLength(0);

      const res2 = await searchService.searchCatalog('   ');
      expect(res2.products).toHaveLength(0);
      expect(res2.categories).toHaveLength(0);
    });

    it('searches products by name, slug, description, and variant sku', async () => {
      const p1 = await factories.createProduct({
        name: 'Organic Matcha Tea',
        slug: 'organic-matcha',
        description: 'Premium quality matcha powder',
        status: 'active',
      });
      await db.insert(productVariants).values({
        productId: p1.id,
        name: 'Default',
        sku: 'MATCHA-01',
        price: '19.99',
        currency: 'USD',
      });

      const p2 = await factories.createProduct({
        name: 'Coffee Beans',
        slug: 'coffee-beans',
        status: 'active',
      });
      await db.insert(productVariants).values({
        productId: p2.id,
        name: 'Default',
        sku: 'COFFEE-01',
        price: '14.99',
        currency: 'USD',
      });

      // Search by name
      const resName = await searchService.searchCatalog('Matcha');
      expect(resName.products).toHaveLength(1);
      if (!resName.products[0]) throw new Error();
      expect(resName.products[0].id).toBe(p1.id);

      // Search by sku
      const resSku = await searchService.searchCatalog('MATCHA-01');
      expect(resSku.products).toHaveLength(1);
      const product = resSku.products[0];
      expect(product).toBeDefined();
      if (product) {
        expect(product.id).toBe(p1.id);
      }
    });

    it('excludes inactive, draft, and soft-deleted products and categories', async () => {
      await factories.createProduct({
        name: 'Draft Product',
        slug: 'draft-product',
        status: 'draft',
      });
      await factories.createProduct({
        name: 'Deleted Product',
        slug: 'deleted-product',
        status: 'active',
        deletedAt: new Date(),
      });

      await factories.createCategory({
        name: 'Inactive Category',
        slug: 'inactive-category',
        isActive: false,
      });
      const deletedCategory = await factories.createCategory({
        name: 'Deleted Category',
        slug: 'deleted-category',
        isActive: true,
      });
      const { categories, eq } = await import('@wellness/db');
      await db
        .update(categories)
        .set({ deletedAt: new Date() })
        .where(eq(categories.id, deletedCategory.id));

      const res = await searchService.searchCatalog('Product');
      expect(res.products.find((p) => p.name === 'Draft Product')).toBeUndefined();
      expect(res.products.find((p) => p.name === 'Deleted Product')).toBeUndefined();

      const resCat = await searchService.searchCatalog('Category');
      expect(resCat.categories.find((c) => c.name === 'Inactive Category')).toBeUndefined();
      expect(resCat.categories.find((c) => c.name === 'Deleted Category')).toBeUndefined();
    });
  });

  describe('getSuggestions', () => {
    it('returns combined suggestions limited to limit', async () => {
      await factories.createProduct({ name: 'Apple Watch', slug: 'apple-watch', status: 'active' });
      await factories.createProduct({ name: 'Apple TV', slug: 'apple-tv', status: 'active' });
      await factories.createCategory({
        name: 'Apple Accessories',
        slug: 'apple-accessories',
        isActive: true,
      });

      const res = await searchService.getSuggestions('Apple', 2);
      expect(res).toHaveLength(2);
      if (!res[0]) throw new Error();
      expect(res[0].type).toBeDefined();
    });
  });
});
