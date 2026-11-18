import * as categoryService from '../services/category.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listCategories = asyncHandler(async (req, res) => {
  const { categories, meta } = await categoryService.listCategories(req.query);
  return sendSuccess(res, categories, 200, meta);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return sendSuccess(res, category, 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return sendSuccess(res, category, 200);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const deleted = await categoryService.deleteCategory(req.params.id);
  return sendSuccess(res, deleted, 200);
});
