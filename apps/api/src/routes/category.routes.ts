import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

const router = Router();

// Public Routes
router.get('/', categoryController.getPublicCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin Routes
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole, resolveRoles } from '../middleware/authorization.middleware';

router.post('/', requireAuth, resolveRoles, requireRole('employee', 'admin'), categoryController.createCategory);
router.patch('/:id', requireAuth, resolveRoles, requireRole('employee', 'admin'), categoryController.updateCategory);
router.delete('/:id', requireAuth, resolveRoles, requireRole('employee', 'admin'), categoryController.deleteCategory);

export default router;
