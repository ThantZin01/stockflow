import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listSuppliersQuerySchema,
  supplierBodySchema,
  supplierIdParamSchema,
} from '../validators/supplier.validator.js';

export const supplierRouter = Router();

supplierRouter.use(authenticate);

supplierRouter.get(
  '/',
  validate({ query: listSuppliersQuerySchema }),
  supplierController.listSuppliers
);

supplierRouter.get(
  '/:id',
  validate({ params: supplierIdParamSchema }),
  supplierController.getSupplier
);

supplierRouter.post('/', validate({ body: supplierBodySchema }), supplierController.createSupplier);

supplierRouter.put(
  '/:id',
  validate({ params: supplierIdParamSchema, body: supplierBodySchema }),
  supplierController.updateSupplier
);

supplierRouter.delete(
  '/:id',
  authorize('admin'),
  validate({ params: supplierIdParamSchema }),
  supplierController.deleteSupplier
);
