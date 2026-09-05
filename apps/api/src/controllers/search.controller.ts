import { Request, Response, NextFunction } from 'express';

import { SearchSchema, SuggestionsSchema } from '@wellness/validation';

import { searchService } from '../services/search.service';

export const searchCatalog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SearchSchema.parse(req.query);
    const results = await searchService.searchCatalog(validated.q, validated.limit);
    res.json({
      success: true,
      data: results,
      products: results.products,
      categories: results.categories,
      total: results.total,
    });
  } catch (error) {
    next(error);
  }
};

export const searchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SuggestionsSchema.parse(req.query);
    const suggestions = await searchService.getSuggestions(validated.q, validated.limit);
    res.json({
      success: true,
      data: { suggestions },
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};
