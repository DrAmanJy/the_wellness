import { pgTable, integer, timestamp, uuid, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

import { products } from './product';

export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id)
      .unique(),
    availableQty: integer('available_qty').default(0).notNull(),
    reservedQty: integer('reserved_qty').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('inventory_product_unique_idx').on(table.productId)],
);

export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', [
  'purchase',
  'sale',
  'reservation',
  'release',
  'return',
  'adjustment',
]);

export const inventoryTransactions = pgTable('inventory_transaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  orderId: uuid('order_id'),
  type: inventoryTransactionTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
