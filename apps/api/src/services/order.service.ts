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

    // 2. Validate stock availability for all items before creating order
    for (const item of itemsInput) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        item.productId,
      );
      let existingProd = null;

      if (isUuid) {
        const [prod] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);
        if (prod) existingProd = prod;
      }

      if (!existingProd && item.productName) {
        const [prodByName] = await db
          .select()
          .from(products)
          .where(eq(products.name, item.productName))
          .limit(1);
        if (prodByName) existingProd = prodByName;
      }

      if (existingProd) {
        const [inv] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, existingProd.id))
          .limit(1);

        const currentAvail = inv ? inv.availableQty : existingProd.stockQty;
        const currentStock = existingProd.stockQty;

        if (existingProd.stockStatus === 'out_of_stock' || currentStock <= 0 || currentAvail <= 0) {
          throw new BadRequestError(
            `Product "${item.productName || existingProd.name}" is currently out of stock.`,
          );
        }

        if (item.quantity > currentAvail || item.quantity > currentStock) {
          const maxAllowed = Math.max(0, Math.min(currentAvail, currentStock));
          throw new BadRequestError(
            `Insufficient stock for "${item.productName || existingProd.name}". Only ${String(maxAllowed)} item(s) available.`,
          );
        }
      }
    }

    // 3. Generate unique tracking number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingNumber = `TW-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 4. Insert order record
    const [newOrder] = await db
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
    await db.insert(orderStatusHistories).values({
      orderId: newOrder.id,
      status: 'pending',
      comment: 'Order created & pending confirmation',
    });

    // 5. Insert shipping address record
    await db.insert(orderShippingAddresses).values({
      orderId: newOrder.id,
      houseNumber: shippingAddress.houseNumber || null,
      street: `${shippingAddress.fullName} | ${shippingAddress.phone} | ${shippingAddress.street}`,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
    });

    // 6. Insert order items & update inventory / product stock
    for (const item of itemsInput) {
      const itemTotal = Math.round(item.unitPrice * item.quantity);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        item.productId,
      );

      let targetProduct: typeof products.$inferSelect | null = null;

      if (isUuid) {
        const [existing] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);
        if (existing) {
          targetProduct = existing;
        }
      }

      if (!targetProduct && item.productName) {
        const [existingByName] = await db
          .select()
          .from(products)
          .where(eq(products.name, item.productName))
          .limit(1);
        if (existingByName) {
          targetProduct = existingByName;
        }
      }

      if (!targetProduct) {
        const [firstProd] = await db.select().from(products).limit(1);
        if (firstProd) {
          targetProduct = firstProd;
        }
      }

      // If no matching product exists in DB at all, create a product record
      if (!targetProduct) {
        const [createdProd] = await db
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
          await db.insert(inventory).values({
            productId: targetProduct.id,
            availableQty: 100,
            reservedQty: 0,
          });
        }
      }

      if (targetProduct) {
        try {
          // 1. Insert order_item entry
          await db.insert(orderItems).values({
            orderId: newOrder.id,
            productId: targetProduct.id,
            productName: item.productName || targetProduct.name || 'Therapeutic Product',
            unitPrice: Math.round(item.unitPrice),
            quantity: item.quantity,
            totalAmount: itemTotal,
          });

          // 2. Insert inventory_transaction entry
          await db.insert(inventoryTransactions).values({
            productId: targetProduct.id,
            orderId: newOrder.id,
            type: 'sale',
            quantity: item.quantity,
          });

          // 3. Decrement stockQty & update stockStatus in products table
          const updatedStockQty = Math.max(0, targetProduct.stockQty - item.quantity);
          const updatedStockStatus =
            updatedStockQty === 0 ? 'out_of_stock' : targetProduct.stockStatus;

          await db
            .update(products)
            .set({
              stockQty: updatedStockQty,
              stockStatus: updatedStockStatus,
              lastUpdated: new Date(),
            })
            .where(eq(products.id, targetProduct.id));

          // 4. Update inventory availableQty
          const [currentInv] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.productId, targetProduct.id))
            .limit(1);

          if (currentInv) {
            await db
              .update(inventory)
              .set({
                availableQty: Math.max(0, currentInv.availableQty - item.quantity),
                updatedAt: new Date(),
              })
              .where(eq(inventory.id, currentInv.id));
          } else {
            await db.insert(inventory).values({
              productId: targetProduct.id,
              availableQty: Math.max(0, 100 - item.quantity),
              reservedQty: 0,
            });
          }
        } catch (err) {
          console.error(
            `Failed to insert order item or inventory transaction for ${item.productId}:`,
            err,
          );
        }
      }
    }

    // 6. Insert payment record & invoice entry
    const [paymentRecord] = await db
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
      await db.insert(invoices).values({
        orderId: newOrder.id,
        paymentId: paymentRecord.id,
      });
    }

    // 7. Clear active cart if cartId or userId is provided
    try {
      if (cartId) {
        await db
          .update(carts)
          .set({ status: 'converted', updatedAt: new Date() })
          .where(eq(carts.id, cartId));

        await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
      } else if (userId) {
        const [activeCart] = await db
          .select({ id: carts.id })
          .from(carts)
          .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
          .limit(1);

        if (activeCart) {
          await db
            .update(carts)
            .set({ status: 'converted', updatedAt: new Date() })
            .where(eq(carts.id, activeCart.id));

          await db.delete(cartItems).where(eq(cartItems.cartId, activeCart.id));
        }
      }
    } catch (err) {
      console.error('Error converting/clearing cart after order:', err);
    }

    // 8. Fetch complete created order details
    return this.getOrderById(newOrder.id);
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
