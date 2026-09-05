import { z } from 'zod';

export const CreateAddressSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .max(255, 'Full name cannot exceed 255 characters')
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .max(20, 'Phone number cannot exceed 20 characters')
      .regex(/^[+0-9\s-()]+$/, 'Invalid phone number format'),
    houseNumber: z
      .string()
      .trim()
      .max(255, 'House number cannot exceed 255 characters')
      .regex(/^[^<>]*$/, 'HTML tags are not allowed')
      .nullable()
      .optional(),
    street: z
      .string()
      .trim()
      .min(1, 'Street address is required')
      .max(1000, 'Street address cannot exceed 1000 characters')
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    city: z
      .string()
      .trim()
      .min(1, 'City is required')
      .max(100, 'City cannot exceed 100 characters')
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    state: z
      .string()
      .trim()
      .min(1, 'State is required')
      .max(100, 'State cannot exceed 100 characters')
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    pincode: z
      .string()
      .trim()
      .min(1, 'Pincode is required')
      .max(20, 'Pincode cannot exceed 20 characters')
      .regex(/^[A-Za-z0-9\s-]+$/, 'Invalid pincode format'),
    country: z
      .string()
      .trim()
      .max(100, 'Country cannot exceed 100 characters')
      .regex(/^[^<>]*$/, 'HTML tags are not allowed')
      .optional()
      .default('India'),
  })
  .strict();

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
