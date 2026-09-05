import { randomUUID, webcrypto } from 'node:crypto';

import { db, user, categories, products, session, sql, eq } from '@wellness/db';

export type FactoryUser = typeof user.$inferSelect;
export type FactoryProduct = typeof products.$inferSelect;
export type FactoryCategory = typeof categories.$inferSelect;

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
if (!BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable must be set for tests');
}

export async function signSessionToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await webcrypto.subtle.sign('HMAC', key, encoder.encode(token));
  const base64Signature = Buffer.from(signature).toString('base64');

  return `${token}.${base64Signature}`;
}

type UserOverride = Partial<typeof user.$inferInsert>;
type CategoryOverride = Partial<typeof categories.$inferInsert>;
type ProductOverride = Partial<typeof products.$inferInsert>;

export const factories = {
  async createUser(overrides?: UserOverride) {
    const id = overrides?.id || randomUUID();
    const [newUser] = await db
      .insert(user)
      .values({
        id,
        name: overrides?.name || 'Test User',
        email: overrides?.email || `test-${id}@example.com`,
        emailVerified: overrides?.emailVerified || true,
        role: overrides?.role || 'customer',
        createdAt: overrides?.createdAt || new Date(),
        updatedAt: overrides?.updatedAt || new Date(),
        ...overrides,
      })
      .returning();
    if (!newUser) throw new Error('Failed to create user');
    return newUser;
  },

  async assignRole(userId: string, roleName: 'customer' | 'admin') {
    await db.update(user).set({ role: roleName }).where(eq(user.id, userId));
  },

  async createCategory(overrides?: CategoryOverride) {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: overrides?.name || 'Test Category',
        slug:
          overrides?.slug ||
          `test-category-${String(Date.now())}-${Math.random().toString(36).substring(2, 7)}`,
        description: overrides?.description || 'Test category description',
        isActive: overrides?.isActive ?? true,
        ...overrides,
      })
      .returning();
    if (!newCategory) throw new Error('Failed to create category');
    return newCategory;
  },

  async createProduct(overrides?: ProductOverride) {
    const [newProduct] = await db
      .insert(products)
      .values({
        name: overrides?.name || 'Test Product',
        description: overrides?.description || 'Test description',
        sellingPrice: overrides?.sellingPrice || '100.00',
        mrp: overrides?.mrp || '150.00',
        stockQty: overrides?.stockQty ?? 10,
        stockStatus: overrides?.stockStatus || 'in_stock',
        ...overrides,
      })
      .returning();
    if (!newProduct) throw new Error('Failed to create product');
    return newProduct;
  },

  async createSession(userId: string) {
    const token = randomUUID();

    await db.insert(session).values({
      id: randomUUID(),
      userId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const signedToken = await signSessionToken(token, BETTER_AUTH_SECRET);
    return { token: signedToken };
  },

  async cleanup() {
    await db.execute(sql`
      TRUNCATE TABLE
        cart_item,
        cart,
        product,
        category,
        session,
        "user"
      CASCADE
    `);
  },
};
