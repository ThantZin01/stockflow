import mongoose from 'mongoose';

/**
 * Product schema.
 *
 * Note (Referencing vs Embedding & Indexes in MongoDB):
 * - `category` and `supplier` store `ObjectId` references (`ref`) rather than
 *   embedded objects because categories and suppliers are shared across many
 *   products and updated independently (similar to foreign keys in PostgreSQL).
 * - Indexes:
 *   1. `sku`: unique index for fast lookups and duplicate prevention.
 *   2. Text index on `name`: supports text search queries.
 *   3. Index on `category`: speeds up category filtering (`WHERE category_id = ...`).
 */
const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    salePrice: {
      type: Number,
      required: [true, 'Sale price is required'],
      min: [0, 'Sale price cannot be negative'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      default: 5,
      min: [0, 'Reorder level cannot be negative'],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });

export const Product = mongoose.model('Product', productSchema);

