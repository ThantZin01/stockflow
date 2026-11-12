import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

export const listUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  // Run the paginated read and total count in parallel; `.lean()` skips hydrating Mongoose documents.
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const updateUserRole = async (targetUserId, role, currentAdminId) => {
  if (String(targetUserId) === String(currentAdminId) && role !== 'admin') {
    throw new ApiError(409, 'You cannot remove your own admin role');
  }

  // `new: true` returns the updated document rather than the pre-update state (similar to SQL `RETURNING *`).
  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const updateUserStatus = async (targetUserId, isActive, currentAdminId) => {
  if (String(targetUserId) === String(currentAdminId) && !isActive) {
    throw new ApiError(409, 'You cannot deactivate your own account');
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { isActive },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};
