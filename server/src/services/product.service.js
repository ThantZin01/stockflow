import mongoose from 'mongoose';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { StockMovement } from '../models/StockMovement.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { ApiError } from '../utils/ApiError.js';
import * as stockService from './stock.service.js';

const SORT_MAP = {
  newest: { createdAt: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  price_asc: { salePrice: 1 },
  price_desc: { salePrice: -1 },
  stock_asc: { quantity: 1 },
  stock_desc: { quantity: -1 },
};

export const listProducts = async ({
  search = '',
  category = '',
  lowStock = '',
  includeArchived = 'false',
  sort = 'newest',
  page = 1,
  limit = 10,
}) => {
  const filter = {};

  if (includeArchived !== 'true') {
    filter.isArchived = false;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { sku: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (lowStock === 'true') {
    // `$expr` allows comparing two fields on the same document (like SQL `WHERE quantity <= reorder_level`).
    filter.$expr = { $lte: ['$quantity', '$reorderLevel'] };
  }

  const skip = (page - 1) * limit;
  const sortOption = SORT_MAP[sort] || SORT_MAP.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getProductById = async (id) => {
  const [product, movements] = await Promise.all([
    Product.findById(id)
      .populate('category', 'name')
      .populate('supplier', 'name contactName phone email')
      .lean(),
    StockMovement.find({ product: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return { product, movements };
};

export const createProduct = async (payload, userId) => {
  const {
    sku,
    name,
    description,
    category,
    supplier,
    costPrice,
    salePrice,
    reorderLevel,
    initialQuantity = 0,
  } = payload;

  const [existingSku, categoryExists, supplierExists] = await Promise.all([
    Product.findOne({ sku: sku.toUpperCase() }).lean(),
    Category.exists({ _id: category }),
    Supplier.exists({ _id: supplier }),
  ]);

  if (existingSku) {
    throw new ApiError(409, `Product with SKU '${sku.toUpperCase()}' already exists`);
  }
  if (!categoryExists) {
    throw new ApiError(404, 'Selected category does not exist');
  }
  if (!supplierExists) {
    throw new ApiError(404, 'Selected supplier does not exist');
  }

  // Quantity stays 0 on insert. Opening stock goes through stock.service so the
  // movement is written in the same transaction as the increment.
  const productFields = {
    sku: sku.toUpperCase(),
    name,
    description,
    category,
    supplier,
    costPrice,
    salePrice,
    reorderLevel,
  };

  let createdId;

  if (initialQuantity > 0) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const [created] = await Product.create([productFields], { session });
        createdId = created._id;
        await stockService.increaseStock(
          {
            productId: created._id,
            quantity: initialQuantity,
            reason: 'Initial stock on product creation',
            refType: 'MANUAL',
            userId,
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }
  } else {
    const created = await Product.create(productFields);
    createdId = created._id;
  }

  return Product.findById(createdId)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();
};

export const updateProduct = async (id, payload) => {
  const { sku, name, description, category, supplier, costPrice, salePrice, reorderLevel } =
    payload;

  const [duplicateSku, categoryExists, supplierExists] = await Promise.all([
    Product.findOne({ _id: { $ne: id }, sku: sku.toUpperCase() }).lean(),
    Category.exists({ _id: category }),
    Supplier.exists({ _id: supplier }),
  ]);

  if (duplicateSku) {
    throw new ApiError(409, `Product with SKU '${sku.toUpperCase()}' already exists`);
  }
  if (!categoryExists) {
    throw new ApiError(404, 'Selected category does not exist');
  }
  if (!supplierExists) {
    throw new ApiError(404, 'Selected supplier does not exist');
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    {
      sku: sku.toUpperCase(),
      name,
      description,
      category,
      supplier,
      costPrice,
      salePrice,
      reorderLevel,
    },
    { new: true, runValidators: true }
  )
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();

  if (!updated) {
    throw new ApiError(404, 'Product not found');
  }

  return updated;
};

export const toggleArchiveProduct = async (id, isArchived) => {
  const current = await Product.findById(id).select('isArchived').lean();
  if (!current) {
    throw new ApiError(404, 'Product not found');
  }

  const nextArchived = typeof isArchived === 'boolean' ? isArchived : !current.isArchived;

  return Product.findByIdAndUpdate(id, { isArchived: nextArchived }, { new: true })
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();
};
