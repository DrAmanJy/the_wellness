import { z } from 'zod';

export const CreateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[a-z0-9-]+$/),
    description: z.string().trim().max(1000).nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const UpdateCategorySchema = CreateCategorySchema.partial();
