import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

export const authRouter = Router();

// `/me` is called on every page load, so the strict limiter stays on the
// credential endpoints only. A shared office IP would otherwise burn the
// login budget just by refreshing the app.
authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  authController.register
);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
authRouter.get('/me', authenticate, authController.getMe);
