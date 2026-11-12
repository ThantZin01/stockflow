import mongoose from 'mongoose';

/**
 * User schema.
 *
 * Note (MongoDB / Mongoose concepts):
 * - `select: false` on `passwordHash` instructs Mongoose to exclude this field
 *   from all query projections by default (unlike SQL `SELECT *` which returns
 *   every column). When login needs to verify the password, it explicitly opts
 *   in via `.select('+passwordHash')`.
 * - `unique: true` on `email` creates a unique index in MongoDB. If a duplicate
 *   is inserted, MongoDB throws error code `11000`, which our central
 *   `errorHandler` maps to `409 Conflict`.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
