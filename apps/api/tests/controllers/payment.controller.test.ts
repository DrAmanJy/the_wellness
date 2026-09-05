import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

import { app } from '../../src/app';
import { paymentService } from '../../src/services/payment.service';

describe('Payment API Controllers', () => {
  describe('POST /api/payments/razorpay', () => {
    it('creates a razorpay payment order', async () => {
      vi.spyOn(paymentService, 'createRazorpayOrder').mockResolvedValueOnce({
        id: 'order_test_123',
        amount: 150000,
        currency: 'INR',
        receipt: 'rcpt_123',
        keyId: 'rzp_test_123',
      });

      const res = await request(app).post('/api/payments/razorpay').send({ amount: 1500 });
      const body = res.body as { id: string; amount: number };
      expect(res.status).toBe(200);
      expect(body.id).toBe('order_test_123');
      expect(body.amount).toBe(150000);
    });

    it('returns 400 when amount is missing or invalid', async () => {
      const res = await request(app).post('/api/payments/razorpay').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/payments/verify', () => {
    it('returns 400 when signature fields are missing', async () => {
      const res = await request(app).post('/api/payments/verify').send({});
      expect(res.status).toBe(400);
    });
  });
});
