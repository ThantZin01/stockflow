import * as productService from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.listProducts(req.query);
  return sendSuccess(res, products, 200, meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  const result = await productService.getProductById(req.params.id);
  return sendSuccess(res, result, 200);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);
  return sendSuccess(res, product, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, product, 200);
});

export const archiveProduct = asyncHandler(async (req, res) => {
  const product = await productService.toggleArchiveProduct(req.params.id, req.body?.isArchived);
  return sendSuccess(res, product, 200);
});
