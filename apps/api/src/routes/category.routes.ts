import { Router } from 'express';

import {
  bindProcedure,
  getPublicCategoriesProcedure,
  getCategoryBySlugProcedure,
  createCategoryProcedure,
  updateCategoryProcedure,
  deleteCategoryProcedure,
} from '@wellness/contracts';
import { asyncHandler } from '@wellness/utils';

import { categoryController } from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { resolveRoles, requireRole } from '../middleware/authorization.middleware';

const router = Router();

bindProcedure(
  router,
  getPublicCategoriesProcedure,
  asyncHandler((req, res, next) => categoryController.getPublicCategories(req, res, next)),
);

bindProcedure(
  router,
  getCategoryBySlugProcedure,
  asyncHandler((req, res, next) => categoryController.getCategoryBySlug(req, res, next)),
);

bindProcedure(
  router,
  createCategoryProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => categoryController.createCategory(req, res, next)),
);

bindProcedure(
  router,
  updateCategoryProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => categoryController.updateCategory(req, res, next)),
);

bindProcedure(
  router,
  deleteCategoryProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => categoryController.deleteCategory(req, res, next)),
);

export default router;
