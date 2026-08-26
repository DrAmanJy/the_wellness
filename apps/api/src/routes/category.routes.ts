import { Router } from 'express';

import { asyncHandler } from '@wellness/utils';

import { categoryController } from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole, resolveRoles } from '../middleware/authorization.middleware';

const router = Router();

// Public Routes
router.get(
  '/',
  asyncHandler((req, res, next) => categoryController.getPublicCategories(req, res, next)),
);
router.get(
  '/:slug',
  asyncHandler((req, res, next) => categoryController.getCategoryBySlug(req, res, next)),
);

// Admin Routes

router.post(
  '/',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => categoryController.createCategory(req, res, next)),
);
router.patch(
  '/:id',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => categoryController.updateCategory(req, res, next)),
);
router.delete(
  '/:id',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => categoryController.deleteCategory(req, res, next)),
);

export default router;
