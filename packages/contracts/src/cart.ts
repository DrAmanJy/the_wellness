export type CartItemProductDTO = {
  id: string;
  name: string;
  image?: string | null | undefined;
  primaryImage?: string | null | undefined;
  price?: number | null | undefined;
  sellingPrice?: string | number | null | undefined;
  mrp?: string | number | null | undefined;
  type?: string | null | undefined;
  categoryName?: string | null | undefined;
  description?: string | null | undefined;
  stockQty?: number | null | undefined;
  availableQty?: number | null | undefined;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued' | null | undefined;
};

export type CartItemDTO = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: CartItemProductDTO | null;
};

export type CartDTO = {
  id: string;
  userId: string | null;
  status: 'active' | 'converted' | 'abandoned';
  items: CartItemDTO[];
  itemCount: number;
  updatedAt: string;
};

export type AddCartItemDTO = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemDTO = {
  quantity: number;
};
