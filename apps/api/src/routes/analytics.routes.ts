import { Router } from 'express';

import { asyncHandler } from '@wellness/utils';

import { analyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { resolveRoles, requireRole } from '../middleware/authorization.middleware';

const router = Router();

// Enforce admin authentication & authorization for all analytics routes
router.use(requireAuth, resolveRoles, requireRole('admin'));

// GET /api/analytics - Get real-time dashboard analytics & summary
router.get(
  '/',
  asyncHandler((req, res) => analyticsController.getAnalyticsSummary(req, res)),
);

// GET /api/analytics/products - Get product performance analytics list
router.get(
  '/products',
  asyncHandler((req, res) => analyticsController.getProductsAnalyticsList(req, res)),
);

// GET /api/analytics/products/:id - Get detailed single product analysis
router.get(
  '/products/:id',
  asyncHandler((req, res) => analyticsController.getProductAnalytics(req, res)),
);

export const analyticsRoutes = router;
export default router;
