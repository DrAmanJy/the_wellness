import { pgTable, integer, text, timestamp, uuid, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

import { user } from './auth';
import { products } from './product';

export const cartStatusEnum = pgEnum('cart_status', ['active', 'converted', 'abandoned']);

export const carts = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id),
  status: cartStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable(
  'cart_item',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('unique_cart_product_idx').on(table.cartId, table.productId)],
);
