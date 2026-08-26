import { Request, Response, NextFunction } from 'express';

import { UnauthorizedError } from '@wellness/utils';
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
      if (!req.auth?.userId) throw new UnauthorizedError();
      const category = await categoryService.createCategory(data, req.auth.userId);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateCategorySchema.parse(req.body);
      if (!req.auth?.userId) throw new UnauthorizedError();
      // Strip undefined-valued keys so exactOptionalPropertyTypes is satisfied
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== undefined) {
          data[key] = value;
        }
      }
      const category = await categoryService.updateCategory(
        req.params.id as string,
        data,
        req.auth.userId,
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
