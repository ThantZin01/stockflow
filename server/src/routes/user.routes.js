import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listUsersQuerySchema,
  updateRoleSchema,
  updateStatusSchema,
  userIdParamSchema,
} from '../validators/user.validator.js';

export const userRouter = Router();

userRouter.use(authenticate, authorize('admin'));

userRouter.get('/', validate({ query: listUsersQuerySchema }), userController.listUsers);

userRouter.patch(
  '/:id/role',
  validate({ params: userIdParamSchema, body: updateRoleSchema }),
  userController.updateRole
);

userRouter.patch(
  '/:id/status',
  validate({ params: userIdParamSchema, body: updateStatusSchema }),
  userController.updateStatus
);
