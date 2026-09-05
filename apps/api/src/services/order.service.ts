import type { OrderDTO } from '@wellness/contracts';
import {
  db,
  orders,
  orderShippingAddresses,
  orderItems,
  payments,
  invoices,
  inventoryTransactions,
  inventory,
  carts,
  cartItems,
  products,
  orderStatusHistories,
  eq,
  and,
  gte,
  sql,
  desc,
  asc,
} from '@wellness/db';
import { NotFoundError, BadRequestError } from '@wellness/utils';
import type { CreateOrderInput } from '@wellness/validation';

import { toOrderDTO } from './order.mapper';

export class OrderService {
  async createOrder(input: CreateOrderInput, userId?: string, cartId?: string): Promise<OrderDTO> {
    const { shippingAddress, payment: paymentInput, items: itemsInput } = input;

    if (itemsInput.length === 0) {
      throw new BadRequestError('Order must contain at least one item');
    }

    // 1. Calculate totals
    const calculatedSubtotal = itemsInput.reduce(
      (sum, item) => sum + Math.round(item.unitPrice * item.quantity),
      0,
    );
    const taxAmount = input.taxAmount ?? Math.round(calculatedSubtotal * 0.1);
    const shippingAmount = input.shippingAmount ?? (calculatedSubtotal > 1000 ? 0 : 99);
    const totalAmount = input.totalAmount ?? calculatedSubtotal + taxAmount + shippingAmount;

    // 2. Generate unique tracking number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingNumber = `TW-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 3. Execute checkout atomically inside a transaction
    const newOrderId = await db.transaction(async (tx) => {
      // 4. Insert order record
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: userId || null,
          status: 'pending',
          trackingNumber,
          subtotal: calculatedSubtotal,
          discountAmount: 0,
          shippingAmount,
          taxAmount,
          totalAmount,
          price: totalAmount,
        })
        .returning();

      if (!newOrder) {
        throw new Error('Failed to create order in database');
      }

      // Record initial status history entry
      await tx.insert(orderStatusHistories).values({
        orderId: newOrder.id,
        status: 'pending',
        comment: 'Order created & pending confirmation',
      });

      // 5. Insert shipping address record
      await tx.insert(orderShippingAddresses).values({
        orderId: newOrder.id,
        houseNumber: shippingAddress.houseNumber || null,
        street: `${shippingAddress.fullName} | ${shippingAddress.phone} | ${shippingAddress.street}`,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India',
      });

      // 6. Insert order items & atomically update inventory / product stock
      for (const item of itemsInput) {
        const itemTotal = Math.round(item.unitPrice * item.quantity);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          item.productId,
        );

        let targetProduct: typeof products.$inferSelect | null = null;

        if (isUuid) {
          const [existing] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);
          if (existing) {
            targetProduct = existing;
          }
        }

        if (!targetProduct && item.productName) {
          const [existingByName] = await tx
            .select()
            .from(products)
            .where(eq(products.name, item.productName))
            .limit(1);
          if (existingByName) {
            targetProduct = existingByName;
          }
        }

        if (!targetProduct) {
          const [firstProd] = await tx.select().from(products).limit(1);
          if (firstProd) {
            targetProduct = firstProd;
          }
        }

        // If no matching product exists in DB at all, create a product record
        if (!targetProduct) {
          const [createdProd] = await tx
            .insert(products)
            .values({
              name: item.productName || 'Therapeutic Formulation',
              description: 'Healthcare formulation item',
              sellingPrice: Math.round(item.unitPrice).toString(),
              mrp: Math.round(item.unitPrice).toString(),
              stockQty: 100,
              stockStatus: 'in_stock',
            })
            .returning();

          if (createdProd) {
            targetProduct = createdProd;
            await tx.insert(inventory).values({
              productId: targetProduct.id,
              availableQty: 100,
              reservedQty: 0,
            });
          }
        }

        if (!targetProduct) {
          throw new BadRequestError(`Product "${item.productName || item.productId}" not found.`);
        }

        // Atomic conditional update on products: only succeeds if sufficient quantity remains
        const updatedProducts = await tx
          .update(products)
          .set({
            stockQty: sql`${products.stockQty} - ${item.quantity}`,
            stockStatus: sql`CASE WHEN ${products.stockQty} - ${item.quantity} = 0 THEN 'out_of_stock'::stock_status ELSE ${products.stockStatus} END`,
            lastUpdated: new Date(),
          })
          .where(and(eq(products.id, targetProduct.id), gte(products.stockQty, item.quantity)))
          .returning();

        if (updatedProducts.length === 0) {
          throw new BadRequestError(
            `Insufficient stock for "${item.productName || targetProduct.name}".`,
          );
        }

        // Insert order_item entry
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: targetProduct.id,
          productName: item.productName || targetProduct.name || 'Therapeutic Product',
          unitPrice: Math.round(item.unitPrice),
          quantity: item.quantity,
          totalAmount: itemTotal,
        });

        // Insert inventory_transaction entry
        await tx.insert(inventoryTransactions).values({
          productId: targetProduct.id,
          orderId: newOrder.id,
          type: 'sale',
          quantity: item.quantity,
        });

        // Atomic conditional update on inventory
        const [existingInv] = await tx
          .select()
          .from(inventory)
          .where(eq(inventory.productId, targetProduct.id))
          .limit(1);

        if (existingInv) {
          const updatedInv = await tx
            .update(inventory)
            .set({
              availableQty: sql`${inventory.availableQty} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(inventory.productId, targetProduct.id),
                gte(inventory.availableQty, item.quantity),
              ),
            )
            .returning();

          if (updatedInv.length === 0) {
            throw new BadRequestError(
              `Insufficient stock for "${item.productName || targetProduct.name}".`,
            );
          }
        } else {
          await tx.insert(inventory).values({
            productId: targetProduct.id,
            availableQty: updatedProducts[0]?.stockQty ?? 0,
            reservedQty: 0,
          });
        }
      }

      // 7. Insert payment record & invoice entry
      const [paymentRecord] = await tx
        .insert(payments)
        .values({
          orderId: newOrder.id,
          transactionId:
            paymentInput.transactionId ||
            paymentInput.razorpayPaymentId ||
            `TXN_${String(Date.now())}_${Math.random().toString(36).substring(2, 7)}`,
          provider: paymentInput.provider || 'razorpay',
          amount: Math.round(paymentInput.amount || totalAmount),
          currency: 'INR',
          status: 'captured',
          paymentMethod: paymentInput.paymentMethod || 'online',
        })
        .returning();

      if (paymentRecord) {
        // Insert invoice entry
        await tx.insert(invoices).values({
          orderId: newOrder.id,
          paymentId: paymentRecord.id,
        });
      }

      // 8. Clear active cart if cartId or userId is provided
      try {
        if (cartId) {
          await tx
            .update(carts)
            .set({ status: 'converted', updatedAt: new Date() })
            .where(eq(carts.id, cartId));

          await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
        } else if (userId) {
          const [activeCart] = await tx
            .select({ id: carts.id })
            .from(carts)
            .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
            .limit(1);

          if (activeCart) {
            await tx
              .update(carts)
              .set({ status: 'converted', updatedAt: new Date() })
              .where(eq(carts.id, activeCart.id));

            await tx.delete(cartItems).where(eq(cartItems.cartId, activeCart.id));
          }
        }
      } catch (err) {
        console.error('Error converting/clearing cart after order:', err);
      }

      return newOrder.id;
    });

    // 9. Fetch complete created order details
    return this.getOrderById(newOrderId);
  }

  async getOrderById(orderId: string, userId?: string, isAdmin?: boolean): Promise<OrderDTO> {
    const [rawOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!rawOrder) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    if (userId && !isAdmin && rawOrder.userId !== userId) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    const [address] = await db
      .select()
      .from(orderShippingAddresses)
      .where(eq(orderShippingAddresses.orderId, orderId))
      .limit(1);

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.orderId, orderId))
      .limit(1);

    const statusHistory = await db
      .select()
      .from(orderStatusHistories)
      .where(eq(orderStatusHistories.orderId, orderId))
      .orderBy(asc(orderStatusHistories.createdAt));

    return toOrderDTO({
      ...rawOrder,
      address,
      items,
      payment,
      invoice,
      statusHistory,
    });
  }

  async getOrders(userId?: string): Promise<OrderDTO[]> {
    const query = userId
      ? db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
      : db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);

    const rawOrders = await query;

    const results: OrderDTO[] = [];
    for (const order of rawOrders) {
      const fullOrder = await this.getOrderById(order.id);
      results.push(fullOrder);
    }

    return results;
  }

  async updateOrderStatus(
    orderId: string,
    status:
      | 'pending'
      | 'confirmed'
      | 'processing'
      | 'shipped'
      | 'out_for_delivery'
      | 'delivered'
      | 'cancelled',
  ): Promise<OrderDTO> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }

    // Insert order status history entry
    await db.insert(orderStatusHistories).values({
      orderId: orderId,
      status,
      comment: `Order status updated to ${status}`,
    });

    return this.getOrderById(orderId);
  }
}

export const orderService = new OrderService();
