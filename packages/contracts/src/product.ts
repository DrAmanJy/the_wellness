import { JsonObject } from './common';

export type ProductListDTO = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: string | null;
  primaryImage: string | null;
  startingPrice: number | null;
  compareAtPrice: number | null;
  isFeatured: boolean;
};

export type SearchSuggestionDTO = {
  id: string;
  label: string;
  slug: string;
  type: 'product' | 'category';
};

export type ProductMutationDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  brand: string | null;
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  categoryPrimaryId: string | null;
  tags: string[] | null;
  attributes: JsonObject | null;
  specifications: JsonObject | null;
  ingredients: JsonObject | null;
  benefits: JsonObject | null;
  seo: JsonObject | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetailDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  brand: string | null;
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  categoryPrimaryId: string | null;
  tags: string[] | null;
  attributes: JsonObject | null;
  specifications: JsonObject | null;
  ingredients: JsonObject | null;
  benefits: JsonObject | null;
  seo: JsonObject | null;
  categories: { id: string; name: string; slug: string }[];
  variants: VariantDTO[];
  images: ProductImageDTO[];
  createdAt: string;
  updatedAt: string;
};

export type VariantDTO = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  currency: string;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductImageDTO = {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
};
