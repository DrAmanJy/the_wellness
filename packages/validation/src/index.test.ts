import { describe, it, expect } from 'vitest';

import {
  CreateCategorySchema,
  CreateProductSchema,
  AddItemSchema,
  paginationSchema,
  CreateAddressSchema,
  createOrderSchema,
  createPaymentOrderSchema,
  SearchSchema,
} from './index';

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
        slug: 'test-category',
      });
      expect(result.success).toBe(true);
    });

    it('rejects names containing HTML tag boundary characters', () => {
      const result1 = CreateCategorySchema.safeParse({
        name: 'Test <script>',
        slug: 'test-category',
      });
      expect(result1.success).toBe(false);

      const result2 = CreateCategorySchema.safeParse({ name: 'Test >', slug: 'test-category' });
      expect(result2.success).toBe(false);
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
  });

  describe('CreateProductSchema', () => {
    it('accepts valid product payload', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Test Product',
        description: 'Comprehensive test product description.',
        sellingPrice: 100,
        mrp: 150,
        images: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stockStatus).toBe('in_stock');
      }
    });

    it('rejects product payload with fewer than 2 images', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Test Product',
        description: 'Comprehensive test product description.',
        sellingPrice: 100,
        mrp: 150,
        images: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects names containing HTML tag boundary characters', () => {
      const result1 = CreateProductSchema.safeParse({
        name: 'Test <script>',
        description: 'Comprehensive test product description.',
        sellingPrice: 100,
        mrp: 150,
        images: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
      });
      expect(result1.success).toBe(false);
    });

    it('rejects mrp less than sellingPrice', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Test Product',
        description: 'Comprehensive test product description.',
        sellingPrice: 200,
        mrp: 100,
        images: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
      });
      expect(result.success).toBe(false);
    });

    it('handles empty string categoryId by preprocessing to null', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Test Product',
        description: 'Comprehensive test product description.',
        sellingPrice: 100,
        mrp: 150,
        categoryId: '',
        images: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBeNull();
      }
    });

    it('rejects creating product with 0 stock quantity', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Zero Stock Product',
        sellingPrice: 100,
        mrp: 150,
        stockQty: 0,
        images: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('AddItemSchema', () => {
    it('accepts valid cart item payload', () => {
      const result = AddItemSchema.safeParse({
        productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        quantity: 2,
      });
      expect(result.success).toBe(true);
    });

    it('rejects non-positive quantity', () => {
      const result = AddItemSchema.safeParse({
        productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        quantity: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects quantity over 1000', () => {
      const result = AddItemSchema.safeParse({
        productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        quantity: 1001,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateAddressSchema', () => {
    it('accepts valid address payload', () => {
      const result = CreateAddressSchema.safeParse({
        fullName: 'Jane Doe',
        phone: '+919876543210',
        street: '123 Health Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });
      expect(result.success).toBe(true);
    });

    it('rejects HTML tags in address fields', () => {
      const result = CreateAddressSchema.safeParse({
        fullName: 'Jane <script>alert(1)</script>',
        phone: '+919876543210',
        street: '123 Health Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createOrderSchema', () => {
    it('accepts valid order payload', () => {
      const result = createOrderSchema.safeParse({
        shippingAddress: {
          fullName: 'Jane Doe',
          phone: '+919876543210',
          email: 'jane@example.com',
          street: '123 Health Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        payment: {
          amount: 500,
        },
        items: [
          {
            productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            quantity: 1,
            unitPrice: 500,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects non-UUID productId in order items', () => {
      const result = createOrderSchema.safeParse({
        shippingAddress: {
          fullName: 'Jane Doe',
          phone: '+919876543210',
          email: 'jane@example.com',
          street: '123 Health Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        payment: { amount: 500 },
        items: [
          {
            productId: 'invalid-product-id',
            quantity: 1,
            unitPrice: 500,
          },
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createPaymentOrderSchema', () => {
    it('accepts valid payment order payload', () => {
      const result = createPaymentOrderSchema.safeParse({ amount: 1000 });
      expect(result.success).toBe(true);
    });

    it('rejects amounts exceeding PostgreSQL 32-bit integer limit', () => {
      const result = createPaymentOrderSchema.safeParse({ amount: 3000000000 });
      expect(result.success).toBe(false);
    });
  });

  describe('SearchSchema', () => {
    it('accepts valid search query', () => {
      const result = SearchSchema.safeParse({ q: 'wellness' });
      expect(result.success).toBe(true);
    });

    it('rejects search query containing HTML tags', () => {
      const result = SearchSchema.safeParse({ q: 'wellness<script>' });
      expect(result.success).toBe(false);
    });
  });
});
