import { Product } from '../models/Product.model.js';
import { StockMovement } from '../models/StockMovement.model.js';
import { ApiError } from '../utils/ApiError.js';
import { runInTransaction } from '../utils/transaction.js';
import { parseZonedDate } from '../utils/zonedDate.js';

/**
 * Records an immutable StockMovement entry.
 */
export const createMovement = async (
  { productId, type, quantity, reason, refType = 'MANUAL', refId = null, userId },
  session = null
) => {
  const [movement] = await StockMovement.create(
    [
      {
        product: productId,
        type,
        quantity,
        reason,
        refType,
        refId,
        createdBy: userId,
      },
    ],
    session ? { session } : undefined
  );
  return movement;
};

/**
 * Atomically increases a product's stock and logs an `IN` StockMovement.
 *
 * Architectural Rule: ONLY `stock.service.js` may write to `Product.quantity`.
 */
export const increaseStock = async (
  { productId, quantity, reason, refType = 'MANUAL', refId = null, userId },
  session = null
) => {
  if (quantity <= 0) {
    throw new ApiError(400, 'Increase quantity must be greater than 0');
  }

  return runInTransaction(session, async (activeSession) => {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { quantity } },
      { new: true, session: activeSession }
    );

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    await createMovement(
      {
        productId,
        type: 'IN',
        quantity,
        reason,
        refType,
        refId,
        userId,
      },
      activeSession
    );

    return product;
  });
};

/**
 * Atomically decreases a product's stock using a conditional `$gte` filter so
 * quantity can never drop below 0, even under concurrent requests.
 */
export const decreaseStock = async (
  { productId, quantity, reason, refType = 'MANUAL', refId = null, userId },
  session = null
) => {
  if (quantity <= 0) {
    throw new ApiError(400, 'Decrease quantity must be greater than 0');
  }

  return runInTransaction(session, async (activeSession) => {
    const product = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true, session: activeSession }
    );

    if (!product) {
      const exists = await Product.findById(productId)
        .select('sku name quantity')
        .session(activeSession)
        .lean();
      if (!exists) {
        throw new ApiError(404, 'Product not found');
      }
      throw new ApiError(
        409,
        `Insufficient stock for ${exists.sku} (available: ${exists.quantity}, requested: ${quantity})`
      );
    }

    await createMovement(
      {
        productId,
        type: 'OUT',
        quantity: -quantity,
        reason,
        refType,
        refId,
        userId,
      },
      activeSession
    );

    return product;
  });
};

/**
 * Applies a signed manual stock adjustment (`+N` or `-N`) atomically and logs
 * an `ADJUSTMENT` StockMovement.
 */
export const adjustStock = async ({ productId, quantityChange, reason, userId }) => {
  if (quantityChange === 0) {
    throw new ApiError(400, 'Quantity adjustment cannot be zero');
  }

  // Archived products are frozen; filtering here keeps the check atomic with the update.
  const filter =
    quantityChange < 0
      ? { _id: productId, isArchived: false, quantity: { $gte: Math.abs(quantityChange) } }
      : { _id: productId, isArchived: false };

  const movement = await runInTransaction(null, async (activeSession) => {
    const updated = await Product.findOneAndUpdate(
      filter,
      { $inc: { quantity: quantityChange } },
      { new: true, session: activeSession }
    );

    if (!updated) {
      const exists = await Product.findById(productId)
        .select('sku quantity isArchived')
        .session(activeSession)
        .lean();
      if (!exists) {
        throw new ApiError(404, 'Product not found');
      }
      if (exists.isArchived) {
        throw new ApiError(409, `Cannot adjust stock for archived product ${exists.sku}`);
      }
      throw new ApiError(
        409,
        `Insufficient stock for ${exists.sku} (current stock: ${exists.quantity})`
      );
    }

    return createMovement(
      {
        productId,
        type: 'ADJUSTMENT',
        quantity: quantityChange,
        reason,
        refType: 'MANUAL',
        userId,
      },
      activeSession
    );
  });

  const product = await Product.findById(productId)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();

  return { product, movement };
};

const buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

/**
 * Lists active products at or below their reorder level, most urgent first.
 */
export const listLowStock = async ({ page = 1, limit = 10 }) => {
  // `$expr` compares two fields of the same document (SQL: WHERE quantity <= reorder_level).
  const filter = { isArchived: false, $expr: { $lte: ['$quantity', '$reorderLevel'] } };
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('sku name quantity reorderLevel category supplier')
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ quantity: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, meta: buildMeta(page, limit, total) };
};

/**
 * Lists stock movements, newest first, filterable by product, type, and date range.
 *
 * Note: when filtering by product, the `{ product: 1, createdAt: -1 }` compound
 * index serves both the filter and the sort.
 */
export const listMovements = async ({ product, type, from, to, page = 1, limit = 10 }) => {
  const filter = {};

  if (product) filter.product = product;
  if (type) filter.type = type;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = parseZonedDate(from);
    if (to) filter.createdAt.$lte = parseZonedDate(to, { end: true });
  }

  const skip = (page - 1) * limit;

  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate('product', 'sku name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  return { movements, meta: buildMeta(page, limit, total) };
};
