import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '@wellness/utils';
import { AddItemSchema, UpdateItemSchema } from '@wellness/validation';


import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { cartService } from '../services/cart.service';

const router = Router();



router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.auth.userId;
    const cart = await cartService.getCartReadonly(userId);
    res.json({ success: true, data: cart });
  }),
);

router.post(
  '/items',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const data = AddItemSchema.parse(req.body);
    const userId = req.auth.userId;
    await cartService.addItem(userId, data.variantId, data.quantity);

    // Return the updated cart
    const cart = await cartService.getCart(userId);
    res.status(201).json({ success: true, data: cart });
  }),
);

router.patch(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const itemId = z.string().uuid().parse(req.params.id);
    const data = UpdateItemSchema.parse(req.body);

    const userId = req.auth.userId;
    await cartService.updateItemQuantity(userId, itemId, data.quantity);

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

router.delete(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const itemId = z.string().uuid().parse(req.params.id);
    const userId = req.auth.userId;
    await cartService.removeItem(userId, itemId);

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

router.delete(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.auth.userId;
    await cartService.clearCart(userId);

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

export const cartRouter = router;
