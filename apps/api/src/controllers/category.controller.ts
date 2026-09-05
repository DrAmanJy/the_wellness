import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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
      const slug = z
        .string()
        .trim()
        .min(1, 'Slug cannot be empty')
        .max(255, 'Slug too long')
        .regex(/^[a-z0-9-]+$/, 'Invalid slug format')
        .parse(req.params.slug);
      const data = await categoryService.getCategoryBySlug(slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const data = CreateCategorySchema.parse(req.body);
      const category = await categoryService.createCategory(data, req.auth?.userId);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateCategorySchema.parse(req.body);
      const id = z.string().uuid('Invalid category ID format').parse(req.params.id);
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== undefined) {
          data[key] = value;
        }
      }
      const category = await categoryService.updateCategory(id, data, req.auth?.userId);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().uuid('Invalid category ID format').parse(req.params.id);
      const category = await categoryService.deleteCategory(id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
