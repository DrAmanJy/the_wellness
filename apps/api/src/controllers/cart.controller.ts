import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '@wellness/utils';

import { requireAuth } from '../middleware/auth.middleware';
import { cartService } from '../services/cart.service';

const router = Router();

const AddItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const UpdateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId as string;
    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

router.post(
  '/items',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = AddItemSchema.parse(req.body);
    const userId = req.auth?.userId as string;
    await cartService.addItem(userId, data.variantId, data.quantity);

    // Return the updated cart
    const cart = await cartService.getCart(userId);
    res.status(201).json({ success: true, data: cart });
  }),
);

router.patch(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const itemId = z.string().uuid().parse(req.params.id);
    const data = UpdateItemSchema.parse(req.body);

    const userId = req.auth?.userId as string;
    await cartService.updateItemQuantity(userId, itemId, data.quantity);

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

router.delete(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const itemId = z.string().uuid().parse(req.params.id);
    const userId = req.auth?.userId as string;
    await cartService.removeItem(userId, itemId);

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

router.delete(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId as string;
    await cartService.clearCart(userId);

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  }),
);

export const cartRouter = router;
