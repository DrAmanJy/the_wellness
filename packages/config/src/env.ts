import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),

    DATABASE_URL: z.string().min(1, 'Database URL is required'),
    GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),

    BETTER_AUTH_SECRET: z.string().min(1, 'Better Auth Secret is required'),
    BETTER_AUTH_URL: z.string().url('Better Auth URL must be a valid URL'),

    RAZORPAY_KEY_ID: z.string().min(1, 'Razorpay Key ID is required'),
    RAZORPAY_KEY_SECRET: z.string().min(1, 'Razorpay Key Secret is required'),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'Razorpay Webhook Secret is required'),

    CORS_ORIGIN: z.string().min(1, 'CORS Origin is required'),

    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === 'production') {
      if (!val.APPLE_CLIENT_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Apple Client ID is required in production',
          path: ['APPLE_CLIENT_ID'],
        });
      }
      if (!val.APPLE_CLIENT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Apple Client Secret is required in production',
          path: ['APPLE_CLIENT_SECRET'],
        });
      }
    }
  });

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
