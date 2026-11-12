import * as userService from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);
  return sendSuccess(res, users, 200, meta);
});

export const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role, req.user._id);
  return sendSuccess(res, user, 200);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.isActive, req.user._id);
  return sendSuccess(res, user, 200);
});
