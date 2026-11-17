import mongoose from 'mongoose';

/**
 * Embedded line item schema.
 *
 * Note (Embedding vs Referencing): `name` and `sku` are stored as a snapshot
 * at order creation/update time so later product renames or SKU changes do not
 * alter historical purchase orders.
 */
const purchaseOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'ordered', 'received'],
      default: 'draft',
    },
    items: {
      type: [purchaseOrderItemSchema],
      validate: [(v) => v.length > 0, 'Purchase order must have at least one item'],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderedAt: {
      type: Date,
      default: null,
    },
    receivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ status: 1, createdAt: -1 });

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
