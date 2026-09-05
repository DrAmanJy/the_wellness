import { CartDTO, AddCartItemDTO, UpdateCartItemDTO } from '../cart';
import { createProcedure } from './core';

export const getCartProcedure = createProcedure<undefined, CartDTO>({
  name: 'getCart',
  method: 'GET',
  path: '/',
  description: 'Retrieve current user or session cart',
});

export const addCartItemProcedure = createProcedure<AddCartItemDTO, CartDTO>({
  name: 'addCartItem',
  method: 'POST',
  path: '/items',
  description: 'Add product item to cart',
});

export const updateCartItemProcedure = createProcedure<{ id: string } & UpdateCartItemDTO, CartDTO>(
  {
    name: 'updateCartItem',
    method: 'PATCH',
    path: '/items/:id',
    description: 'Update cart item quantity',
  },
);

export const removeCartItemProcedure = createProcedure<{ id: string }, CartDTO>({
  name: 'removeCartItem',
  method: 'DELETE',
  path: '/items/:id',
  description: 'Remove item from cart',
});
