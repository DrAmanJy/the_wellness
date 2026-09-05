import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const LimitSchema = z.coerce.number().int().min(1).max(100);

export const UuidSchema = z.string().uuid('Invalid UUID format');

export const CartIdHeaderSchema = z.string().uuid('Invalid cart ID format').optional();

export type PaginationQuery = z.infer<typeof paginationSchema>;

export const CursorSchema = z.string().transform((val, ctx) => {
  try {
    const decoded = Buffer.from(val, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded) as unknown;

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Not an object');
    }

    const cursorObj = parsed as { createdAt?: string | number | Date; id?: string | number };
    const cursorDate = new Date(cursorObj.createdAt ?? '');

    if (
      isNaN(cursorDate.getTime()) ||
      (typeof cursorObj.id !== 'string' && typeof cursorObj.id !== 'number')
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid cursor format' });
      return z.NEVER;
    }

    // Boundary check for database safety
    const year = cursorDate.getUTCFullYear();
    if (year < 1970 || year > 9999) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cursor date out of bounds' });
      return z.NEVER;
    }

    return { createdAt: cursorDate, id: cursorObj.id };
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid cursor encoding' });
    return z.NEVER;
  }
});

/**
 * JSON value type matching the JsonValue contract from @wellness/contracts.
 */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Recursive JSON value schema — avoids z.any() while representing valid JSON.
 */
export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
);

export const JsonObjectSchema = z.record(JsonValueSchema);

export const httpUrlSchema = z
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
