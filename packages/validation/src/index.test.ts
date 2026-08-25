import { describe, it, expect } from 'vitest';
import { CreateCategorySchema, CreateProductSchema, CreateVariantSchema, paginationSchema } from './index';

describe('Validation Schemas', () => {
  describe('Pagination Schema', () => {
    it('applies defaults correctly', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('rejects limits over 100', () => {
      const result = paginationSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('rejects negative pages', () => {
      const result = paginationSchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateCategorySchema', () => {
    it('accepts valid category payload', () => {
      const result = CreateCategorySchema.safeParse({
        name: 'Test Category',
        slug: 'test-category'
      });
      expect(result.success).toBe(true);
    });

    it('rejects slugs with spaces or uppercase', () => {
      const result1 = CreateCategorySchema.safeParse({ name: 'Test', slug: 'Test Slug' });
      expect(result1.success).toBe(false);

      const result2 = CreateCategorySchema.safeParse({ name: 'Test', slug: 'Test-Slug' });
      expect(result2.success).toBe(false);
    });

    it('enforces maximum length on slug to prevent database truncation', () => {
      const longSlug = 'a'.repeat(256);
      const result = CreateCategorySchema.safeParse({ name: 'Test', slug: longSlug });
      expect(result.success).toBe(false);
    });

    it('validates parentId as UUID', () => {
      const result = CreateCategorySchema.safeParse({
        name: 'Test',
        slug: 'test',
        parentId: 'invalid-uuid'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateProductSchema', () => {
    it('accepts valid product payload', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Test Product',
        slug: 'test-product'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft'); // Default value
      }
    });

    it('rejects invalid status', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Test',
        slug: 'test',
        status: 'invalid-status'
      });
      expect(result.success).toBe(false);
    });

    it('prevents excessively long descriptions to prevent memory exhaustion', () => {
      const longDesc = 'a'.repeat(501);
      const result = CreateProductSchema.safeParse({
        name: 'Test',
        slug: 'test',
        shortDescription: longDesc
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateVariantSchema', () => {
    it('accepts valid variant payload', () => {
      const result = CreateVariantSchema.safeParse({
        name: 'Test Variant',
        sku: 'TEST-01',
        price: 19.99
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative prices', () => {
      const result = CreateVariantSchema.safeParse({
        name: 'Test',
        sku: 'TEST',
        price: -10
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative compareAtPrice', () => {
      const result = CreateVariantSchema.safeParse({
        name: 'Test',
        sku: 'TEST',
        price: 10,
        compareAtPrice: -5
      });
      expect(result.success).toBe(false);
    });

    it('requires exact 3 character currency code', () => {
      const result = CreateVariantSchema.safeParse({
        name: 'Test',
        sku: 'TEST',
        price: 10,
        currency: 'US' // Too short
      });
      expect(result.success).toBe(false);
    });
  });
});
