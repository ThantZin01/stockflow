import * as reportService from '../services/report.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getSummary = asyncHandler(async (_req, res) => {
  const summary = await reportService.getSummary();
  return sendSuccess(res, summary, 200);
});

export const getSales = asyncHandler(async (req, res) => {
  const sales = await reportService.getSalesByDate(req.query);
  return sendSuccess(res, sales, 200);
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const topProducts = await reportService.getTopProducts(req.query);
  return sendSuccess(res, topProducts, 200);
});

export const getStockValue = asyncHandler(async (_req, res) => {
  const stockValue = await reportService.getStockValue();
  return sendSuccess(res, stockValue, 200);
});
