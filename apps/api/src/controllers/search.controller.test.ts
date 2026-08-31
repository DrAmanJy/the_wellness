import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { db, productCategories } from '@wellness/db';

import { app } from '../app';
import { factories } from '../test/factories';
import { getResponseBody, SearchResponse, SearchSuggestionResponse } from '../test/test-utils';

describe('Search API Controllers', () => {
  describe('GET /api/search', () => {
    it('returns exact fields according to ProductListDTO contract (M26)', async () => {
      // 1. Create a category
      const category = await factories.createCategory();

      // 2. Create a product and assign category
      const product = await factories.createProduct({
        name: 'M26 Contract Test Product',
        status: 'active',
      });

      await db.insert(productCategories).values({
        productId: product.id,
        categoryId: category.id,
      });

      // 3. Create a variant
      await factories.createVariant(product.id);

      // 4. Hit the search API
      const res = await request(app).get('/api/search').query({ q: 'M26' });

      expect(res.status).toBe(200);
      const body = getResponseBody<SearchResponse>(res);
      console.log('Search API response:', body);

      expect(body.products).toBeInstanceOf(Array);
      expect(body.products.length).toBeGreaterThan(0);

      const item = body.products[0];
      if (!item) throw new Error('Item missing');

      // Assert exact keys to prevent overfetching
      // Note: category was added in the mapper
      expect(Object.keys(item).sort()).toEqual(
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
    });

    it('excludes inactive and soft-deleted products', async () => {
      // 1. Create an active product
      const activeProduct = await factories.createProduct({
        name: 'Visible Search Product',
        status: 'active',
      });
      await factories.createVariant(activeProduct.id);

      // 2. Create a draft product
      const draftProduct = await factories.createProduct({
        name: 'Hidden Draft Search Product',
        status: 'draft',
      });
      await factories.createVariant(draftProduct.id);

      // 3. Create a soft-deleted product
      const deletedProduct = await factories.createProduct({
        name: 'Hidden Deleted Search Product',
        status: 'active',
      });
      await factories.createVariant(deletedProduct.id);

      const { products, eq } = await import('@wellness/db');
      await db
        .update(products)
        .set({ deletedAt: new Date() })
        .where(eq(products.id, deletedProduct.id));

      // 4. Hit the search API
      const res = await request(app).get('/api/search').query({ q: 'Search Product' });

      expect(res.status).toBe(200);
      const body = getResponseBody<SearchResponse>(res);

      expect(body.products).toBeInstanceOf(Array);

      const returnedNames = body.products.map((p) => p.name);
      expect(returnedNames).toContain('Visible Search Product');
      expect(returnedNames).not.toContain('Hidden Draft Search Product');
      expect(returnedNames).not.toContain('Hidden Deleted Search Product');
    });
  });
  describe('GET /api/search/suggestions', () => {
    it('returns exact fields according to SearchSuggestionDTO contract (M32)', async () => {
      // 1. Create a product
      await factories.createProduct({
        name: 'M32 Suggestion Product',
        status: 'active',
      });

      // 2. Hit the suggestions API
      const res = await request(app).get('/api/search/suggestions').query({ q: 'M32' });

      expect(res.status).toBe(200);
      const body = getResponseBody<SearchSuggestionResponse>(res);
      expect(body.suggestions).toBeInstanceOf(Array);
      expect(body.suggestions.length).toBeGreaterThan(0);

      const suggestion = body.suggestions[0];
      if (!suggestion) throw new Error('Suggestion missing');

      // Assert exact keys to prevent leaking internal DB fields
      expect(Object.keys(suggestion).sort()).toEqual(['id', 'label', 'slug', 'type'].sort());
    });

    it('excludes inactive and soft-deleted products from suggestions', async () => {
      // 1. Create an active product
      const activeProduct = await factories.createProduct({
        name: 'Visible Suggestion Product',
        status: 'active',
      });
      await factories.createVariant(activeProduct.id);

      // 2. Create a draft product
      const draftProduct = await factories.createProduct({
        name: 'Hidden Draft Suggestion Product',
        status: 'draft',
      });
      await factories.createVariant(draftProduct.id);

      // 3. Create a soft-deleted product
      const deletedProduct = await factories.createProduct({
        name: 'Hidden Deleted Suggestion Product',
        status: 'active',
      });
      await factories.createVariant(deletedProduct.id);

      const { products, eq } = await import('@wellness/db');
      await db
        .update(products)
        .set({ deletedAt: new Date() })
        .where(eq(products.id, deletedProduct.id));

      // 4. Hit the suggestions API
      const res = await request(app)
        .get('/api/search/suggestions')
        .query({ q: 'Suggestion Product' });

      expect(res.status).toBe(200);
      const body = getResponseBody<SearchSuggestionResponse>(res);

      expect(body.suggestions).toBeInstanceOf(Array);

      const returnedLabels = body.suggestions.map((s) => s.label);
      expect(returnedLabels).toContain('Visible Suggestion Product');
      expect(returnedLabels).not.toContain('Hidden Draft Suggestion Product');
      expect(returnedLabels).not.toContain('Hidden Deleted Suggestion Product');
    });
  });
});
