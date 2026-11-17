import * as stockService from '../services/stock.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listLowStock = asyncHandler(async (req, res) => {
  const { products, meta } = await stockService.listLowStock(req.query);
  return sendSuccess(res, products, 200, meta);
});

export const listMovements = asyncHandler(async (req, res) => {
  const { movements, meta } = await stockService.listMovements(req.query);
  return sendSuccess(res, movements, 200, meta);
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, quantityChange, reason } = req.body;
  const result = await stockService.adjustStock({
    productId,
    quantityChange,
    reason,
    userId: req.user._id,
  });
  return sendSuccess(res, result, 201);
});
