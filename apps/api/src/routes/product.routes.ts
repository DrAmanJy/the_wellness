import { Router } from 'express';

import { asyncHandler } from '@wellness/utils';

import { productController } from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole, resolveRoles } from '../middleware/authorization.middleware';

const router = Router();

// Public Routes
router.get(
  '/',
  asyncHandler((req, res, next) => productController.getPublicProducts(req, res, next)),
);
router.get(
  '/:slug',
  asyncHandler((req, res, next) => productController.getProductBySlug(req, res, next)),
);

// Admin Routes
router.post(
  '/',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => productController.createProduct(req, res, next)),
);
router.patch(
  '/:id',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => productController.updateProduct(req, res, next)),
);
router.delete(
  '/:id',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => productController.deleteProduct(req, res, next)),
);

// Category relationships
router.put(
  '/:id/categories',
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler((req, res, next) => productController.updateCategories(req, res, next)),
);

export default router;
