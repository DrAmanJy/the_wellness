import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { db, carts, cartItems, eq, inventory, productVariants, products } from '@wellness/db';

import { app } from '../app';
import { factories } from '../test/factories';
import { getResponseBody, CartResponse } from '../test/test-utils';

describe('Cart API Controllers', () => {
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let userBId: string;

  beforeEach(async () => {
    const userA = await factories.createUser();
    const sessionA = await factories.createSession(userA.id);
    userAId = userA.id;
    userAToken = sessionA.token;

    const userB = await factories.createUser();
    const sessionB = await factories.createSession(userB.id);
    userBId = userB.id;
    userBToken = sessionB.token;
  });

  afterEach(async () => {
    await factories.cleanup();
  });

  describe('GET /api/cart', () => {
    it('returns empty cart on first fetch and creates it', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', [`better-auth.session_token=${userAToken}`]);
      expect(res.status).toBe(200);
      const body = getResponseBody<CartResponse>(res);
      expect(body.success).toBe(true);
      expect(body.data.itemCount).toBe(0);
      expect(body.data.items).toEqual([]);

      const userCarts = await db.select().from(carts).where(eq(carts.userId, userAId));
      expect(userCarts.length).toBe(1);
    });

    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });

    it('prevents User B from accessing User A cart (M11)', async () => {
      // 1. Setup User A's cart with an item
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);
      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      // 2. Setup User B's cart
      await request(app)
        .get('/api/cart')
        .set('Cookie', [`better-auth.session_token=${userBToken}`]);

      // 3. User B requests their cart
      const resB = await request(app)
        .get('/api/cart')
        .set('Cookie', [`better-auth.session_token=${userBToken}`]);

      expect(resB.status).toBe(200);

      // User B should have an empty cart, not User A's items
      const bodyB = getResponseBody<CartResponse>(resB);
      expect(bodyB.data.itemCount).toBe(0);
      expect(bodyB.data.items).toEqual([]);

      // User A's cart is not exposed
      const itemsString = JSON.stringify(bodyB.data);
      expect(itemsString).not.toContain(variant.id);
    });
  });

  describe('POST /api/cart/items', () => {
    it('adds a valid item to the cart', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 2 });

      expect(res.status).toBe(201);
      const body = getResponseBody<CartResponse>(res);
      expect(body.data.itemCount).toBe(2);
      expect(body.data.items[0]?.quantity).toBe(2);
      expect(body.data.items[0]?.variantId).toBe(variant.id);
    });

    it('increments quantity on duplicate variant addition', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 }, 15000);

      await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 2 });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 3 });

      expect(res.status).toBe(201);
      const body = getResponseBody<CartResponse>(res);
      expect(body.data.itemCount).toBe(5);
      expect(body.data.items[0]?.quantity).toBe(5);
    });

    it('returns 404 for invalid/missing variant', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: '00000000-0000-0000-0000-000000000000', quantity: 1 });

      expect(res.status).toBe(404);
    });

    it('returns 400 for negative/zero quantity', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: '00000000-0000-0000-0000-000000000000', quantity: 0 }); // zod should catch this

      expect(res.status).toBe(400);
    });

    it('rejects negative/zero quantity at the service level (M16)', async () => {
      const { CartService } = await import('../services/cart.service');
      const cartService = new CartService();

      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await expect(cartService.addItem(userAId, variant.id, 0)).rejects.toThrow(
        'Quantity must be greater than zero',
      );
      await expect(cartService.addItem(userAId, variant.id, 0)).rejects.toThrow(
        'Quantity must be greater than zero',
      );
      await expect(cartService.addItem(userAId, variant.id, -5)).rejects.toThrow(
        'Quantity must be greater than zero',
      );
    });

    it('enforces quantity > 0 at the PostgreSQL level (M21)', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      const [cart] = await db
        .insert(carts)
        .values({ userId: userAId, status: 'active' })
        .returning();
      if (!cart) throw new Error('Failed to create cart');

      // Attempt to bypass service and insert negative quantity directly
      await expect(
        db.insert(cartItems).values({
          cartId: cart.id,
          variantId: variant.id,
          quantity: 0,
        }),
      ).rejects.toThrow();

      await expect(
        db.insert(cartItems).values({
          cartId: cart.id,
          variantId: variant.id,
          quantity: -10,
        }),
      ).rejects.toThrow();
    });

    it('enforces one active cart per user at the PostgreSQL level (M22)', async () => {
      // Create first active cart
      await db.insert(carts).values({ userId: userAId, status: 'active' });

      // Attempt to create second active cart for the same user
      await expect(
        db.insert(carts).values({ userId: userAId, status: 'active' }),
      ).rejects.toThrow(); // Drizzle wraps the constraint error, but it throws!

      // But should allow another user
      await expect(
        db.insert(carts).values({ userId: userBId, status: 'active' }),
      ).resolves.toBeDefined();
    });

    it('returns 409 when item is out of stock', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      // We didn't create inventory for this variant, so availableQty defaults to 0 if we assume it gets created,
      // but if there is NO inventory record, the service will also throw 409.

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      expect(res.status).toBe(409);
    });

    it('prevents adding a soft-deleted variant to the cart (M14)', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      // Soft-delete the variant
      await db
        .update(productVariants)
        .set({ deletedAt: new Date() })
        .where(eq(productVariants.id, variant.id));

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      expect(res.status).toBe(404);

      // Verify no item was created
      const currentItems = await db.select().from(cartItems);
      expect(currentItems.length).toBe(0);
    });

    it('prevents adding a variant of a soft-deleted product to the cart (M15)', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      // Soft-delete the product
      await db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, product.id));

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      expect(res.status).toBe(404);

      // Verify no item was created
      const currentItems = await db.select().from(cartItems);
      expect(currentItems.length).toBe(0);
    });
  });

  describe('PATCH /api/cart/items/:id', () => {
    it('updates quantity for an existing item', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      // Inject inventory so we can add it
      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 2 });

      const addBody = getResponseBody<CartResponse>(addRes);
      const itemId = addBody.data.items[0]?.id;
      if (!itemId) throw new Error('No item');

      const res = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      const body = getResponseBody<CartResponse>(res);
      expect(body.data.itemCount).toBe(5);
      expect(body.data.items[0]?.quantity).toBe(5);
    });

    it('prevents user B from updating user A cart item (IDOR)', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 2 });

      const addBody = getResponseBody<CartResponse>(addRes);
      const itemId = addBody.data.items[0]?.id;
      if (!itemId) throw new Error('No item');

      // Ensure User B has an active cart (M12 fix)
      await request(app)
        .get('/api/cart')
        .set('Cookie', [`better-auth.session_token=${userBToken}`]);

      // User B attempts to patch
      const res = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set('Cookie', [`better-auth.session_token=${userBToken}`])
        .send({ quantity: 10 });

      expect(res.status).toBe(404); // Should not expose that it exists in another cart
    });
  });

  describe('DELETE /api/cart/items/:id', () => {
    it('removes an item', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      const addBody = getResponseBody<CartResponse>(addRes);
      const itemId = addBody.data.items[0]?.id;
      if (!itemId) throw new Error('No item');

      const res = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set('Cookie', [`better-auth.session_token=${userAToken}`]);

      expect(res.status).toBe(200);
      const body = getResponseBody<CartResponse>(res);
      expect(body.data.itemCount).toBe(0);
      expect(body.data.items.length).toBe(0);
    });

    it('prevents user B from removing user A item (IDOR)', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      const addBody = getResponseBody<CartResponse>(addRes);
      const itemId = addBody.data.items[0]?.id;
      if (!itemId) throw new Error('No item');

      // Ensure User B has an active cart (M12 fix)
      await request(app)
        .get('/api/cart')
        .set('Cookie', [`better-auth.session_token=${userBToken}`]);

      const res = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set('Cookie', [`better-auth.session_token=${userBToken}`]);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/cart', () => {
    it('clears all items in the cart', async () => {
      const product = await factories.createProduct();
      const variant1 = await factories.createVariant(product.id);
      const variant2 = await factories.createVariant(product.id);

      await db.insert(inventory).values([
        { variantId: variant1.id, availableQty: 10 },
        { variantId: variant2.id, availableQty: 10 },
      ]);

      await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant1.id, quantity: 1 }, 15000);

      await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant2.id, quantity: 1 });

      const res = await request(app)
        .delete(`/api/cart`)
        .set('Cookie', [`better-auth.session_token=${userAToken}`]);

      expect(res.status).toBe(200);
      const body = getResponseBody<CartResponse>(res);
      expect(body.data.itemCount).toBe(0);

      // Verify DB
      const userCarts = await db.select().from(carts).where(eq(carts.userId, userAId));
      if (!userCarts[0]) throw new Error('Cart not found');
      const items = await db.select().from(cartItems).where(eq(cartItems.cartId, userCarts[0].id));
      expect(items.length).toBe(0);
    });
  });

  describe('Overfetching & Data Leak Prevention', () => {
    it('does not leak internal audit fields in cart response', async () => {
      const product = await factories.createProduct();
      const variant = await factories.createVariant(product.id);

      await db.insert(inventory).values({ variantId: variant.id, availableQty: 10 });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`better-auth.session_token=${userAToken}`])
        .send({ variantId: variant.id, quantity: 1 });

      const body = getResponseBody<CartResponse>(res);
      const cart = body.data;
      expect(cart).not.toHaveProperty('userId'); // Shouldn't expose the underlying userId
      expect(cart).not.toHaveProperty('createdAt');

      const item = cart.items[0];
      if (!item) throw new Error('No items');
      expect(item).not.toHaveProperty('cartId'); // shouldn't expose internal relationships
      expect(item).not.toHaveProperty('createdAt');
      expect(item).not.toHaveProperty('updatedAt');
      expect(item.product).not.toHaveProperty('createdBy');
      expect(item.product).not.toHaveProperty('createdAt');
    });
  });
});
