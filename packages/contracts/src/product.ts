import { JsonValue } from './common';

export type ProductImageDTO = {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
};

export type ProductListDTO = {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  sellingPrice: string;
  mrp: string;
  stockQty: number;
  inventoryQty?: number | null;
  availableQty?: number | null;
  reservedQty?: number | null;
  stockStatus: 'in_stock' | 'out_of_stock' | 'discontinued';
  isBestSeller: boolean;
  isFeatured: boolean;
  isNewest: boolean;
  categoryId: string | null;
  categoryName?: string | null;
  category?: string | null;
  primaryImage?: string | null;
  images?: ProductImageDTO[];
  startingPrice?: number | null;
  compareAtPrice?: number | null;
};

export type SearchSuggestionDTO = {
  id: string;
  label: string;
  slug?: string;
  type: 'product' | 'category';
  price?: string | null;
  image?: string | null;
};

export type ProductMutationDTO = {
  id: string;
  name: string;
  description: string | null;
  ingrediants: JsonValue | null;
  tags: string[] | null;
  sellingPrice: string;
  mrp: string;
  stockQty: number;
  inventoryQty?: number | null;
  availableQty?: number | null;
  reservedQty?: number | null;
  stockStatus: 'in_stock' | 'out_of_stock' | 'discontinued';
  isBestSeller: boolean;
  isFeatured: boolean;
  isNewest: boolean;
  lastUpdated: string;
  categoryId: string | null;
  features: JsonValue | null;
  images?: ProductImageDTO[];
};

export type ProductDetailDTO = {
  id: string;
  name: string;
  description: string | null;
  ingrediants: JsonValue | null;
  tags: string[] | null;
  sellingPrice: string;
  mrp: string;
  stockQty: number;
  inventoryQty?: number | null;
  availableQty?: number | null;
  reservedQty?: number | null;
  stockStatus: 'in_stock' | 'out_of_stock' | 'discontinued';
  isBestSeller: boolean;
  isFeatured: boolean;
  isNewest: boolean;
  lastUpdated: string;
  categoryId: string | null;
  categoryName?: string | null;
  category?: string | null;
  features: JsonValue | null;
  primaryImage?: string | null;
  images?: ProductImageDTO[];
};
