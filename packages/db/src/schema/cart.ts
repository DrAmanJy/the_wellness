import { sql, relations } from 'drizzle-orm';
import {
  pgTable,
  integer,
  timestamp,
  uuid,
  uniqueIndex,
  index,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { productVariants } from './product';

export const cartStatusEnum = pgEnum('cart_status', ['active', 'converted', 'abandoned']);

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    status: cartStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return [
      // Enforce ONE ACTIVE CART PER USER
      uniqueIndex('unique_active_cart_per_user_idx')
        .on(table.userId)
        .where(sql`${table.status} = 'active'`),
      index('carts_user_id_idx').on(table.userId),
    ];
  },
);

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (_table) => {
    return [];
  },
);

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));
