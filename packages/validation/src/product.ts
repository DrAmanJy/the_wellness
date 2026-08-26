import { z } from 'zod';

const BaseProductSchema = z.object({
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
  description: z.string().nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  brand: z.string().max(255).nullable().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  categoryPrimaryId: z.string().uuid().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.any()).optional(),
  specifications: z.record(z.any()).optional(),
  ingredients: z.record(z.any()).optional(),
  benefits: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const CreateProductSchema = BaseProductSchema;

export const UpdateProductSchema = BaseProductSchema.partial();

export const UpdateProductCategoriesSchema = z.object({
  categoryIds: z.array(z.string().uuid()),
  primaryCategoryId: z.string().uuid().nullable().optional(),
});

export const CreateVariantSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
  sku: z.string().min(1).max(100),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).default('INR'),
  weight: z.number().min(0).nullable().optional(),
  length: z.number().min(0).nullable().optional(),
  width: z.number().min(0).nullable().optional(),
  height: z.number().min(0).nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  metadata: z.record(z.any()).optional(),
});

export const UpdateVariantSchema = CreateVariantSchema.partial();
