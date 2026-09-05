import { z } from 'zod';

import { CreateAddressSchema } from './customer';

export const createOrderSchema = z.object({
  shippingAddress: CreateAddressSchema.extend({
    email: z.string().email('Invalid email address'),
  }),
  payment: z.object({
    provider: z.string().max(100).default('razorpay'),
    transactionId: z.string().max(255).optional(),
    razorpayOrderId: z.string().max(255).optional(),
    razorpayPaymentId: z.string().max(255).optional(),
    razorpaySignature: z.string().max(255).optional(),
    amount: z.number().positive('Payment amount must be positive').max(2147483647),
    paymentMethod: z.string().max(100).optional().default('online'),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID format'),
        productName: z.string().max(255).optional(),
        unitPrice: z.number().nonnegative('Unit price must be non-negative').max(2147483647),
        quantity: z.number().int().positive('Quantity must be at least 1').max(1000),
      }),
    )
    .min(1, 'Order must contain at least one item'),
  subtotal: z.number().nonnegative().max(2147483647).optional(),
  shippingAmount: z.number().nonnegative().max(2147483647).optional(),
  taxAmount: z.number().nonnegative().max(2147483647).optional(),
  totalAmount: z.number().nonnegative().max(2147483647).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
