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
  });
});
