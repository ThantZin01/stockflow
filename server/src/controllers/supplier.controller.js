import * as supplierService from '../services/supplier.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listSuppliers = asyncHandler(async (req, res) => {
  const { suppliers, meta } = await supplierService.listSuppliers(req.query);
  return sendSuccess(res, suppliers, 200, meta);
});

export const getSupplier = asyncHandler(async (req, res) => {
  const result = await supplierService.getSupplierById(req.params.id);
  return sendSuccess(res, result, 200);
});

export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body);
  return sendSuccess(res, supplier, 201);
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  return sendSuccess(res, supplier, 200);
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const deleted = await supplierService.deleteSupplier(req.params.id);
  return sendSuccess(res, deleted, 200);
});

