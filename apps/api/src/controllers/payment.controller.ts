import { Router } from 'express';

import { asyncHandler } from '@wellness/utils';
import { createPaymentOrderSchema, verifyPaymentSchema } from '@wellness/validation';

import { paymentService } from '../services/payment.service';

const router = Router();

// POST /api/payments/razorpay - Initiate Razorpay payment order
router.post(
  '/razorpay',
  asyncHandler(async (req, res) => {
    const input = createPaymentOrderSchema.parse(req.body);
    const order = await paymentService.createRazorpayOrder(input);
    res.status(200).json(order);
  }),
);

// POST /api/payments/verify - Verify Razorpay payment signature
router.post(
  '/verify',
  // eslint-disable-next-line @typescript-eslint/require-await
  asyncHandler(async (req, res) => {
    const input = verifyPaymentSchema.parse(req.body);
    const isValid = paymentService.verifyPaymentSignature(input);
    if (isValid) {
      res.json({ success: true, verified: true });
    } else {
      res
        .status(400)
        .json({ success: false, verified: false, message: 'Invalid payment signature' });
    }
  }),
);

export const paymentRouter = router;
