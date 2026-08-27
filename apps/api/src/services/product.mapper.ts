import type {
  ProductListDTO,
  SearchSuggestionDTO,
  ProductMutationDTO,
  VariantDTO,
  ProductImageDTO,
} from '@wellness/contracts';
import { JsonObject } from '@wellness/contracts/src/common';
import type { products, productVariants, productImages } from '@wellness/db';

export function toProductMutationDTO(product: typeof products.$inferSelect): ProductMutationDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    brand: product.brand,
    status: product.status,
    isFeatured: product.isFeatured,
    categoryPrimaryId: product.categoryPrimaryId,
    tags: product.tags,
    attributes: product.attributes as JsonObject | null,
    specifications: product.specifications as JsonObject | null,
    ingredients: product.ingredients as JsonObject | null,
    benefits: product.benefits as JsonObject | null,
    seo: product.seo as JsonObject | null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

type ProductListInput = Partial<typeof products.$inferSelect> & {
  primaryImage?: string | null;
  startingPrice?: number | null;
  compareAtPrice?: number | null;
};

export function toProductListDTO(product: ProductListInput): ProductListDTO {
  return {
    id: product.id as string,
    name: product.name as string,
    slug: product.slug as string,
    shortDescription: product.shortDescription ?? null,
    brand: product.brand ?? null,
    primaryImage: product.primaryImage ?? null,
    startingPrice: product.startingPrice ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    isFeatured: product.isFeatured as boolean,
  };
}

export function toSearchSuggestionDTO(suggestion: {
  id: string;
  label: string;
  slug: string;
  type: 'product' | 'category';
}): SearchSuggestionDTO {
  return {
    id: suggestion.id,
    label: suggestion.label,
    slug: suggestion.slug,
    type: suggestion.type,
  };
}

export function toVariantDTO(variant: typeof productVariants.$inferSelect): VariantDTO {
  return {
    id: variant.id,
    productId: variant.productId,
    name: variant.name,
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    currency: variant.currency,
    weight: variant.weight,
    length: variant.length,
    width: variant.width,
    height: variant.height,
    isActive: variant.isActive,
    sortOrder: variant.sortOrder,
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}

export function toProductImageDTO(image: typeof productImages.$inferSelect): ProductImageDTO {
  return {
    id: image.id,
    productId: image.productId,
    variantId: image.variantId,
    url: image.url,
    altText: image.altText,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
    createdAt: image.createdAt.toISOString(),
  };
}
