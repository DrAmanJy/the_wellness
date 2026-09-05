import { ProductListDTO, ProductDetailDTO, ProductMutationDTO, ProductImageDTO } from '../product';
import { createProcedure } from './core';

export const getPublicProductsProcedure = createProcedure<
  { page?: number; limit?: number },
  { items: ProductListDTO[] }
>({
  name: 'getPublicProducts',
  method: 'GET',
  path: '/',
  description: 'Retrieve paginated public product list',
});

export const getProductByIdProcedure = createProcedure<{ id: string }, ProductDetailDTO>({
  name: 'getProductById',
  method: 'GET',
  path: '/:id',
  description: 'Retrieve detailed product information by ID',
});

export const createProductProcedure = createProcedure<Record<string, unknown>, ProductMutationDTO>({
  name: 'createProduct',
  method: 'POST',
  path: '/',
  authRequired: true,
  adminOnly: true,
  description: 'Create a new product (Admin)',
});

export const updateProductProcedure = createProcedure<
  { id: string } & Record<string, unknown>,
  ProductMutationDTO
>({
  name: 'updateProduct',
  method: 'PATCH',
  path: '/:id',
  authRequired: true,
  adminOnly: true,
  description: 'Update existing product metadata and inventory (Admin)',
});

export const deleteProductProcedure = createProcedure<{ id: string }, ProductMutationDTO>({
  name: 'deleteProduct',
  method: 'DELETE',
  path: '/:id',
  authRequired: true,
  adminOnly: true,
  description: 'Delete a product by ID (Admin)',
});

export const getProductImagesProcedure = createProcedure<{ id: string }, ProductImageDTO[]>({
  name: 'getProductImages',
  method: 'GET',
  path: '/:id/images',
  description: 'Retrieve ordered list of images for a product',
});

export const addProductImagesProcedure = createProcedure<
  { id: string; images: Array<{ url: string; altText?: string; isPrimary?: boolean }> },
  ProductImageDTO[]
>({
  name: 'addProductImages',
  method: 'POST',
  path: '/:id/images',
  authRequired: true,
  adminOnly: true,
  description: 'Add new image(s) to a product (Admin)',
});

export const reorderProductImagesProcedure = createProcedure<
  { id: string; imageOrders: Array<{ id: string; displayOrder: number }> },
  ProductImageDTO[]
>({
  name: 'reorderProductImages',
  method: 'PUT',
  path: '/:id/images/reorder',
  authRequired: true,
  adminOnly: true,
  description: 'Reorder product images (Admin)',
});

export const deleteProductImageProcedure = createProcedure<
  { id: string; imageId: string },
  { success: boolean }
>({
  name: 'deleteProductImage',
  method: 'DELETE',
  path: '/:id/images/:imageId',
  authRequired: true,
  adminOnly: true,
  description: 'Delete a product image by image ID (Admin)',
});
