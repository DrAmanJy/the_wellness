import { Request, Response, NextFunction } from 'express';

import { CreateProductSchema, UpdateProductSchema, UpdateProductCategoriesSchema, CursorSchema } from '@wellness/validation';

import { productService } from '../services/product.service';

export class ProductController {
  async getPublicProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limitStr = req.query.limit as string;
      const limit = limitStr ? parseInt(limitStr, 10) : 20;
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Limit must be between 1 and 100' } });
      }
      let cursorObj: { createdAt: Date; id: string } | undefined;
      if (req.query.cursor) {
        try {
          cursorObj = CursorSchema.parse(req.query.cursor);
        } catch (error: unknown) {
          return res.status(400).json({ 
            success: false, 
            error: { code: 'BAD_REQUEST', message: error instanceof Error ? error.message : 'Invalid cursor format' } 
          });
        }
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

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateProductSchema.parse(req.body);
      const userId = req.auth?.userId || 'system';
      const data = await productService.createProduct(validatedData as unknown as Parameters<typeof productService.createProduct>[0], userId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      // NOTE: Using partial validation for updates
      const validatedData = UpdateProductSchema.parse(req.body);
      const userId = req.auth?.userId || 'system';
      const data = await productService.updateProduct(req.params.id as string, validatedData as unknown as Parameters<typeof productService.updateProduct>[1], userId);
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

  async updateCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = UpdateProductCategoriesSchema.parse(req.body);
      await productService.updateProductCategories(req.params.id as string, validatedData.categoryIds, validatedData.primaryCategoryId || undefined);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
