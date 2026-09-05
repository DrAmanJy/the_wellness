import { CategoryListDTO, CategoryDetailDTO, CategoryMutationDTO } from '../category';
import { createProcedure } from './core';

export const getPublicCategoriesProcedure = createProcedure<undefined, CategoryListDTO[]>({
  name: 'getPublicCategories',
  method: 'GET',
  path: '/',
  description: 'Retrieve list of public categories',
});

export const getCategoryBySlugProcedure = createProcedure<{ slug: string }, CategoryDetailDTO>({
  name: 'getCategoryBySlug',
  method: 'GET',
  path: '/:slug',
  description: 'Retrieve category details by slug',
});

export const createCategoryProcedure = createProcedure<
  Record<string, unknown>,
  CategoryMutationDTO
>({
  name: 'createCategory',
  method: 'POST',
  path: '/',
  authRequired: true,
  description: 'Create a new category',
});

export const updateCategoryProcedure = createProcedure<
  { id: string } & Record<string, unknown>,
  CategoryMutationDTO
>({
  name: 'updateCategory',
  method: 'PATCH',
  path: '/:id',
  authRequired: true,
  description: 'Update category details',
});

export const deleteCategoryProcedure = createProcedure<{ id: string }, CategoryMutationDTO>({
  name: 'deleteCategory',
  method: 'DELETE',
  path: '/:id',
  authRequired: true,
  description: 'Delete a category by ID',
});
