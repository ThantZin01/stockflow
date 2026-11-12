import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  archiveProductSchema,
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from '../validators/product.validator.js';

export const productRouter = Router();

productRouter.use(authenticate);

productRouter.get(
  '/',
  validate({ query: listProductsQuerySchema }),
  productController.listProducts
);

productRouter.get('/:id', validate({ params: productIdParamSchema }), productController.getProduct);

productRouter.post('/', validate({ body: createProductSchema }), productController.createProduct);

productRouter.put(
  '/:id',
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  productController.updateProduct
);

productRouter.patch(
  '/:id/archive',
  validate({ params: productIdParamSchema, body: archiveProductSchema }),
  productController.archiveProduct
);
