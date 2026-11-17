import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { salesReportQuerySchema, topProductsQuerySchema } from '../validators/report.validator.js';

export const reportRouter = Router();

reportRouter.use(authenticate);

reportRouter.get('/summary', reportController.getSummary);
reportRouter.get('/sales', validate({ query: salesReportQuerySchema }), reportController.getSales);
reportRouter.get(
  '/top-products',
  validate({ query: topProductsQuerySchema }),
  reportController.getTopProducts
);
reportRouter.get('/stock-value', reportController.getStockValue);
