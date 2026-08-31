import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { searchService } from '../services/search.service';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const suggestionsSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(20).default(5),
});

export const searchCatalog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = searchSchema.parse(req.query);
    const results = await searchService.searchCatalog(validated.q, validated.limit);
    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
      return;
    }
    next(error);
  }
};

export const searchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = suggestionsSchema.parse(req.query);
    const suggestions = await searchService.getSuggestions(validated.q, validated.limit);
    res.json({ suggestions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
      return;
    }
    next(error);
  }
};
