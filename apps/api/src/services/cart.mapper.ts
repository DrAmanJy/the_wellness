import type { CartDTO, CartItemDTO } from '@wellness/contracts';

type CartRawInput = {
  id: string;
  userId: string | null;
  status: string;
  updatedAt: Date;
  items?: Array<{
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    productName?: string | null;
    sellingPrice?: string | null;
    mrp?: string | null;
    description?: string | null;
  }>;
};

export function toCartDTO(cartRaw: CartRawInput): CartDTO {
  let itemCount = 0;

  const items = (cartRaw.items || []).map((item): CartItemDTO => {
    itemCount += item.quantity;
    const priceNum = item.sellingPrice ? parseFloat(item.sellingPrice) : undefined;

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      product: item.productName
        ? {
            id: item.productId,
            name: item.productName,
            sellingPrice: item.sellingPrice ?? undefined,
            price: priceNum,
            mrp: item.mrp ?? undefined,
            description: item.description ?? undefined,
          }
        : null,
    };
  });

  return {
    id: cartRaw.id,
    userId: cartRaw.userId,
    status: cartRaw.status as 'active' | 'converted' | 'abandoned',
    items,
    itemCount,
    updatedAt: cartRaw.updatedAt.toISOString(),
  };
}
