import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { NotFoundError } from '@wellness/utils';
import {
  CreateProductSchema,
  UpdateProductSchema,
  paginationSchema,
  AddProductImagesSchema,
  ReorderProductImagesSchema,
} from '@wellness/validation';

import type { AuthContext } from '../middleware/auth.middleware';
import { productService } from '../services/product.service';

export class ProductController {
  async getPublicProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationSchema.parse({
        page: req.query.page,
        limit: req.query.limit ?? 20,
      });

      const data = await productService.getPublicProducts(page, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedId = z.string().uuid().safeParse(req.params.id);
      if (!parsedId.success) {
        throw new NotFoundError('Product not found');
      }
      const data = await productService.getProductById(parsedId.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateProductSchema.parse(req.body);
      const { inventoryQty, availableQty, reservedQty, images, image, ...rest } = validatedData;
      const data = await productService.createProduct(
        {
          ...rest,
          ...(inventoryQty !== undefined && { inventoryQty }),
          ...(availableQty !== undefined && { availableQty }),
          ...(reservedQty !== undefined && { reservedQty }),
          ...(images !== undefined && { images }),
          ...(image !== undefined && { image }),
          sellingPrice: String(validatedData.sellingPrice),
          mrp: String(validatedData.mrp),
        },
        req.auth?.userId,
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const validatedData = UpdateProductSchema.parse(req.body);
      const id = z.string().uuid('Invalid product ID format').parse(req.params.id);

      const updatePayload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(validatedData)) {
        if (value !== undefined) {
          updatePayload[key] = value;
        }
      }
      if (validatedData.sellingPrice !== undefined) {
        updatePayload.sellingPrice = String(validatedData.sellingPrice);
      }
      if (validatedData.mrp !== undefined) {
        updatePayload.mrp = String(validatedData.mrp);
      }

      const data = await productService.updateProduct(id, updatePayload, req.auth?.userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().uuid('Invalid product ID format').parse(req.params.id);
      const data = await productService.deleteProduct(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().uuid('Invalid product ID format').parse(req.params.id);
      const data = await productService.getProductImages(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async addProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().uuid('Invalid product ID format').parse(req.params.id);
      const { images } = AddProductImagesSchema.parse(req.body);
      const data = await productService.addProductImages(id, images);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async reorderProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().uuid('Invalid product ID format').parse(req.params.id);
      const { imageOrders } = ReorderProductImagesSchema.parse(req.body);
      const data = await productService.reorderProductImages(id, imageOrders);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductImage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().uuid('Invalid product ID format').parse(req.params.id);
      const imageId = z.string().uuid('Invalid image ID format').parse(req.params.imageId);
      const data = await productService.deleteProductImage(id, imageId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
