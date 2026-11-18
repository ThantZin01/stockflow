import { Product } from '../models/Product.model.js';
import { PurchaseOrder } from '../models/PurchaseOrder.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { ApiError } from '../utils/ApiError.js';

export const listSuppliers = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [suppliers, total] = await Promise.all([
    Supplier.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Supplier.countDocuments(),
  ]);

  return {
    suppliers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getSupplierById = async (id) => {
  const [supplier, products] = await Promise.all([
    Supplier.findById(id).lean(),
    Product.find({ supplier: id, isArchived: false })
      .populate('category', 'name')
      .sort({ name: 1 })
      .lean(),
  ]);

  if (!supplier) {
    throw new ApiError(404, 'Supplier not found');
  }

  return { supplier, products };
};

export const createSupplier = async (payload) => {
  const supplier = await Supplier.create(payload);
  return supplier.toObject();
};

export const updateSupplier = async (id, payload) => {
  const supplier = await Supplier.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!supplier) {
    throw new ApiError(404, 'Supplier not found');
  }

  return supplier;
};

export const deleteSupplier = async (id) => {
  const [inUse, referencedByOrder] = await Promise.all([
    Product.exists({ supplier: id }),
    PurchaseOrder.exists({ supplier: id }),
  ]);
  if (inUse) {
    throw new ApiError(409, 'Cannot delete supplier because products are assigned to it');
  }
  if (referencedByOrder) {
    throw new ApiError(409, 'Cannot delete supplier because purchase orders reference it');
  }

  const deleted = await Supplier.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(404, 'Supplier not found');
  }

  return deleted;
};
