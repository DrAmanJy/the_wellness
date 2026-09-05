import { randomUUID } from 'node:crypto';

import { describe, it, expect, vi } from 'vitest';

import { db, products, productImages, eq } from '@wellness/db';
import { NotFoundError } from '@wellness/utils';

import { cloudinaryService } from '../../src/services/cloudinary.service';
import { productService } from '../../src/services/product.service';

describe('ProductService', () => {
  describe('Create Product', () => {
    it('creates a valid product with Cloudinary image and product_image record', async () => {
      const data = {
        name: 'Cloudinary Test Product',
        sellingPrice: '199.00',
        mrp: '299.00',
        stockQty: 5,
        images: [
          'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_product1.jpg',
          'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_product2.jpg',
        ],
      };
      const product = await productService.createProduct(data);

      expect(product).toBeDefined();
      expect(product.name).toBe('Cloudinary Test Product');
      expect(product.images).toBeDefined();
      expect(product.images?.length).toBe(2);
      expect(product.images?.[0]?.url).toContain('cloudinary.com');

      // Verify database state for product_image table
      const dbImgs = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id));

      expect(dbImgs.length).toBe(2);
      expect(dbImgs[0]?.url).toBe(
        'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_product1.jpg',
      );
      expect(dbImgs[0]?.isPrimary).toBe(true);
    });

    it('rolls back transaction if product image upload fails', async () => {
      const productName = `Failed Image Product ${randomUUID()}`;
      const data = {
        name: productName,
        sellingPrice: '50.00',
        mrp: '100.00',
        stockQty: 2,
        images: ['   '], // whitespace only image URL triggers validation failure
      };

      await expect(productService.createProduct(data)).rejects.toThrow();

      // Check database: product should NOT exist due to transaction rollback
      const [existing] = await db
        .select()
        .from(products)
        .where(eq(products.name, productName))
        .limit(1);

      expect(existing).toBeUndefined();
    });

    it('revokes everything in transaction if product image upload or insertion fails', async () => {
      const productName = `Tx Revoke Product ${randomUUID()}`;

      const uploadSpy = vi
        .spyOn(cloudinaryService, 'uploadMultipleImages')
        .mockRejectedValueOnce(new Error('Cloudinary Connection Error'));

      const data = {
        name: productName,
        sellingPrice: '50.00',
        mrp: '100.00',
        stockQty: 2,
        images: [
          'https://res.cloudinary.com/test/image1.jpg',
          'https://res.cloudinary.com/test/image2.jpg',
        ],
      };

      await expect(productService.createProduct(data)).rejects.toThrow(
        'Cloudinary Connection Error',
      );

      // Verify product table: no product record must exist (everything revoked)
      const [p] = await db.select().from(products).where(eq(products.name, productName)).limit(1);
      expect(p).toBeUndefined();

      uploadSpy.mockRestore();
    });
  });

  describe('Read Products', () => {
    it('gets public products list', async () => {
      const result = await productService.getPublicProducts(1, 10);
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('throws NotFoundError for non-existent product ID', async () => {
      await expect(productService.getProductById(randomUUID())).rejects.toThrow(NotFoundError);
    });
  });
});
