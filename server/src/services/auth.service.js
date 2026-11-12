import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

const sanitizeUser = (userDoc) => {
  const obj = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  delete obj.passwordHash;
  return obj;
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  // First registered user becomes admin; subsequent users default to staff.
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : 'staff';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
  });

  const token = signToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const loginUser = async ({ email, password }) => {
  // Explicitly include `+passwordHash` because the schema sets `select: false`.
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact an administrator.');
  }

  const token = signToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};
