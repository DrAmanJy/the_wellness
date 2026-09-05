import { Router } from 'express';

import {
  bindProcedure,
  getPromotionsProcedure,
  getPromotionByIdProcedure,
  createPromotionProcedure,
  updatePromotionProcedure,
  deletePromotionProcedure,
  togglePromotionStatusProcedure,
} from '@wellness/contracts';
import { asyncHandler } from '@wellness/utils';
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionIdParamSchema,
} from '@wellness/validation';

import { requireAuth } from '../middleware/auth.middleware';
import { resolveRoles, requireRole } from '../middleware/authorization.middleware';
import { promotionService } from '../services/promotion.service';

const router = Router();

bindProcedure(
  router,
  getPromotionsProcedure,
  asyncHandler(async (req, res) => {
    const activeOnly = req.query.active === 'true';
    const promotionsList = await promotionService.getPromotions(activeOnly);
    res.json({ success: true, data: promotionsList });
  }),
);

bindProcedure(
  router,
  getPromotionByIdProcedure,
  asyncHandler(async (req, res) => {
    const { id } = promotionIdParamSchema.parse(req.params);
    const promotion = await promotionService.getPromotionById(id);
    res.json({ success: true, data: promotion });
  }),
);

bindProcedure(
  router,
  createPromotionProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler(async (req, res) => {
    const input = createPromotionSchema.parse(req.body);
    const created = await promotionService.createPromotion(input);
    res.status(201).json({ success: true, data: created });
  }),
);

bindProcedure(
  router,
  updatePromotionProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler(async (req, res) => {
    const { id } = promotionIdParamSchema.parse(req.params);
    const input = updatePromotionSchema.parse(req.body);
    const updated = await promotionService.updatePromotion(id, input);
    res.json({ success: true, data: updated });
  }),
);

bindProcedure(
  router,
  togglePromotionStatusProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler(async (req, res) => {
    const { id } = promotionIdParamSchema.parse(req.params);
    const updated = await promotionService.togglePromotionStatus(id);
    res.json({ success: true, data: updated });
  }),
);

bindProcedure(
  router,
  deletePromotionProcedure,
  requireAuth,
  resolveRoles,
  requireRole('employee', 'admin'),
  asyncHandler(async (req, res) => {
    const { id } = promotionIdParamSchema.parse(req.params);
    const result = await promotionService.deletePromotion(id);
    res.json({ success: true, data: result });
  }),
);

export default router;
