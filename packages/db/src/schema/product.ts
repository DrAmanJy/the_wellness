import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  numeric,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { categories } from './category';

export const stockStatusEnum = pgEnum('stock_status', ['in_stock', 'out_of_stock', 'discontinued']);

export const products = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ingrediants: jsonb('ingrediants'),
  tags: jsonb('tags').$type<string[]>(),
  sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }).default('0.00').notNull(),
  mrp: numeric('mrp', { precision: 10, scale: 2 }).default('0.00').notNull(),
  stockQty: integer('stock_qty').default(0).notNull(),
  stockStatus: stockStatusEnum('stock_status').default('in_stock').notNull(),
  isBestSeller: boolean('is_best_seller').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isNewest: boolean('is_newest').default(false).notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  features: jsonb('features'),
});

export const productImages = pgTable('product_image', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  altText: text('alt_text'),
  displayOrder: integer('display_order').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
