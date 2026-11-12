import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, result, 200);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  return sendSuccess(res, user, 200);
});
