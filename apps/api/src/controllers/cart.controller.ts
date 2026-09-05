import { Router, Request } from 'express';
import { z } from 'zod';

import { asyncHandler } from '@wellness/utils';
import { AddItemSchema, UpdateItemSchema, CartIdHeaderSchema } from '@wellness/validation';

import { cartService } from '../services/cart.service';

const router = Router();

function getUserId(req: Request) {
  return req.auth?.userId;
}

function getCartId(req: Request): string | undefined {
  const headerVal = req.headers['x-cart-id'];
  if (!headerVal || typeof headerVal !== 'string') return undefined;
  const result = CartIdHeaderSchema.safeParse(headerVal);
  return result.success ? result.data : undefined;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(getUserId(req), getCartId(req));
    res.json({ success: true, data: cart });
  }),
);

router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const data = AddItemSchema.parse(req.body);
    const cart = await cartService.addItem(
      data.productId,
      data.quantity,
      getUserId(req),
      getCartId(req),
    );
    res.status(201).json({ success: true, data: cart });
  }),
);

router.patch(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const productId = z.string().uuid('Invalid product ID format').parse(req.params.id);
    const data = UpdateItemSchema.parse(req.body);

    const cart = await cartService.updateItemQuantity(
      productId,
      data.quantity,
      getUserId(req),
      getCartId(req),
    );
    res.json({ success: true, data: cart });
  }),
);

router.delete(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const productId = z.string().uuid('Invalid product ID format').parse(req.params.id);
    const cart = await cartService.removeItem(productId, getUserId(req), getCartId(req));
    res.json({ success: true, data: cart });
  }),
);

export const cartRouter = router;
