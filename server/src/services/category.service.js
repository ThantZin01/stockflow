import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';

export const listCategories = async ({ page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments(),
  ]);

  return {
    categories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const createCategory = async ({ name, description }) => {
  const existing = await Category.findOne({
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  }).lean();

  if (existing) {
    throw new ApiError(409, `Category '${name}' already exists`);
  }

  const category = await Category.create({ name, description });
  return category.toObject();
};

export const updateCategory = async (id, { name, description }) => {
  const duplicate = await Category.findOne({
    _id: { $ne: id },
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  }).lean();

  if (duplicate) {
    throw new ApiError(409, `Category '${name}' already exists`);
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { name, description },
    { new: true, runValidators: true }
  ).lean();

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  return category;
};

/**
 * Deletes a category only if no product references it.
 *
 * Note (MongoDB Referential Integrity): Unlike PostgreSQL foreign keys with
 * `ON DELETE RESTRICT`, MongoDB does not automatically block deleting a
 * referenced document. We explicitly check `Product.exists({ category: id })`
 * before deleting.
 */
export const deleteCategory = async (id) => {
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    throw new ApiError(409, 'Cannot delete category because products are assigned to it');
  }

  const deleted = await Category.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(404, 'Category not found');
  }

  return deleted;
};

