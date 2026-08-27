import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  check,
  uuid,
  pgEnum,
  primaryKey,
  index,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { categories } from './category';

export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    shortDescription: varchar('short_description', { length: 500 }),
    brand: varchar('brand', { length: 255 }),
    status: productStatusEnum('status').default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    categoryPrimaryId: uuid('category_primary_id').references(() => categories.id),
    tags: jsonb('tags').$type<string[]>(),
    attributes: jsonb('attributes'),
    specifications: jsonb('specifications'),
    ingredients: jsonb('ingredients'),
    benefits: jsonb('benefits'),
    seo: jsonb('seo'),
    metadata: jsonb('metadata'),
    createdBy: text('created_by').references(() => user.id),
    updatedBy: text('updated_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => {
    return [
      uniqueIndex('products_slug_unique_idx')
        .on(table.slug)
        .where(sql`${table.deletedAt} IS NULL`),
      index('products_catalog_pagination_idx').on(table.status, table.createdAt),
      index('products_featured_catalog_idx').on(table.status, table.isFeatured, table.createdAt),
      index('products_category_primary_idx').on(table.categoryPrimaryId, table.status),
      index('products_name_trgm_idx').using('gin', sql`(${table.name}::text) gin_trgm_ops`),
      index('products_slug_trgm_idx').using('gin', sql`(${table.slug}::text) gin_trgm_ops`),
      index('products_description_trgm_idx').using(
        'gin',
        sql`(${table.description}::text) gin_trgm_ops`,
      ),
    ];
  },
);

export const productCategories = pgTable(
  'product_categories',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.productId, table.categoryId] }),
      index('product_categories_category_idx').on(table.categoryId),
    ];
  },
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    name: varchar('name', { length: 255 }).notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    weight: numeric('weight', { precision: 10, scale: 2 }),
    length: numeric('length', { precision: 10, scale: 2 }),
    width: numeric('width', { precision: 10, scale: 2 }),
    height: numeric('height', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => {
    return [
      index('product_variants_idx').on(table.productId, table.isActive, table.sortOrder),
      uniqueIndex('product_variants_sku_unique_idx')
        .on(table.sku)
        .where(sql`${table.deletedAt} IS NULL`),
      index('product_variants_sku_trgm_idx').using('gin', sql`(${table.sku}::text) gin_trgm_ops`),
      check('product_variants_price_positive', sql`${table.price} >= 0`),
      check('product_variants_compare_at_price_positive', sql`${table.compareAtPrice} >= 0`),
      check(
        'product_variants_compare_at_price_valid',
        sql`${table.compareAtPrice} IS NULL OR ${table.compareAtPrice} >= ${table.price}`,
      ),
      check('product_variants_weight_positive', sql`${table.weight} >= 0`),
      check('product_variants_length_positive', sql`${table.length} >= 0`),
      check('product_variants_width_positive', sql`${table.width} >= 0`),
      check('product_variants_height_positive', sql`${table.height} >= 0`),
      check('product_variants_sort_order_positive', sql`${table.sortOrder} >= 0`),
    ];
  },
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    variantId: uuid('variant_id').references(() => productVariants.id),
    url: text('url').notNull(),
    altText: varchar('alt_text', { length: 255 }),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return [
      index('product_images_product_idx').on(table.productId, table.sortOrder),
      index('product_images_variant_idx').on(table.variantId, table.sortOrder),
      check('product_images_sort_order_positive', sql`${table.sortOrder} >= 0`),
      uniqueIndex('product_images_primary_unique_idx')
        .on(table.productId)
        .where(sql`${table.isPrimary} = true AND ${table.variantId} IS NULL`),
      uniqueIndex('product_images_variant_primary_unique_idx')
        .on(table.variantId)
        .where(sql`${table.isPrimary} = true AND ${table.variantId} IS NOT NULL`),
    ];
  },
);
