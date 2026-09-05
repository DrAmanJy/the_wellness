import { Router, Request } from 'express';

import { bindProcedure, getAddressesProcedure, addAddressProcedure } from '@wellness/contracts';
import { asyncHandler, UnauthorizedError } from '@wellness/utils';
import { CreateAddressSchema } from '@wellness/validation';

import { requireAuth } from '../middleware/auth.middleware';
import { customerService } from '../services/customer.service';

const router = Router();

bindProcedure(
  router,
  getAddressesProcedure,
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

bindProcedure(
  router,
  addAddressProcedure,
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

router.delete(
  '/addresses/:id',
  requireAuth,
  asyncHandler(async (req: Request, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ success: false, error: 'Address ID is required' });
      return;
    }
    await customerService.deleteAddress(userId, id);
    res.json({ success: true });
  }),
);

// Customer Inquiries
router.post(
  '/inquiries',
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : undefined;
    const inquiryType =
      typeof body.inquiryType === 'string' && body.inquiryType.trim().length > 0
        ? body.inquiryType.trim()
        : 'General Inquiry';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!firstName || !lastName || !email || !message) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const created = await customerService.createInquiry({
      firstName,
      lastName,
      email,
      ...(company ? { company } : {}),
      inquiryType,
      message,
    });
    res.status(201).json({ success: true, data: created });
  }),
);

router.get(
  '/inquiries',
  asyncHandler(async (req: Request, res) => {
    const inquiries = await customerService.getInquiries();
    res.json({ success: true, data: inquiries });
  }),
);

router.patch(
  '/inquiries/:id/status',
  asyncHandler(async (req: Request, res) => {
    const { id } = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const status = typeof body.status === 'string' ? body.status : '';
    if (!id || !status) {
      res.status(400).json({ success: false, error: 'Missing id or status' });
      return;
    }
    const updated = await customerService.updateInquiryStatus(id, status);
    res.json({ success: true, data: updated });
  }),
);

export const customerRouter = router;
export default router;
