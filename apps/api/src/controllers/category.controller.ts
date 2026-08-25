import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { CreateCategorySchema, UpdateCategorySchema } from '@wellness/validation';

export class CategoryController {
  async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await categoryService.getPublicCategories();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug;
      const data = await categoryService.getCategoryBySlug(slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateCategorySchema.parse(req.body);
      const userId = (req as any).auth?.userId || 'system';
      const category = await categoryService.createCategory(data, userId);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const data = UpdateCategorySchema.parse(req.body);
      const userId = (req as any).auth?.userId || 'system';
      const category = await categoryService.updateCategory(req.params.id, data, userId);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.deleteCategory(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
