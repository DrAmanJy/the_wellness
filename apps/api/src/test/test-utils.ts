import { Response } from 'supertest';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  errors?: unknown;
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string | null;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  brand?: string | null;
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  categoryPrimaryId?: string | null;
  tags?: string[] | null;
  attributes?: Record<string, unknown> | null;
  specifications?: Record<string, unknown> | null;
  ingredients?: Record<string, unknown> | null;
  benefits?: Record<string, unknown> | null;
  seo?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CategoryResponse = ApiResponse<CategoryDTO>;
export type CategoryListResponse = ApiResponse<CategoryDTO[]>; // Note: categories doesn't seem paginated based on test (it uses map on data)
export type ProductResponse = ApiResponse<ProductDTO>;
export type ProductListResponse = ApiResponse<PaginatedData<ProductDTO>>;

export function getResponseBody<T = unknown>(res: Response): ApiResponse<T> {
  return res.body as ApiResponse<T>;
}
