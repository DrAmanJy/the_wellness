import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { SearchSchema, SuggestionsSchema } from '@wellness/validation';

import { searchService } from '../services/search.service';


export const searchCatalog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SearchSchema.parse(req.query);
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
    const validated = SuggestionsSchema.parse(req.query);
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
