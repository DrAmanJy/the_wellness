import { z } from 'zod';

export const AddItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
}).strict();

export const UpdateItemSchema = z.object({
  quantity: z.number().int().positive(),
}).strict();

export type AddItemSchemaType = z.infer<typeof AddItemSchema>;
export type UpdateItemSchemaType = z.infer<typeof UpdateItemSchema>;
