import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  metadata: z.record(z.any()).default({}),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();
