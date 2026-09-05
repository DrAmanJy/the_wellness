import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(2147483647, 'Amount exceeds maximum allowable integer limit'),
  currency: z.string().max(10).optional().default('INR'),
  receipt: z.string().max(255).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required').max(255),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required').max(255),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required').max(255),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
