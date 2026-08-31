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
  sql,
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

  private async ensureActiveCart(
    dbOrTx: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0],
    userId: string,
  ) {
    await dbOrTx
      .insert(carts)
      .values({ userId, status: 'active' })
      .onConflictDoNothing({
        target: carts.userId,
        where: eq(carts.status, 'active'),
      });

    const [cart] = await dbOrTx
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .limit(1);

    if (!cart) throw new Error('Failed to create or retrieve cart');
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.ensureActiveCart(db, userId);

    const cartData = await this.getCartData(cart.id);
    if (!cartData) throw new Error('Cart not found after creation');
    return toCartDTO(cartData);
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestError('Quantity must be greater than zero');

    return db.transaction(async (tx) => {
      // 1. Get or create cart
      const cart = await this.ensureActiveCart(tx, userId);

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

      // 3. Upsert cart item with atomic increment
      const [upsertedItem] = await tx
        .insert(cartItems)
        .values({
          cartId: cart.id,
          variantId,
          quantity,
        })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.variantId],
          set: {
            quantity: sql`${cartItems.quantity} + ${quantity}`,
            updatedAt: new Date(),
          },
        })
        .returning({ quantity: cartItems.quantity });

      if (!upsertedItem) {
        throw new Error('Failed to upsert cart item');
      }

      // 4. Check inventory against the resulting quantity
      const [inv] = await tx
        .select({ availableQty: inventory.availableQty })
        .from(inventory)
        .where(eq(inventory.variantId, variantId));

      if (!inv || inv.availableQty < upsertedItem.quantity) {
        throw new ConflictError('Insufficient inventory');
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
        .select({ id: cartItems.id, variantId: cartItems.variantId })
        .from(cartItems)
        .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
        .limit(1);

      if (!item) throw new NotFoundError('Item not found in cart');

      const variantData = await tx.query.productVariants.findFirst({
        where: and(eq(productVariants.id, item.variantId), isNull(productVariants.deletedAt)),
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

      const [inv] = await tx
        .select({ availableQty: inventory.availableQty })
        .from(inventory)
        .where(eq(inventory.variantId, item.variantId));

      if (!inv || inv.availableQty < quantity) {
        throw new ConflictError('Insufficient inventory');
      }

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
