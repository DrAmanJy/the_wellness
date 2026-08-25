import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole, resolveRoles } from '../middleware/authorization.middleware';

const router = Router();

// Public Routes
router.get('/', productController.getPublicProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin Routes
router.post('/', requireAuth, resolveRoles, requireRole('employee', 'admin'), productController.createProduct);
router.patch('/:id', requireAuth, resolveRoles, requireRole('employee', 'admin'), productController.updateProduct);
router.delete('/:id', requireAuth, resolveRoles, requireRole('employee', 'admin'), productController.deleteProduct);

// Category relationships
router.put('/:id/categories', requireAuth, resolveRoles, requireRole('employee', 'admin'), productController.updateCategories);

export default router;
