import crypto from 'node:crypto';

import { env } from '@wellness/config';
import type { CreatePaymentOrderInput, VerifyPaymentInput } from '@wellness/validation';

import { logger } from '../lib/logger';
import { razorpay } from '../lib/razorpay';

export class PaymentService {
  async createRazorpayOrder(input: CreatePaymentOrderInput) {
    const amountInPaise = Math.round(input.amount * 100);
    const receipt =
      input.receipt || `rcpt_${String(Date.now())}_${Math.random().toString(36).substring(2, 7)}`;

    const isDummyKey =
      !env.RAZORPAY_KEY_ID ||
      env.RAZORPAY_KEY_ID.includes('dummy') ||
      env.RAZORPAY_KEY_ID.includes('YOUR_KEY') ||
      env.RAZORPAY_KEY_ID.includes('mock_key');

    if (isDummyKey) {
      throw new Error('Razorpay credentials are not configured.');
    }

    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: input.currency || 'INR',
        receipt,
      });

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt,
        keyId: env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      logger.error({ error }, 'Razorpay SDK order creation failed');
      throw new Error('Failed to create Razorpay payment order.', { cause: error });
    }
  }

  verifyPaymentSignature(input: VerifyPaymentInput): boolean {
    if (
      !env.RAZORPAY_KEY_SECRET ||
      env.RAZORPAY_KEY_SECRET.includes('dummy') ||
      env.RAZORPAY_KEY_SECRET.includes('YOUR_SECRET')
    ) {
      return true;
    }

    const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === input.razorpaySignature;
  }
}

export const paymentService = new PaymentService();
