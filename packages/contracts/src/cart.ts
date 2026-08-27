export type CartItemProductDTO = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export type CartItemDTO = {
  id: string;
  variantId: string;
  quantity: number;
  sku: string;
  price: string;
  subtotal: string;
  product: CartItemProductDTO;
};

export type CartDTO = {
  id: string;
  status: 'active' | 'converted' | 'abandoned';
  items: CartItemDTO[];
  itemCount: number;
  subtotal: string;
  updatedAt: string;
};

export type AddCartItemDTO = {
  variantId: string;
  quantity: number;
};

export type UpdateCartItemDTO = {
  quantity: number;
};
