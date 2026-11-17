import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { SalesOrder } from '../models/SalesOrder.model.js';
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
 * Merges duplicate product lines and resolves authoritative name, SKU, and
 * `salePrice` from the database so client prices/totals are never trusted.
 */
const prepareOrderItems = async (rawItems) => {
  const merged = new Map();
  for (const item of rawItems) {
    merged.set(item.product, (merged.get(item.product) || 0) + item.quantity);
  }

  const productIds = [...merged.keys()];
  const products = await Product.find({ _id: { $in: productIds } })
    .select('name sku salePrice isArchived')
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let total = 0;
  const items = productIds.map((productId) => {
    const product = productMap.get(productId);
    if (!product) {
      throw new ApiError(404, `Product not found: ${productId}`);
    }
    if (product.isArchived) {
      throw new ApiError(409, `Cannot add archived product ${product.sku} to a sales order`);
    }

    const quantity = merged.get(productId);
    total += quantity * product.salePrice;

    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPrice: product.salePrice,
    };
  });

  return { items, total: Number(total.toFixed(2)) };
};

export const listSalesOrders = async ({ status, search = '', page = 1, limit = 10 }) => {
  const filter = {};
  if (status) filter.status = status;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { orderNumber: { $regex: escaped, $options: 'i' } },
      { customerName: { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    SalesOrder.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SalesOrder.countDocuments(filter),
  ]);

  return { orders, meta: buildMeta(page, limit, total) };
};

export const getSalesOrderById = async (id) => {
  const order = await SalesOrder.findById(id).populate('createdBy', 'name email').lean();

  if (!order) {
    throw new ApiError(404, 'Sales order not found');
  }

  return order;
};

export const createSalesOrder = async (
  { customerName, customerPhone, items: rawItems },
  userId
) => {
  const { items, total } = await prepareOrderItems(rawItems);
  const orderNumber = await generateOrderNumber(SalesOrder, 'orderNumber', 'SO');

  const created = await SalesOrder.create({
    orderNumber,
    customerName,
    customerPhone,
    items,
    total,
    createdBy: userId,
  });

  return getSalesOrderById(created._id);
};

/**
 * Transitions a `pending` sales order to `confirmed` and deducts stock for all
 * items inside a MongoDB transaction. If any item lacks stock, the transaction
 * rolls back so neither stock nor order status changes.
 */
export const confirmSalesOrder = async (id, userId) => {
  const session = await mongoose.startSession();
  let confirmedOrderId = null;

  try {
    await session.withTransaction(async () => {
      const order = await SalesOrder.findOneAndUpdate(
        { _id: id, status: 'pending' },
        { status: 'confirmed' },
        { new: true, session }
      );

      if (!order) {
        const exists = await SalesOrder.findById(id).select('status').session(session).lean();
        if (!exists) {
          throw new ApiError(404, 'Sales order not found');
        }
        throw new ApiError(409, `Cannot confirm sales order from '${exists.status}'`);
      }

      for (const item of order.items) {
        await stockService.decreaseStock(
          {
            productId: item.product,
            quantity: item.quantity,
            reason: `Confirmed ${order.orderNumber}`,
            refType: 'SALES_ORDER',
            refId: order._id,
            userId,
          },
          session
        );
      }

      confirmedOrderId = order._id;
    });
  } finally {
    await session.endSession();
  }

  return getSalesOrderById(confirmedOrderId);
};

export const completeSalesOrder = async (id) => {
  const updated = await SalesOrder.findOneAndUpdate(
    { _id: id, status: 'confirmed' },
    { status: 'completed' },
    { new: true }
  )
    .populate('createdBy', 'name email')
    .lean();

  if (!updated) {
    const exists = await SalesOrder.findById(id).select('status').lean();
    if (!exists) {
      throw new ApiError(404, 'Sales order not found');
    }
    throw new ApiError(409, `Cannot complete sales order from '${exists.status}'`);
  }

  return updated;
};

/**
 * Cancels a `pending` or `confirmed` sales order. If it was `confirmed`, stock
 * for all line items is restored atomically inside the same transaction.
 */
export const cancelSalesOrder = async (id, userId) => {
  const session = await mongoose.startSession();
  let cancelledOrderId = null;

  try {
    await session.withTransaction(async () => {
      // `new: false` returns the pre-update document so we know whether stock had been deducted.
      const previous = await SalesOrder.findOneAndUpdate(
        { _id: id, status: { $in: ['pending', 'confirmed'] } },
        { status: 'cancelled' },
        { new: false, session }
      );

      if (!previous) {
        const exists = await SalesOrder.findById(id).select('status').session(session).lean();
        if (!exists) {
          throw new ApiError(404, 'Sales order not found');
        }
        throw new ApiError(409, `Cannot cancel a '${exists.status}' sales order`);
      }

      if (previous.status === 'confirmed') {
        for (const item of previous.items) {
          await stockService.increaseStock(
            {
              productId: item.product,
              quantity: item.quantity,
              reason: `Cancelled ${previous.orderNumber}`,
              refType: 'SALES_ORDER',
              refId: previous._id,
              userId,
            },
            session
          );
        }
      }

      cancelledOrderId = previous._id;
    });
  } finally {
    await session.endSession();
  }

  return getSalesOrderById(cancelledOrderId);
};
