import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { PurchaseOrder } from '../models/PurchaseOrder.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import * as stockService from './stock.service.js';

const buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

/**
 * Resolves supplier and product references, builds immutable item snapshots,
 * and computes the order total on the server.
 */
const prepareOrderData = async (supplierId, rawItems) => {
  const supplierExists = await Supplier.exists({ _id: supplierId });
  if (!supplierExists) {
    throw new ApiError(404, 'Selected supplier does not exist');
  }

  const productIds = [...new Set(rawItems.map((item) => item.product))];
  const products = await Product.find({ _id: { $in: productIds } })
    .select('name sku isArchived')
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let total = 0;
  const items = rawItems.map((item) => {
    const product = productMap.get(item.product);
    if (!product) {
      throw new ApiError(404, `Product not found: ${item.product}`);
    }
    if (product.isArchived) {
      throw new ApiError(409, `Cannot add archived product ${product.sku} to a purchase order`);
    }

    total += item.quantity * item.unitCost;
    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitCost: item.unitCost,
    };
  });

  return { items, total: Number(total.toFixed(2)) };
};

export const listPurchaseOrders = async ({ status, supplier, page = 1, limit = 10 }) => {
  const filter = {};
  if (status) filter.status = status;
  if (supplier) filter.supplier = supplier;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate('supplier', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PurchaseOrder.countDocuments(filter),
  ]);

  return { orders, meta: buildMeta(page, limit, total) };
};

export const getPurchaseOrderById = async (id) => {
  const order = await PurchaseOrder.findById(id)
    .populate('supplier', 'name contactName email phone')
    .populate('createdBy', 'name email')
    .lean();

  if (!order) {
    throw new ApiError(404, 'Purchase order not found');
  }

  return order;
};

export const createPurchaseOrder = async ({ supplier, items: rawItems }, userId) => {
  const { items, total } = await prepareOrderData(supplier, rawItems);
  const poNumber = await generateOrderNumber(PurchaseOrder, 'poNumber', 'PO');

  const created = await PurchaseOrder.create({
    poNumber,
    supplier,
    items,
    total,
    createdBy: userId,
  });

  return getPurchaseOrderById(created._id);
};

export const updatePurchaseOrder = async (id, { supplier, items: rawItems }) => {
  const existing = await PurchaseOrder.findById(id).select('status').lean();
  if (!existing) {
    throw new ApiError(404, 'Purchase order not found');
  }
  if (existing.status !== 'draft') {
    throw new ApiError(409, 'Only draft purchase orders can be edited');
  }

  const { items, total } = await prepareOrderData(supplier, rawItems);

  const updated = await PurchaseOrder.findOneAndUpdate(
    { _id: id, status: 'draft' },
    { supplier, items, total },
    { new: true, runValidators: true }
  )
    .populate('supplier', 'name contactName email phone')
    .populate('createdBy', 'name email')
    .lean();

  if (!updated) {
    throw new ApiError(409, 'Only draft purchase orders can be edited');
  }

  return updated;
};

export const markAsOrdered = async (id) => {
  const updated = await PurchaseOrder.findOneAndUpdate(
    { _id: id, status: 'draft' },
    { status: 'ordered', orderedAt: new Date() },
    { new: true }
  )
    .populate('supplier', 'name contactName email phone')
    .populate('createdBy', 'name email')
    .lean();

  if (!updated) {
    const exists = await PurchaseOrder.findById(id).select('status').lean();
    if (!exists) {
      throw new ApiError(404, 'Purchase order not found');
    }
    throw new ApiError(409, `Cannot mark purchase order as ordered from '${exists.status}'`);
  }

  return updated;
};

/**
 * Marks an `ordered` purchase order as `received` and increases stock for all
 * line items inside a MongoDB transaction so partial receives cannot occur.
 */
export const receivePurchaseOrder = async (id, userId) => {
  const session = await mongoose.startSession();
  let receivedOrderId = null;

  try {
    await session.withTransaction(async () => {
      const po = await PurchaseOrder.findOneAndUpdate(
        { _id: id, status: 'ordered' },
        { status: 'received', receivedAt: new Date() },
        { new: true, session }
      );

      if (!po) {
        const exists = await PurchaseOrder.findById(id).select('status').session(session).lean();
        if (!exists) {
          throw new ApiError(404, 'Purchase order not found');
        }
        const message =
          exists.status === 'received'
            ? 'Purchase order has already been received'
            : 'Purchase order must be ordered before it can be received';
        throw new ApiError(409, message);
      }

      for (const item of po.items) {
        await stockService.increaseStock(
          {
            productId: item.product,
            quantity: item.quantity,
            reason: `Received from ${po.poNumber}`,
            refType: 'PURCHASE_ORDER',
            refId: po._id,
            userId,
          },
          session
        );
      }

      receivedOrderId = po._id;
    });
  } finally {
    await session.endSession();
  }

  return getPurchaseOrderById(receivedOrderId);
};
