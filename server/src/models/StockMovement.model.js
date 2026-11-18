import mongoose from 'mongoose';

/**
 * StockMovement schema (immutable audit log of every stock change).
 *
 * Note (Compound Index): `{ product: 1, createdAt: -1 }` allows MongoDB to
 * fetch a product's movement history already sorted newest-first without an
 * in-memory sort stage.
 */
const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    refType: {
      type: String,
      enum: ['PURCHASE_ORDER', 'SALES_ORDER', 'MANUAL'],
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
