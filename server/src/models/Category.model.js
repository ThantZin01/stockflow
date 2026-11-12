import mongoose from 'mongoose';

/**
 * Category schema.
 *
 * Note (MongoDB unique index): Setting `unique: true` on `name` builds a unique
 * index in MongoDB. Duplicate names throw error code `11000` (mapped to `409`
 * in `errorHandler`).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model('Category', categorySchema);

