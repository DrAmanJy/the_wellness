import { pgTable, varchar, text, boolean, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const promotions = pgTable('promotion', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  targetUrl: text('target_url').default('/products').notNull(),
  discountText: varchar('discount_text', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
