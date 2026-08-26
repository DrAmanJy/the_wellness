import { Request, Response, NextFunction } from 'express';

import { CreateCategorySchema, UpdateCategorySchema } from '@wellness/validation';

import type { AuthContext } from '../middleware/auth.middleware';
import { categoryService } from '../services/category.service';

export class CategoryController {
  async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await categoryService.getPublicCategories();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const data = await categoryService.getCategoryBySlug(slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const data = CreateCategorySchema.parse(req.body);
      const userId = req.auth?.userId || 'system';
      const category = await categoryService.createCategory(data, userId);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const data = UpdateCategorySchema.parse(req.body);
      const userId = req.auth?.userId || 'system';
      const category = await categoryService.updateCategory(
        req.params.id as string,
        data as unknown as Parameters<typeof categoryService.updateCategory>[1],
        userId,
      );
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.deleteCategory(req.params.id as string);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
