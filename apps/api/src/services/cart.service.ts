import { db, carts, cartItems, products, inventory, eq, and, sql } from '@wellness/db';
import { NotFoundError, BadRequestError } from '@wellness/utils';

import { toCartDTO } from './cart.mapper';

export class CartService {
  private async ensureActiveCart(userId?: string, cartId?: string) {
    if (userId) {
      const [existing] = await db
        .select()
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
        .limit(1);

      if (existing) return existing;

      const [cart] = await db.insert(carts).values({ userId, status: 'active' }).returning();

      if (!cart) throw new Error('Failed to create cart');
      return cart;
    }

    if (cartId) {
      const [existing] = await db
        .select()
        .from(carts)
        .where(and(eq(carts.id, cartId), eq(carts.status, 'active')))
        .limit(1);

      if (existing) return existing;
    }

    const [cart] = await db.insert(carts).values({ status: 'active' }).returning();

    if (!cart) throw new Error('Failed to create cart');
    return cart;
  }

  async getCart(userId?: string, cartId?: string) {
    const cart = await this.ensureActiveCart(userId, cartId);

    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.name,
        sellingPrice: products.sellingPrice,
        mrp: products.mrp,
        description: products.description,
        stockQty: products.stockQty,
        stockStatus: products.stockStatus,
        availableQty: inventory.availableQty,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(eq(cartItems.cartId, cart.id));

    return toCartDTO({
      id: cart.id,
      userId: cart.userId,
      status: cart.status,
      updatedAt: cart.updatedAt,
      items,
    });
  }

  async addItem(productId: string, quantity: number, userId?: string, cartId?: string) {
    if (quantity <= 0) throw new BadRequestError('Quantity must be positive');

    const cart = await this.ensureActiveCart(userId, cartId);

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) throw new NotFoundError('Product not found');

    await db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        productId,
        quantity,
      })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.productId],
        set: {
          quantity: sql`${cartItems.quantity} + ${quantity}`,
          updatedAt: new Date(),
        },
      });

    return this.getCart(userId, cart.id);
  }

  async updateItemQuantity(productId: string, quantity: number, userId?: string, cartId?: string) {
    if (quantity <= 0) throw new BadRequestError('Quantity must be positive');

    const cart = await this.ensureActiveCart(userId, cartId);

    const [item] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
      .returning();

    if (!item) throw new NotFoundError('Cart item not found');

    return this.getCart(userId, cart.id);
  }

  async removeItem(productId: string, userId?: string, cartId?: string) {
    const cart = await this.ensureActiveCart(userId, cartId);

    const [deleted] = await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
      .returning();

    if (!deleted) throw new NotFoundError('Cart item not found');

    return this.getCart(userId, cart.id);
  }
}

export const cartService = new CartService();
