import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export const CursorSchema = z.string().transform((val, ctx) => {
  try {
    const decoded = Buffer.from(val, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded) as unknown;

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Not an object');
    }

    const cursorObj = parsed as { createdAt?: string | number | Date; id?: string };
    const cursorDate = new Date(cursorObj.createdAt ?? '');

    if (isNaN(cursorDate.getTime()) || typeof cursorObj.id !== 'string') {
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
