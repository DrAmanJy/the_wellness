import { randomUUID } from 'crypto';
import { webcrypto } from 'node:crypto';

import { db, user, role, userRole, categories, products, session, sql } from '@wellness/db';

export type FactoryUser = typeof user.$inferSelect;
export type FactoryProduct = typeof products.$inferSelect;
export type FactoryCategory = typeof categories.$inferSelect;

// Secret must match the one in packages/config (or better-auth setup)
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
  // Better Auth expects standard base64 from btoa, not base64url
  const base64Signature = Buffer.from(signature).toString('base64');

  return `${token}.${base64Signature}`;
}

// Types for factory overrides
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
        createdAt: overrides?.createdAt || new Date(),
        updatedAt: overrides?.updatedAt || new Date(),
        ...overrides,
      })
      .returning();
    if (!newUser) throw new Error('Failed to create user');
    return newUser;
  },

  async createRole(name: string) {
    const [newRole] = await db
      .insert(role)
      .values({
        id: randomUUID(),
        name,
      })
      .onConflictDoUpdate({
        target: role.name,
        set: { name },
      })
      .returning();
    if (!newRole) throw new Error('Failed to create role');
    return newRole;
  },

  async assignRole(userId: string, roleName: string) {
    const r = await this.createRole(roleName);
    await db
      .insert(userRole)
      .values({
        userId,
        roleId: r.id,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  },

  async createCategory(overrides?: CategoryOverride) {
    const id = overrides?.id || randomUUID();
    const [newCategory] = await db
      .insert(categories)
      .values({
        id,
        name: overrides?.name || 'Test Category',
        slug: overrides?.slug || `test-category-${id}`,
        description: overrides?.description || 'Test category description',
        isActive: overrides?.isActive ?? true,
        ...overrides,
      })
      .returning();
    if (!newCategory) throw new Error('Failed to create category');
    return newCategory;
  },

  async createProduct(overrides?: ProductOverride) {
    const id = overrides?.id || randomUUID();
    let createdBy = overrides?.createdBy;
    let updatedBy = overrides?.updatedBy;

    if (!createdBy) {
      const u = await this.createUser();
      createdBy = u.id;
      if (!updatedBy) updatedBy = u.id;
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        id,
        name: overrides?.name || 'Test Product',
        slug: overrides?.slug || `test-product-${id}`,
        status: overrides?.status || 'active',
        createdBy,
        updatedBy,
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
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const signedToken = await signSessionToken(token, BETTER_AUTH_SECRET);
    return { token: signedToken };
  },

  /**
   * Deterministic cleanup strictly following foreign-key dependencies.
   * Call this in `afterEach` or `afterAll`.
   */
  async cleanup() {
    await db.execute(sql`
      TRUNCATE TABLE
        product_images,
        product_variants,
        product_categories,
        products,
        categories,
        user_role,
        role,
        session,
        "user"
      CASCADE
    `);
  },
};
