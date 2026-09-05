import { PromotionDTO } from '../promotion';
import { createProcedure } from './core';

export const getPromotionsProcedure = createProcedure<undefined, PromotionDTO[]>({
  name: 'getPromotions',
  method: 'GET',
  path: '/',
  description: 'Retrieve list of promotions/banners',
});

export const getPromotionByIdProcedure = createProcedure<{ id: string }, PromotionDTO>({
  name: 'getPromotionById',
  method: 'GET',
  path: '/:id',
  description: 'Retrieve promotion details by ID',
});

export const createPromotionProcedure = createProcedure<Record<string, unknown>, PromotionDTO>({
  name: 'createPromotion',
  method: 'POST',
  path: '/',
  authRequired: true,
  description: 'Create a new promotion banner',
});

export const updatePromotionProcedure = createProcedure<
  { id: string } & Record<string, unknown>,
  PromotionDTO
>({
  name: 'updatePromotion',
  method: 'PUT',
  path: '/:id',
  authRequired: true,
  description: 'Update a promotion banner',
});

export const deletePromotionProcedure = createProcedure<{ id: string }, { success: boolean }>({
  name: 'deletePromotion',
  method: 'DELETE',
  path: '/:id',
  authRequired: true,
  description: 'Delete a promotion banner by ID',
});

export const togglePromotionStatusProcedure = createProcedure<{ id: string }, PromotionDTO>({
  name: 'togglePromotionStatus',
  method: 'PATCH',
  path: '/:id/status',
  authRequired: true,
  description: 'Toggle active status of a promotion banner',
});
