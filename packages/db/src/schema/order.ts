import { pgTable, integer, varchar, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

import { user } from './auth';
import { shippingAddresses } from './customer';
import { products } from './product';

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

export const orders = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id),
  shippingAddress: uuid('shipping_address').references(() => shippingAddresses.id),
  deliveryProvider: varchar('delivery_provider', { length: 255 }),
  price: integer('price'),
  expectedDeliveryDate: timestamp('expected_delivery_date', { withTimezone: true }),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotal: integer('subtotal'),
  discountAmount: integer('discount_amount'),
  shippingAmount: integer('shipping_amount'),
  taxAmount: integer('tax_amount'),
  totalAmount: integer('total_amount'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderShippingAddresses = pgTable('order_shipping_address', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  houseNumber: varchar('house_number', { length: 255 }),
  street: text('street'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 20 }),
  country: varchar('country', { length: 100 }),
});

export const orderItems = pgTable('order_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  productName: varchar('product_name', { length: 255 }),
  productSku: varchar('product_sku', { length: 100 }),
  unitPrice: integer('unit_price'),
  quantity: integer('quantity').notNull(),
  discountAmount: integer('discount_amount'),
  taxAmount: integer('tax_amount'),
  totalAmount: integer('total_amount'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderStatusHistories = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 100 }),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'authorized',
  'captured',
  'failed',
  'cancelled',
  'refunded',
]);

export const payments = pgTable('payment', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  transactionId: varchar('transaction_id', { length: 255 }),
  provider: varchar('provider', { length: 100 }),
  amount: integer('amount'),
  currency: varchar('currency', { length: 10 }),
  status: paymentStatusEnum('status').default('pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable('invoice', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id').references(() => payments.id),
  orderId: uuid('order_id').references(() => orders.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const refundStatusEnum = pgEnum('refund_status', [
  'initiated',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

export const refunds = pgTable('refund', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id').references(() => payments.id),
  orderId: uuid('order_id').references(() => orders.id),
  amount: integer('amount'),
  reason: text('reason'),
  status: refundStatusEnum('status').default('initiated').notNull(),
  transactionId: varchar('transaction_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
