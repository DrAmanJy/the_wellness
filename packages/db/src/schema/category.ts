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
  index,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';

import { user } from './auth';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdBy: text('created_by').references(() => user.id),

    updatedBy: text('updated_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => {
    return [
      check('categories_parent_not_self', sql`${table.parentId} != ${table.id}`),
      uniqueIndex('categories_slug_unique_idx')
        .on(table.slug)
        .where(sql`${table.deletedAt} IS NULL`),
      index('categories_tree_idx').on(table.parentId, table.isActive, table.sortOrder),
    ];
  },
);
