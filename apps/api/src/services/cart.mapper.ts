import type { CartDTO, CartItemDTO } from '@wellness/contracts';

type CartRawInput = {
  id: string;
  status: string;
  updatedAt: Date;
  items?: Array<{
    id: string;
    variantId: string;
    quantity: number;
    variant: {
      sku: string;
      price: string;
      product: {
        id: string;
        name: string;
        slug: string;
        images?: Array<{ url: string }>;
      };
    };
  }>;
};

export function toCartDTO(cartRaw: CartRawInput): CartDTO {
  let subtotal = 0;
  let itemCount = 0;

  const items = (cartRaw.items || []).map((item): CartItemDTO => {
    itemCount += item.quantity;
    const priceNum = parseFloat(item.variant.price) || 0;
    const itemSubtotal = priceNum * item.quantity;
    subtotal += itemSubtotal;

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      sku: item.variant.sku,
      price: item.variant.price,
      subtotal: itemSubtotal.toFixed(2),
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        image: item.variant.product.images?.[0]?.url || null,
      },
    };
  });

  return {
    id: cartRaw.id,
    status: cartRaw.status as 'active' | 'converted' | 'abandoned',
    items,
    itemCount,
    subtotal: subtotal.toFixed(2),
    updatedAt: cartRaw.updatedAt.toISOString(),
  };
}
