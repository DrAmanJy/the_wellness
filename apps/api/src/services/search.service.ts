import { db, products, categories, or, ilike } from '@wellness/db';

import { toProductListDTO, toSearchSuggestionDTO } from './product.mapper';

export class SearchService {
  async searchCatalog(query: string, limit = 20) {
    if (!query || query.trim() === '') {
      return { products: [], categories: [], total: 0 };
    }
    const cleanQuery = query.trim();
    const q = `%${cleanQuery}%`;

    const foundProducts = await db
      .select()
      .from(products)
      .where(or(ilike(products.name, q), ilike(products.description, q)))
      .limit(limit);

    const foundCategories = await db
      .select()
      .from(categories)
      .where(or(ilike(categories.name, q), ilike(categories.description, q)))
      .limit(limit);

    const mappedProducts = foundProducts.map((p) => toProductListDTO(p));

    return {
      products: mappedProducts,
      categories: foundCategories,
      total: mappedProducts.length + foundCategories.length,
    };
  }

  async getSuggestions(query: string, limit = 5) {
    if (!query || query.trim().length < 1) {
      return [];
    }
    const cleanQuery = query.trim();
    const q = `%${cleanQuery}%`;

    const pSuggestions = await db
      .select({
        id: products.id,
        name: products.name,
        sellingPrice: products.sellingPrice,
      })
      .from(products)
      .where(or(ilike(products.name, q), ilike(products.description, q)))
      .limit(limit);

    const cSuggestions = await db
      .select({
        id: categories.id,
        label: categories.name,
      })
      .from(categories)
      .where(or(ilike(categories.name, q), ilike(categories.description, q)))
      .limit(limit);

    const suggestions = [
      ...pSuggestions.map((p) => ({
        id: p.id,
        label: p.name,
        type: 'product' as const,
        price: p.sellingPrice,
      })),
      ...cSuggestions.map((c) => ({
        id: c.id,
        label: c.label,
        type: 'category' as const,
      })),
    ];

    return suggestions.slice(0, limit).map(toSearchSuggestionDTO);
  }
}

export const searchService = new SearchService();
