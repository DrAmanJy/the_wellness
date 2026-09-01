import { z } from 'zod';

export const SearchSchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const SuggestionsSchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(5),
}).strict();

export type SearchQuery = z.infer<typeof SearchSchema>;
export type SuggestionsQuery = z.infer<typeof SuggestionsSchema>;
