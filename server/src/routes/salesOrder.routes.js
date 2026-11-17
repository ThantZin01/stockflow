import { Router } from 'express';
import * as salesOrderController from '../controllers/salesOrder.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createSalesOrderSchema,
  listSalesOrdersQuerySchema,
  salesOrderIdParamSchema,
} from '../validators/salesOrder.validator.js';

export const salesOrderRouter = Router();

salesOrderRouter.use(authenticate);

salesOrderRouter.get(
  '/',
  validate({ query: listSalesOrdersQuerySchema }),
  salesOrderController.listSalesOrders
);

salesOrderRouter.get(
  '/:id',
  validate({ params: salesOrderIdParamSchema }),
  salesOrderController.getSalesOrder
);

salesOrderRouter.post(
  '/',
  validate({ body: createSalesOrderSchema }),
  salesOrderController.createSalesOrder
);

salesOrderRouter.patch(
  '/:id/confirm',
  validate({ params: salesOrderIdParamSchema }),
  salesOrderController.confirmSalesOrder
);

salesOrderRouter.patch(
  '/:id/complete',
  validate({ params: salesOrderIdParamSchema }),
  salesOrderController.completeSalesOrder
);

salesOrderRouter.patch(
  '/:id/cancel',
  validate({ params: salesOrderIdParamSchema }),
  salesOrderController.cancelSalesOrder
);
