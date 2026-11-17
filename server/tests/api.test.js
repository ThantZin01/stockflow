process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { Category } from '../src/models/Category.model.js';
import { Product } from '../src/models/Product.model.js';
import { PurchaseOrder } from '../src/models/PurchaseOrder.model.js';
import { SalesOrder } from '../src/models/SalesOrder.model.js';
import { StockMovement } from '../src/models/StockMovement.model.js';
import { Supplier } from '../src/models/Supplier.model.js';
import { User } from '../src/models/User.model.js';

const stamp = Date.now();
const testEmail = `jest-${stamp}@stockflow.test`;
const testSku = `JEST-${stamp}`;

let token;
let categoryId;
let supplierId;
let productId;
const createdPoIds = [];
const createdSoIds = [];

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  if (productId) {
    await StockMovement.deleteMany({ product: productId });
    await Product.deleteOne({ _id: productId });
  }
  if (createdPoIds.length) await PurchaseOrder.deleteMany({ _id: { $in: createdPoIds } });
  if (createdSoIds.length) await SalesOrder.deleteMany({ _id: { $in: createdSoIds } });
  if (categoryId) await Category.deleteOne({ _id: categoryId });
  if (supplierId) await Supplier.deleteOne({ _id: supplierId });
  await User.deleteOne({ email: testEmail });
  await mongoose.disconnect();
});

describe('StockFlow API key workflows', () => {
  test('Auth: register, login, and /auth/me', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Jest Tester', email: testEmail, password: 'Password123!' });
    expect(reg.status).toBe(201);
    expect(reg.body.success).toBe(true);
    expect(reg.body.data.user.passwordHash).toBeUndefined();

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'Password123!' });
    expect(login.status).toBe(200);
    token = login.body.data.token;
    expect(token).toBeTruthy();

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(testEmail);
  });

  test('Product create: duplicate SKU returns 409', async () => {
    const cat = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `JestCat-${stamp}` });
    categoryId = cat.body.data._id;

    const sup = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `JestSup-${stamp}`, contactName: 'Tester', phone: '123456' });
    supplierId = sup.body.data._id;

    const first = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sku: testSku,
        name: 'Jest Widget',
        category: categoryId,
        supplier: supplierId,
        costPrice: 10,
        salePrice: 25,
        reorderLevel: 5,
        initialQuantity: 5,
      });
    expect(first.status).toBe(201);
    productId = first.body.data._id;

    const duplicate = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sku: testSku,
        name: 'Duplicate Widget',
        category: categoryId,
        supplier: supplierId,
        costPrice: 10,
        salePrice: 25,
        reorderLevel: 5,
      });
    expect(duplicate.status).toBe(409);
  });

  test('Sales order confirm: insufficient stock returns 409 and leaves stock unchanged', async () => {
    const orderRes = await request(app)
      .post('/api/v1/sales-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Jest Customer',
        items: [{ product: productId, quantity: 999 }],
      });
    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body.data._id;
    createdSoIds.push(orderId);

    const confirmRes = await request(app)
      .patch(`/api/v1/sales-orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${token}`);
    expect(confirmRes.status).toBe(409);

    const productRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(productRes.body.data.product.quantity).toBe(5);
  });

  test('Purchase order receive: increases stock and rejects duplicate receive with 409', async () => {
    const poRes = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        supplier: supplierId,
        items: [{ product: productId, quantity: 10, unitCost: 10 }],
      });
    expect(poRes.status).toBe(201);
    const poId = poRes.body.data._id;
    createdPoIds.push(poId);

    const orderRes = await request(app)
      .patch(`/api/v1/purchase-orders/${poId}/order`)
      .set('Authorization', `Bearer ${token}`);
    expect(orderRes.status).toBe(200);

    const receive1 = await request(app)
      .patch(`/api/v1/purchase-orders/${poId}/receive`)
      .set('Authorization', `Bearer ${token}`);
    expect(receive1.status).toBe(200);
    expect(receive1.body.data.status).toBe('received');

    const productRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(productRes.body.data.product.quantity).toBe(15);

    const receive2 = await request(app)
      .patch(`/api/v1/purchase-orders/${poId}/receive`)
      .set('Authorization', `Bearer ${token}`);
    expect(receive2.status).toBe(409);
  });
});
