import { z } from 'zod';

import { JsonObjectSchema, httpUrlSchema } from './common';

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(255).nullable().optional(),
  imageUrl: httpUrlSchema.nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  metadata: JsonObjectSchema.default({}),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();
