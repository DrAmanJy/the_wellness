import { Router } from 'express';

import {
  bindProcedure,
  getPublicProductsProcedure,
  getProductByIdProcedure,
  createProductProcedure,
  updateProductProcedure,
  deleteProductProcedure,
  getProductImagesProcedure,
  addProductImagesProcedure,
  reorderProductImagesProcedure,
  deleteProductImageProcedure,
} from '@wellness/contracts';
import { asyncHandler } from '@wellness/utils';

import { productController } from '../controllers/product.controller';

const router = Router();

bindProcedure(
  router,
  getPublicProductsProcedure,
  asyncHandler((req, res, next) => productController.getPublicProducts(req, res, next)),
);

bindProcedure(
  router,
  getProductImagesProcedure,
  asyncHandler((req, res, next) => productController.getProductImages(req, res, next)),
);

bindProcedure(
  router,
  getProductByIdProcedure,
  asyncHandler((req, res, next) => productController.getProductById(req, res, next)),
);

bindProcedure(
  router,
  createProductProcedure,
  asyncHandler((req, res, next) => productController.createProduct(req, res, next)),
);

bindProcedure(
  router,
  updateProductProcedure,
  asyncHandler((req, res, next) => productController.updateProduct(req, res, next)),
);

bindProcedure(
  router,
  deleteProductProcedure,
  asyncHandler((req, res, next) => productController.deleteProduct(req, res, next)),
);

bindProcedure(
  router,
  addProductImagesProcedure,
  asyncHandler((req, res, next) => productController.addProductImages(req, res, next)),
);

bindProcedure(
  router,
  reorderProductImagesProcedure,
  asyncHandler((req, res, next) => productController.reorderProductImages(req, res, next)),
);

bindProcedure(
  router,
  deleteProductImageProcedure,
  asyncHandler((req, res, next) => productController.deleteProductImage(req, res, next)),
);

export default router;
