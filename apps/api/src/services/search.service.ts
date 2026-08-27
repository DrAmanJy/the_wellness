import {
  db,
  products,
  categories,
  productVariants,
  eq,
  isNull,
  and,
  or,
  ilike,
} from '@wellness/db';

import { toProductListDTO, toSearchSuggestionDTO } from './product.mapper';

export class SearchService {
  async searchCatalog(query: string, limit = 20) {
    if (!query || query.trim() === '') {
      return { products: [], categories: [] };
    }
    const q = `%${query}%`;

    const foundProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        brand: products.brand,
        isFeatured: products.isFeatured,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(
        and(
          eq(products.status, 'active'),
          isNull(products.deletedAt),
          or(
            ilike(products.name, q),
            ilike(products.slug, q),
            ilike(products.description, q),
            ilike(productVariants.sku, q),
          ),
        ),
      )
      .groupBy(products.id)
      .limit(limit);

    const foundCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories)
      .where(
        and(
          eq(categories.isActive, true),
          isNull(categories.deletedAt),
          or(
            ilike(categories.name, q),
            ilike(categories.slug, q),
            ilike(categories.description, q),
          ),
        ),
      )
      .limit(limit);

    return {
      products: foundProducts.map(toProductListDTO),
      categories: foundCategories,
    };
  }

  async getSuggestions(query: string, limit = 5) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const q = `%${query}%`;

    const pSuggestions = await db
      .select({
        id: products.id,
        label: products.name,
        slug: products.slug,
      })
      .from(products)
      .where(
        and(
          eq(products.status, 'active'),
          isNull(products.deletedAt),
          or(ilike(products.name, q), ilike(products.slug, q)),
        ),
      )
      .limit(limit);

    const cSuggestions = await db
      .select({
        id: categories.id,
        label: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(
        and(
          eq(categories.isActive, true),
          isNull(categories.deletedAt),
          or(ilike(categories.name, q), ilike(categories.slug, q)),
        ),
      )
      .limit(limit);

    const suggestions = [
      ...pSuggestions.map((p) => ({ ...p, type: 'product' as const })),
      ...cSuggestions.map((c) => ({ ...c, type: 'category' as const })),
    ];

    return suggestions.slice(0, limit).map(toSearchSuggestionDTO);
  }
}

export const searchService = new SearchService();
