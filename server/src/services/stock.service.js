import { Product } from '../models/Product.model.js';
import { StockMovement } from '../models/StockMovement.model.js';
import { ApiError } from '../utils/ApiError.js';

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

  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { quantity } },
    { new: true, session }
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
    session
  );

  return product;
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

  const product = await Product.findOneAndUpdate(
    { _id: productId, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true, session }
  );

  if (!product) {
    const exists = await Product.findById(productId).select('sku name quantity').lean();
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
    session
  );

  return product;
};

/**
 * Applies a signed manual stock adjustment (`+N` or `-N`) atomically and logs
 * an `ADJUSTMENT` StockMovement.
 */
export const adjustStock = async ({ productId, quantityChange, reason, userId }) => {
  if (quantityChange === 0) {
    throw new ApiError(400, 'Quantity adjustment cannot be zero');
  }

  const filter =
    quantityChange < 0
      ? { _id: productId, quantity: { $gte: Math.abs(quantityChange) } }
      : { _id: productId };

  const product = await Product.findOneAndUpdate(
    filter,
    { $inc: { quantity: quantityChange } },
    { new: true }
  )
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();

  if (!product) {
    const exists = await Product.findById(productId).select('sku quantity').lean();
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }
    throw new ApiError(
      409,
      `Insufficient stock for ${exists.sku} (current stock: ${exists.quantity})`
    );
  }

  const movement = await createMovement({
    productId,
    type: 'ADJUSTMENT',
    quantity: quantityChange,
    reason,
    refType: 'MANUAL',
    userId,
  });

  return { product, movement };
};

