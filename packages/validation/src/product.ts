import { z } from 'zod';

import { JsonValueSchema } from './common';

const PriceSchema = z.union([
  z.number().min(0),
  z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Must be a valid non-negative number',
  }),
]);

const BaseProductObject = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    description: z.string().trim().max(10000).nullable().optional(),
    ingredients: z.union([z.array(z.string()), JsonValueSchema]).optional(),
    ingrediants: z.union([z.array(z.string()), JsonValueSchema]).optional(),
    tags: z.array(z.string()).optional(),
    sellingPrice: PriceSchema.default(0),
    mrp: PriceSchema.default(0),
    stockQty: z.number().int().min(0).default(1),
    inventoryQty: z.number().int().min(0).optional(),
    availableQty: z.number().int().min(0).optional(),
    reservedQty: z.number().int().min(0).optional(),
    stockStatus: z.enum(['in_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
    isBestSeller: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isNewest: z.boolean().default(false),
    categoryId: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().uuid('Invalid category ID format').nullable().optional(),
    ),
    features: z.union([z.array(z.string()), JsonValueSchema]).optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
  })
  .strict();

const applyProductRefinements = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema
    .refine(
      (data) => {
        const rawMrp = data.mrp as number | string | null | undefined;
        const rawSellingPrice = data.sellingPrice as number | string | null | undefined;
        if (rawMrp != null && rawSellingPrice != null) {
          const mrpNum = typeof rawMrp === 'string' ? parseFloat(rawMrp) : rawMrp;
          const spNum =
            typeof rawSellingPrice === 'string' ? parseFloat(rawSellingPrice) : rawSellingPrice;
          if (!isNaN(mrpNum) && !isNaN(spNum)) {
            return mrpNum >= spNum;
          }
        }
        return true;
      },
      {
        message: 'mrp must be greater than or equal to sellingPrice',
        path: ['mrp'],
      },
    )
    .refine(
      (data) => {
        const invQty = data.inventoryQty as number | undefined;
        const stQty = data.stockQty as number | undefined;
        if (invQty !== undefined && stQty !== undefined) {
          return stQty <= invQty;
        }
        return true;
      },
      {
        message: 'Product stock quantity cannot be greater than total inventory quantity',
        path: ['stockQty'],
      },
    );

export const CreateProductSchema = applyProductRefinements(
  BaseProductObject.extend({
    name: z
      .string()
      .trim()
      .min(1, 'Product name is required')
      .max(255)
      .regex(/^[^<>]*$/, 'HTML tags are not allowed'),
    description: z.string().trim().min(1, 'Description is required').max(10000),
    categoryId: z
      .string()
      .uuid('Category ID must be a valid UUID')
      .optional()
      .nullable()
      .or(z.literal('').transform(() => null)),
    sellingPrice: PriceSchema.refine(
      (val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num > 0;
      },
      { message: 'Selling Price must be greater than 0' },
    ),
    mrp: PriceSchema.refine(
      (val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num > 0;
      },
      { message: 'MRP must be greater than 0' },
    ),
  }),
)
  .refine(
    (data) => {
      const stQty = data.stockQty;
      const availQty = data.availableQty ?? data.inventoryQty ?? stQty;
      return stQty >= 0 && availQty >= 0;
    },
    {
      message: 'Stock quantity cannot be negative',
      path: ['stockQty'],
    },
  )
  .refine(
    (data) => {
      const rawImgs =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.image
            ? [data.image]
            : [];
      const cleanImgs = rawImgs.filter(
        (u): u is string => typeof u === 'string' && u.trim().length > 0,
      );
      return cleanImgs.length >= 1;
    },
    {
      message: 'At least 1 product gallery image is required',
      path: ['images'],
    },
  );

export const UpdateProductSchema = applyProductRefinements(BaseProductObject.partial());

export const UpdateProductCategoriesSchema = z
  .object({
    categoryId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const AddProductImagesSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.string().min(1, 'Image URL or data URI is required'),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .min(1, 'At least one image must be provided'),
});

export const ReorderProductImagesSchema = z.object({
  imageOrders: z
    .array(
      z.object({
        id: z.string().uuid('Invalid image ID format'),
        displayOrder: z.number().int().min(0, 'displayOrder must be non-negative'),
      }),
    )
    .min(1, 'At least one image order item must be provided'),
});
