import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { authRouter } from './routes/auth.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { productRouter } from './routes/product.routes.js';
import { stockRouter } from './routes/stock.routes.js';
import { supplierRouter } from './routes/supplier.routes.js';
import { userRouter } from './routes/user.routes.js';
import { sendSuccess } from './utils/response.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.get('/api/v1', (_req, res) =>
  sendSuccess(res, {
    name: 'StockFlow API',
    version: 'v1',
    status: 'ok',
  })
);

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/stock', stockRouter);

app.use(notFound);
app.use(errorHandler);
