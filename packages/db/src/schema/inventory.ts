import { sql } from 'drizzle-orm';
import { pgTable, integer, timestamp, check, uuid, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';

import { productVariants } from './product';

export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id),
    availableQty: integer('available_qty').default(0).notNull(),
    reservedQty: integer('reserved_qty').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return [
      uniqueIndex('inventory_variant_unique_idx').on(table.variantId),
      check('inventory_available_qty_positive', sql`${table.availableQty} >= 0`),
      check('inventory_reserved_qty_positive', sql`${table.reservedQty} >= 0`),
    ];
  },
);

export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', [
  'purchase',
  'sale',
  'reservation',
  'release',
  'return',
  'adjustment',
]);

export const inventoryTransactions = pgTable(
  'inventory_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id),
    orderId: uuid('order_id'), // Nullable
    type: inventoryTransactionTypeEnum('type').notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return [check('inventory_transactions_quantity_positive', sql`${table.quantity} > 0`)];
  },
);
