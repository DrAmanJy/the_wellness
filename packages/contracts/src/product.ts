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
};

export type VariantDTO = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type ProductImageDTO = {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};
