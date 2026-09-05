import { z } from 'zod';

export const AddItemSchema = z
  .object({
    productId: z.string().uuid('Invalid product ID format'),
    quantity: z
      .number()
      .int()
      .positive('Quantity must be positive')
      .max(1000, 'Quantity cannot exceed 1000'),
  })
  .strict();

export const UpdateItemSchema = z
  .object({
    quantity: z
      .number()
      .int()
      .positive('Quantity must be positive')
      .max(1000, 'Quantity cannot exceed 1000'),
  })
  .strict();

export type AddItemSchemaType = z.infer<typeof AddItemSchema>;
export type UpdateItemSchemaType = z.infer<typeof UpdateItemSchema>;
