import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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
      const slug = z.string().trim().min(1).parse(req.params.slug);
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
        z.string().uuid().parse(req.params.id),
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
      const category = await categoryService.deleteCategory(z.string().uuid().parse(req.params.id));
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
