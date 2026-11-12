import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies the Bearer JWT and attaches the authenticated user to `req.user`.
 *
 * Note (`.lean()`): By default, Mongoose queries hydrate full Mongoose Document
 * instances with change tracking and helper methods. Using `.lean()` returns a
 * plain JavaScript object, making read-only lookups faster and lighter.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.sub).lean();

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  req.user = user;
  next();
});

/**
 * Restricts route access to specific user roles.
 */
export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }
    return next();
  };
