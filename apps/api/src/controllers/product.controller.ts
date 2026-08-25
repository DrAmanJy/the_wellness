import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { CreateProductSchema } from '@wellness/validation';

export class ProductController {
  async getPublicProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limitStr = req.query.limit as string;
      const limit = limitStr ? parseInt(limitStr, 10) : 20;
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Limit must be between 1 and 100' } });
      }
      const cursor = req.query.cursor ? new Date(req.query.cursor as string) : undefined;
      const data = await productService.getPublicProducts(limit, cursor);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug;
      const data = await productService.getProductBySlug(slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateProductSchema.parse(req.body);
      const userId = (req as any).auth?.userId || 'system';
      const data = await productService.createProduct(validatedData, userId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      // NOTE: Using partial validation for updates
      const validatedData = CreateProductSchema.partial().parse(req.body);
      const userId = (req as any).auth?.userId || 'system';
      const data = await productService.updateProduct(req.params.id, validatedData, userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const data = await productService.deleteProduct(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateCategories(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { categoryIds, primaryCategoryId } = req.body;
      await productService.updateProductCategories(req.params.id, categoryIds, primaryCategoryId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
