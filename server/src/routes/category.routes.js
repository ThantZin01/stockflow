import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  categoryBodySchema,
  categoryIdParamSchema,
  listCategoriesQuerySchema,
} from '../validators/category.validator.js';

export const categoryRouter = Router();

categoryRouter.use(authenticate);

categoryRouter.get(
  '/',
  validate({ query: listCategoriesQuerySchema }),
  categoryController.listCategories
);

categoryRouter.post('/', validate({ body: categoryBodySchema }), categoryController.createCategory);

categoryRouter.put(
  '/:id',
  validate({ params: categoryIdParamSchema, body: categoryBodySchema }),
  categoryController.updateCategory
);

categoryRouter.delete(
  '/:id',
  authorize('admin'),
  validate({ params: categoryIdParamSchema }),
  categoryController.deleteCategory
);
