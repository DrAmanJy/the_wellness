import { Request, Response, NextFunction } from 'express';

import { UnauthorizedError } from '@wellness/utils';
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateProductCategoriesSchema,
  CursorSchema,
  LimitSchema,
} from '@wellness/validation';

import type { AuthContext } from '../middleware/auth.middleware';
import { productService } from '../services/product.service';

export class ProductController {
  async getPublicProducts(req: Request, res: Response, next: NextFunction) {
    try {
      // Reject array query values — only accept scalar
      const rawLimit = req.query.limit;
      if (Array.isArray(rawLimit)) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Limit must be between 1 and 100' },
        });
      }

      const limitResult =
        rawLimit != null ? LimitSchema.safeParse(rawLimit) : { success: true as const, data: 20 };
      if (!limitResult.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Limit must be between 1 and 100' },
        });
      }
      const limit = limitResult.data;

      let cursorObj: { createdAt: Date; id: string } | undefined;
      if (req.query.cursor) {
        const cursorResult = CursorSchema.safeParse(req.query.cursor);
        if (!cursorResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'Invalid cursor format',
            },
          });
        }
        cursorObj = cursorResult.data;
      }
      const data = await productService.getPublicProducts(limit, cursorObj);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const data = await productService.getProductBySlug(slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateProductSchema.parse(req.body);
      if (!req.auth?.userId) throw new UnauthorizedError();
      const { categoryIds, ...productData } = validatedData;
      const data = await productService.createProduct(
        { ...productData, ...(categoryIds !== undefined ? { categoryIds } : {}) },
        req.auth.userId,
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      // NOTE: Using partial validation for updates
      const validatedData = UpdateProductSchema.parse(req.body);
      if (!req.auth?.userId) throw new UnauthorizedError();
      const { categoryIds, ...productData } = validatedData;

      const updatePayload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(productData)) {
        if (value !== undefined) {
          updatePayload[key] = value;
        }
      }
      if (categoryIds !== undefined) {
        updatePayload.categoryIds = categoryIds;
      }

      const data = await productService.updateProduct(
        req.params.id as string,
        updatePayload,
        req.auth.userId,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await productService.deleteProduct(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateCategories(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const validatedData = UpdateProductCategoriesSchema.parse(req.body);
      if (!req.auth?.userId) throw new UnauthorizedError();
      await productService.updateProductCategories(
        req.params.id as string,
        validatedData.categoryIds,
        validatedData.primaryCategoryId || undefined,
        req.auth.userId,
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
