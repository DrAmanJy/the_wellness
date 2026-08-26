import { Response } from 'supertest';

import type { CategoryDTO } from '@wellness/contracts';
import type { ProductListDTO, ProductDetailDTO } from '@wellness/contracts';

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

export type CategoryResponse = ApiResponse<CategoryDTO>;
export type CategoryListResponse = ApiResponse<CategoryDTO[]>;
export type ProductResponse = ApiResponse<ProductDetailDTO>;
export type ProductListResponse = ApiResponse<PaginatedData<ProductListDTO>>;

export function getResponseBody<T = unknown>(res: Response): ApiResponse<T> {
  return res.body as ApiResponse<T>;
}
