import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return sendSuccess(res, {
      status: 'ok',
      database: dbStates[mongoose.connection.readyState] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  })
);
