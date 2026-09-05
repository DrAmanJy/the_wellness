import type {
  ProductListDTO,
  SearchSuggestionDTO,
  ProductMutationDTO,
  ProductDetailDTO,
  ProductImageDTO,
} from '@wellness/contracts';
import { JsonValue } from '@wellness/contracts/src/common';
import type { products, productImages } from '@wellness/db';

export function toProductImageDTO(img: typeof productImages.$inferSelect): ProductImageDTO {
  return {
    id: img.id,
    productId: img.productId,
    url: img.url,
    altText: img.altText ?? null,
    displayOrder: img.displayOrder,
    isPrimary: img.isPrimary,
    createdAt: img.createdAt.toISOString(),
  };
}

export function toProductMutationDTO(
  product: typeof products.$inferSelect,
  imgs: Array<typeof productImages.$inferSelect> = [],
): ProductMutationDTO {
  const computedStockStatus =
    product.stockQty <= 0 && product.stockStatus !== 'discontinued'
      ? 'out_of_stock'
      : product.stockStatus;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    ingrediants: product.ingrediants as JsonValue | null,
    tags: product.tags,
    sellingPrice: product.sellingPrice,
    mrp: product.mrp,
    stockQty: product.stockQty,
    stockStatus: computedStockStatus,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    isNewest: product.isNewest,
    lastUpdated: product.lastUpdated.toISOString(),
    categoryId: product.categoryId,
    features: product.features as JsonValue | null,
    images: imgs.map(toProductImageDTO),
  };
}

export function toProductDetailDTO(
  product: typeof products.$inferSelect,
  imgs: Array<typeof productImages.$inferSelect> = [],
  categoryName?: string | null,
): ProductDetailDTO {
  const mappedImages = imgs.map(toProductImageDTO);
  const primaryImg = mappedImages.find((img) => img.isPrimary)?.url || mappedImages[0]?.url || null;

  return {
    ...toProductMutationDTO(product, imgs),
    categoryName: categoryName ?? null,
    category: categoryName ?? null,
    primaryImage: primaryImg,
    images: mappedImages,
  };
}

export function toProductListDTO(
  product: typeof products.$inferSelect,
  imgs: Array<typeof productImages.$inferSelect> = [],
  categoryName?: string | null,
): ProductListDTO {
  const computedStockStatus =
    product.stockQty <= 0 && product.stockStatus !== 'discontinued'
      ? 'out_of_stock'
      : product.stockStatus;

  const mappedImages = imgs.map(toProductImageDTO);
  const primaryImg =
    mappedImages.find((img) => img.isPrimary)?.url ||
    mappedImages[0]?.url ||
    ((product as Record<string, unknown>).primaryImage as string | null) ||
    null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    sellingPrice: product.sellingPrice,
    mrp: product.mrp,
    stockQty: product.stockQty,
    stockStatus: computedStockStatus,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    isNewest: product.isNewest,
    categoryId: product.categoryId,
    categoryName: categoryName ?? null,
    category: categoryName ?? null,
    primaryImage: primaryImg,
    images: mappedImages,
  };
}

export function toSearchSuggestionDTO(suggestion: {
  id: string;
  label: string;
  type: 'product' | 'category';
  price?: string | null;
  image?: string | null;
}): SearchSuggestionDTO {
  return {
    id: suggestion.id,
    label: suggestion.label,
    type: suggestion.type,
    price: suggestion.price ?? null,
    image: suggestion.image ?? null,
  };
}
