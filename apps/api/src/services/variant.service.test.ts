import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { productService } from './product.service';
import { factories } from '../test/factories';
import { ConflictError, NotFoundError } from '@wellness/utils';

describe('ProductService - Variants', () => {
  let user: any;
  let product: any;

  beforeEach(async () => {
    user = await factories.createUser();
    product = await factories.createProduct({ createdBy: user.id, updatedBy: user.id });
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('addVariant', () => {
    it('creates a variant successfully', async () => {
      const variantData = {
        name: 'Large',
        sku: 'TEST-L-01',
        price: '29.99',
        compareAtPrice: '39.99',
        currency: 'USD',
        weight: '0.5',
      };

      const result = await productService.addVariant(product.id, variantData);
      
      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.name).toBe('Large');
      expect(result?.sku).toBe('TEST-L-01');
      expect(result?.price).toBe('29.99');
    });

    it('rejects duplicate SKU', async () => {
      const variantData = {
        name: 'Large',
        sku: 'TEST-L-DUP',
        price: '29.99',
      };

      await productService.addVariant(product.id, variantData);

      // Attempt to create another with same SKU
      let error: any;
      try {
        await productService.addVariant(product.id, { ...variantData, name: 'Other' });
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(String(error.cause || error)).toMatch(/duplicate key value violates unique constraint/);
    });

    it('rejects negative price (PostgreSQL constraint)', async () => {
      let error: any;
      try {
        await productService.addVariant(product.id, {
          name: 'Freebie',
          sku: 'FREE-01',
          price: '-10.00',
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(String(error.cause || error)).toMatch(/product_variants_price_positive/);
    });

    it('rejects compareAtPrice < price (PostgreSQL constraint)', async () => {
      let error: any;
      try {
        await productService.addVariant(product.id, {
          name: 'Bad Discount',
          sku: 'BAD-01',
          price: '50.00',
          compareAtPrice: '40.00' // Must be >= price
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(String(error.cause || error)).toMatch(/product_variants_compare_at_price_valid/);
    });
  });

  describe('updateVariant', () => {
    it('updates variant successfully', async () => {
      const variant = await productService.addVariant(product.id, {
        name: 'Small',
        sku: 'TEST-S-01',
        price: '19.99',
      });

      const updated = await productService.updateVariant(variant!.id, {
        price: '15.99',
        name: 'Extra Small'
      });

      expect(updated.price).toBe('15.99');
      expect(updated.name).toBe('Extra Small');
    });

    it('throws NotFoundError for nonexistent variant', async () => {
      await expect(
        productService.updateVariant('00000000-0000-0000-0000-000000000000', { price: '10' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteVariant', () => {
    it('soft deletes variant', async () => {
      const variant = await productService.addVariant(product.id, {
        name: 'Small',
        sku: 'TEST-S-02',
        price: '19.99',
      });

      const deleted = await productService.deleteVariant(variant!.id);
      
      expect(deleted.deletedAt).not.toBeNull();
      
      // Ensure it doesn't show up in product fetch
      const fetched = await productService.getProductBySlug(product.slug);
      expect(fetched.variants).toHaveLength(0);
    });
  });
});
