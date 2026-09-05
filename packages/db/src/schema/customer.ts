import { pgTable, text, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth';

export const shippingAddresses = pgTable('shipping_address', {
  id: uuid('id').defaultRandom().primaryKey(),
  houseNumber: varchar('house_number', { length: 255 }),
  street: text('street'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 20 }),
  country: varchar('country', { length: 100 }),
  userId: text('user_id').references(() => user.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customerInquiries = pgTable('customer_inquiry', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  inquiryType: varchar('inquiry_type', { length: 100 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
