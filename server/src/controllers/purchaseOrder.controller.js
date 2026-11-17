import * as purchaseOrderService from '../services/purchaseOrder.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await purchaseOrderService.listPurchaseOrders(req.query);
  return sendSuccess(res, orders, 200, meta);
});

export const getPurchaseOrder = asyncHandler(async (req, res) => {
  const order = await purchaseOrderService.getPurchaseOrderById(req.params.id);
  return sendSuccess(res, order, 200);
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const order = await purchaseOrderService.createPurchaseOrder(req.body, req.user._id);
  return sendSuccess(res, order, 201);
});

export const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await purchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
  return sendSuccess(res, order, 200);
});

export const orderPurchaseOrder = asyncHandler(async (req, res) => {
  const order = await purchaseOrderService.markAsOrdered(req.params.id);
  return sendSuccess(res, order, 200);
});

export const receivePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await purchaseOrderService.receivePurchaseOrder(req.params.id, req.user._id);
  return sendSuccess(res, order, 200);
});
