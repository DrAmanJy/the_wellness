import { z } from 'zod';

/**
 * JSON value type matching the JsonValue contract from @wellness/contracts.
 */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Recursive JSON value schema — avoids z.any() while representing valid JSON.
 */
const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
);

const JsonObjectSchema = z.record(JsonValueSchema);

const httpUrlSchema = z
  .string()
  .url()
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP and HTTPS URLs are allowed' },
  );

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
