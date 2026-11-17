import * as salesOrderService from '../services/salesOrder.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listSalesOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await salesOrderService.listSalesOrders(req.query);
  return sendSuccess(res, orders, 200, meta);
});

export const getSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.getSalesOrderById(req.params.id);
  return sendSuccess(res, order, 200);
});

export const createSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.createSalesOrder(req.body, req.user._id);
  return sendSuccess(res, order, 201);
});

export const confirmSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.confirmSalesOrder(req.params.id, req.user._id);
  return sendSuccess(res, order, 200);
});

export const completeSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.completeSalesOrder(req.params.id);
  return sendSuccess(res, order, 200);
});

export const cancelSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.cancelSalesOrder(req.params.id, req.user._id);
  return sendSuccess(res, order, 200);
});
