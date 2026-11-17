import { Router } from 'express';
import * as stockController from '../controllers/stock.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adjustStockSchema,
  listMovementsQuerySchema,
  lowStockQuerySchema,
} from '../validators/stock.validator.js';

export const stockRouter = Router();

stockRouter.use(authenticate);

stockRouter.get('/low', validate({ query: lowStockQuerySchema }), stockController.listLowStock);

stockRouter.get(
  '/movements',
  validate({ query: listMovementsQuerySchema }),
  stockController.listMovements
);

stockRouter.post('/adjust', validate({ body: adjustStockSchema }), stockController.adjustStock);
