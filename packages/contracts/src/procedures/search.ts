import { ProductListDTO, SearchSuggestionDTO } from '../product';
import { createProcedure } from './core';

export const searchCatalogProcedure = createProcedure<
  { q: string; limit?: number },
  { products: ProductListDTO[]; categories: unknown[]; total: number }
>({
  name: 'searchCatalog',
  method: 'GET',
  path: '/',
  description: 'Search catalog products and categories',
});

export const searchSuggestionsProcedure = createProcedure<
  { q: string; limit?: number },
  { suggestions: SearchSuggestionDTO[] }
>({
  name: 'searchSuggestions',
  method: 'GET',
  path: '/suggestions',
  description: 'Search quick suggestions',
});
