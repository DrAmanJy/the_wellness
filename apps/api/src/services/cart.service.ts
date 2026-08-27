import {
  db,
  carts,
  cartItems,
  productVariants,
  productImages,
  inventory,
  eq,
  and,
  isNull,
} from '@wellness/db';
import { NotFoundError, ConflictError, BadRequestError } from '@wellness/utils';

import { toCartDTO } from './cart.mapper';

export class CartService {
  /**
   * Internal helper to fetch a cart with all required relational data.
   */
  private async getCartData(cartId: string) {
    const cartData = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: {
                  with: {
                    images: {
                      where: eq(productImages.isPrimary, true),
                      limit: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return cartData;
  }

  async getCart(userId: string) {
    let [cart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .limit(1);

    if (!cart) {
      const [newCart] = await db.insert(carts).values({ userId, status: 'active' }).returning();
      if (!newCart) throw new Error('Failed to create cart');
      cart = newCart;
    }

    const cartData = await this.getCartData(cart.id);
    if (!cartData) throw new Error('Cart not found after creation');
    return toCartDTO(cartData);
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestError('Quantity must be greater than zero');

    return db.transaction(async (tx) => {
      // 1. Get or create cart
      let [cart] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
        .limit(1);

      if (!cart) {
        const [newCart] = await tx
          .insert(carts)
          .values({ userId, status: 'active' })
          .returning({ id: carts.id });
        if (!newCart) throw new Error('Failed to create cart');
        cart = newCart;
      }

      // 2. Validate variant and product
      const variantData = await tx.query.productVariants.findFirst({
        where: and(eq(productVariants.id, variantId), isNull(productVariants.deletedAt)),
        with: {
          product: true,
        },
      });

      if (!variantData) throw new NotFoundError('Variant not found');
      if (!variantData.isActive) throw new ConflictError('Variant is not purchasable');

      const productData = variantData.product;
      if (productData.deletedAt !== null) {
        throw new NotFoundError('Parent product not found or deleted');
      }
      if (productData.status !== 'active') {
        throw new ConflictError('Parent product is not publicly purchasable');
      }

      // 3. Check inventory (Optional but recommended to prevent bad UX)
      // Decision: We only check if there is ANY inventory available at all to prevent adding out-of-stock items,
      // but we do NOT reserve the inventory until checkout to prevent cart-hoarding.
      const [inv] = await tx
        .select({ availableQty: inventory.availableQty })
        .from(inventory)
        .where(eq(inventory.variantId, variantId));

      if (!inv || inv.availableQty < quantity) {
        throw new ConflictError('Insufficient inventory');
      }

      // 4. Add or increment item
      const [existingItem] = await tx
        .select({ id: cartItems.id, quantity: cartItems.quantity })
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)))
        .limit(1);

      if (existingItem) {
        await tx
          .update(cartItems)
          .set({
            quantity: existingItem.quantity + quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        await tx.insert(cartItems).values({
          cartId: cart.id,
          variantId,
          quantity,
        });
      }

      // Update cart timestamp
      await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
    });
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestError('Quantity must be greater than zero');

    return db.transaction(async (tx) => {
      const [cart] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
        .limit(1);

      if (!cart) throw new NotFoundError('Active cart not found');

      const [item] = await tx
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
        .limit(1);

      if (!item) throw new NotFoundError('Item not found in cart');

      await tx
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, item.id));

      await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
    });
  }

  async removeItem(userId: string, itemId: string) {
    return db.transaction(async (tx) => {
      const [cart] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
        .limit(1);

      if (!cart) throw new NotFoundError('Active cart not found');

      const [deletedItem] = await tx
        .delete(cartItems)
        .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
        .returning({ id: cartItems.id });

      if (!deletedItem) throw new NotFoundError('Item not found in cart');

      await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
    });
  }

  async clearCart(userId: string) {
    return db.transaction(async (tx) => {
      const [cart] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
        .limit(1);

      if (!cart) throw new NotFoundError('Active cart not found');

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
    });
  }
}

export const cartService = new CartService();
