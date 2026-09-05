import { z } from 'zod';

export const createPromotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  targetUrl: z.string().optional().default('/products'),
  discountText: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export const promotionIdParamSchema = z.object({
  id: z.string().uuid('Invalid promotion ID format'),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
