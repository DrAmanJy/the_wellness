import { OrderDTO, CreateOrderDTO } from '../order';
import { createProcedure } from './core';

export const createOrderProcedure = createProcedure<CreateOrderDTO, OrderDTO>({
  name: 'createOrder',
  method: 'POST',
  path: '/',
  authRequired: true,
  description: 'Create order and process checkout',
});

export const getOrdersProcedure = createProcedure<undefined, OrderDTO[]>({
  name: 'getOrders',
  method: 'GET',
  path: '/',
  description: 'Retrieve user order history',
});

export const getOrderByIdProcedure = createProcedure<{ id: string }, OrderDTO>({
  name: 'getOrderById',
  method: 'GET',
  path: '/:id',
  authRequired: true,
  description: 'Retrieve order details by ID',
});

export const updateOrderStatusProcedure = createProcedure<{ id: string; status: string }, OrderDTO>(
  {
    name: 'updateOrderStatus',
    method: 'PATCH',
    path: '/:id/status',
    description: 'Update order status',
  },
);
