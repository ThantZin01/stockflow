import { env } from '../config/env.js';

/**
 * Central Express error-handling middleware.
 *
 * Note (MongoDB error codes):
 * - `err.code === 11000`: MongoDB native duplicate key error (similar to
 *   PostgreSQL's 23505 unique_violation). Mapped to 409 Conflict.
 * - `err.name === 'CastError'`: Mongoose failed to cast a string parameter to a
 *   12-byte MongoDB ObjectId. Mapped to 400 Bad Request.
 * - `err.name === 'ValidationError'`: Mongoose schema-level validation failed.
 *   Mapped to 400 Bad Request.
 */
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0];
    message = duplicateField
      ? `Duplicate value for ${duplicateField}`
      : 'Duplicate resource conflict';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  if (statusCode === 500 && env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', err);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && !err.isOperational ? 'Internal server error' : message,
  });
};
