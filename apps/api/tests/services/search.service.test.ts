import { describe, it, expect } from 'vitest';

import { searchService } from '../../src/services/search.service';

describe('SearchService', () => {
  it('returns empty result for empty query', async () => {
    const res = await searchService.searchCatalog('');
    expect(res.products).toEqual([]);
    expect(res.categories).toEqual([]);
  });

  it('returns suggestions array', async () => {
    const suggestions = await searchService.getSuggestions('health');
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
