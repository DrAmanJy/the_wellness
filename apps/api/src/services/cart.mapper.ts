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
  let subtotalCents = 0;
  let itemCount = 0;

  const items = (cartRaw.items || []).map((item): CartItemDTO => {
    itemCount += item.quantity;
    const parsedPrice = parseFloat(item.variant.price);
    if (isNaN(parsedPrice)) {
      throw new Error(`Invalid price for variant ${item.variantId}`);
    }
    const priceCents = Math.round(parsedPrice * 100);
    const itemSubtotalCents = priceCents * item.quantity;
    subtotalCents += itemSubtotalCents;

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      sku: item.variant.sku,
      price: item.variant.price,
      subtotal: (itemSubtotalCents / 100).toFixed(2),
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
    subtotal: (subtotalCents / 100).toFixed(2),
    updatedAt: cartRaw.updatedAt.toISOString(),
  };
}
