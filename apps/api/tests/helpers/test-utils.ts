import type {
  CategoryDetailDTO,
  CategoryListDTO,
  ProductListDTO,
  ProductDetailDTO,
  CartDTO,
  SearchSuggestionDTO,
} from '@wellness/contracts';

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

export type CategoryResponse = ApiResponse<CategoryDetailDTO>;
export type CategoryListResponse = ApiResponse<CategoryListDTO[]>;
export type ProductResponse = ApiResponse<ProductDetailDTO>;
export type ProductListResponse = ApiResponse<PaginatedData<ProductListDTO>>;

export type CartResponse = ApiResponse<CartDTO>;
export type SearchResponse = { products: ProductListDTO[]; categories: CategoryListDTO[] };
export type SearchSuggestionResponse = { suggestions: SearchSuggestionDTO[] };

export function getResponseBody<T>(res: { body: T }): T {
  return res.body;
}
