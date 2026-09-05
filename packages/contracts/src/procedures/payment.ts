import { createProcedure } from './core';

export const createRazorpayOrderProcedure = createProcedure<
  { amount: number; currency?: string; receipt?: string },
  { id: string; amount: number; currency: string }
>({
  name: 'createRazorpayOrder',
  method: 'POST',
  path: '/razorpay',
  description: 'Initiate Razorpay order',
});

export const verifyPaymentProcedure = createProcedure<
  { orderId: string; paymentId: string; signature: string },
  { success: boolean; verified: boolean }
>({
  name: 'verifyPayment',
  method: 'POST',
  path: '/verify',
  description: 'Verify Razorpay payment signature',
});
