import { Router } from 'express';
import * as purchaseOrderController from '../controllers/purchaseOrder.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createPurchaseOrderSchema,
  listPurchaseOrdersQuerySchema,
  purchaseOrderIdParamSchema,
  updatePurchaseOrderSchema,
} from '../validators/purchaseOrder.validator.js';

export const purchaseOrderRouter = Router();

purchaseOrderRouter.use(authenticate);

purchaseOrderRouter.get(
  '/',
  validate({ query: listPurchaseOrdersQuerySchema }),
  purchaseOrderController.listPurchaseOrders
);

purchaseOrderRouter.get(
  '/:id',
  validate({ params: purchaseOrderIdParamSchema }),
  purchaseOrderController.getPurchaseOrder
);

purchaseOrderRouter.post(
  '/',
  validate({ body: createPurchaseOrderSchema }),
  purchaseOrderController.createPurchaseOrder
);

purchaseOrderRouter.put(
  '/:id',
  validate({ params: purchaseOrderIdParamSchema, body: updatePurchaseOrderSchema }),
  purchaseOrderController.updatePurchaseOrder
);

purchaseOrderRouter.patch(
  '/:id/order',
  validate({ params: purchaseOrderIdParamSchema }),
  purchaseOrderController.orderPurchaseOrder
);

purchaseOrderRouter.patch(
  '/:id/receive',
  validate({ params: purchaseOrderIdParamSchema }),
  purchaseOrderController.receivePurchaseOrder
);
