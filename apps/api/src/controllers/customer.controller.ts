import { Router, Request } from 'express';

import { asyncHandler, UnauthorizedError } from '@wellness/utils';
import { CreateAddressSchema } from '@wellness/validation';

import { requireAuth } from '../middleware/auth.middleware';
import { customerService } from '../services/customer.service';

const router = Router();

// GET /api/customer/addresses
router.get(
  '/addresses',
  requireAuth,
  asyncHandler(async (req: Request, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }
    const addresses = await customerService.getAddresses(userId);
    res.json({ success: true, data: addresses });
  }),
);

// POST /api/customer/addresses
router.post(
  '/addresses',
  requireAuth,
  asyncHandler(async (req: Request, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }
    const input = CreateAddressSchema.parse(req.body);
    const created = await customerService.addAddress(userId, input);
    res.status(201).json({ success: true, data: created });
  }),
);

export const customerRouter = router;
