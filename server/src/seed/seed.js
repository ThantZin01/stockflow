import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { PurchaseOrder } from '../models/PurchaseOrder.model.js';
import { SalesOrder } from '../models/SalesOrder.model.js';
import { StockMovement } from '../models/StockMovement.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { User } from '../models/User.model.js';
import * as purchaseOrderService from '../services/purchaseOrder.service.js';
import * as salesOrderService from '../services/salesOrder.service.js';
import * as stockService from '../services/stock.service.js';
import { CATEGORIES, PRODUCTS, SUPPLIERS } from './seedData.js';

const seed = async () => {
  await connectDB();

  console.log('Clearing existing collections...');
  await Promise.all([
    StockMovement.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    SalesOrder.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    User.deleteMany({}),
  ]);

  const [adminHash, staffHash] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('Staff123!', 10),
  ]);

  const [admin, staff] = await User.create([
    {
      name: 'Alex Morgan (Admin)',
      email: 'admin@stockflow.dev',
      passwordHash: adminHash,
      role: 'admin',
    },
    {
      name: 'Jordan Lee (Staff)',
      email: 'staff@stockflow.dev',
      passwordHash: staffHash,
      role: 'staff',
    },
  ]);

  const categories = await Category.insertMany(CATEGORIES);
  const suppliers = await Supplier.insertMany(SUPPLIERS);

  const products = [];
  for (const [sku, name, catIdx, supIdx, costPrice, salePrice, reorderLevel, qty] of PRODUCTS) {
    const product = await Product.create({
      sku,
      name,
      category: categories[catIdx]._id,
      supplier: suppliers[supIdx]._id,
      costPrice,
      salePrice,
      reorderLevel,
    });

    if (qty > 0) {
      await stockService.increaseStock({
        productId: product._id,
        quantity: qty,
        reason: 'Initial seeded inventory',
        refType: 'MANUAL',
        userId: admin._id,
      });
    }
    products.push(product);
  }

  // Sample Purchase Orders (draft, ordered, received)
  const po1 = await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[0]._id.toString(),
      items: [
        { product: products[2]._id.toString(), quantity: 15, unitCost: 22.0 },
        { product: products[4]._id.toString(), quantity: 10, unitCost: 28.0 },
      ],
    },
    admin._id
  );
  await purchaseOrderService.markAsOrdered(po1._id);
  await purchaseOrderService.receivePurchaseOrder(po1._id, admin._id);

  const po2 = await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[1]._id.toString(),
      items: [{ product: products[14]._id.toString(), quantity: 6, unitCost: 72.0 }],
    },
    staff._id
  );
  await purchaseOrderService.markAsOrdered(po2._id);

  await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[2]._id.toString(),
      items: [{ product: products[26]._id.toString(), quantity: 20, unitCost: 9.0 }],
    },
    staff._id
  );

  // Sample Sales Orders (completed, confirmed, pending, cancelled)
  const so1 = await salesOrderService.createSalesOrder(
    {
      customerName: 'Northwind Studio',
      customerPhone: '+1-555-0201',
      items: [
        { product: products[0]._id.toString(), quantity: 4 },
        { product: products[1]._id.toString(), quantity: 2 },
      ],
    },
    staff._id
  );
  await salesOrderService.confirmSalesOrder(so1._id, staff._id);
  await salesOrderService.completeSalesOrder(so1._id);

  const so2 = await salesOrderService.createSalesOrder(
    {
      customerName: 'Brightleaf Co-op',
      customerPhone: '+1-555-0202',
      items: [{ product: products[6]._id.toString(), quantity: 10 }],
    },
    staff._id
  );
  await salesOrderService.confirmSalesOrder(so2._id, staff._id);

  await salesOrderService.createSalesOrder(
    {
      customerName: 'Civic Workspace',
      customerPhone: '+1-555-0203',
      items: [{ product: products[12]._id.toString(), quantity: 2 }],
    },
    admin._id
  );

  const so4 = await salesOrderService.createSalesOrder(
    {
      customerName: 'Redwood Labs',
      customerPhone: '',
      items: [{ product: products[18]._id.toString(), quantity: 3 }],
    },
    staff._id
  );
  await salesOrderService.confirmSalesOrder(so4._id, staff._id);
  await salesOrderService.cancelSalesOrder(so4._id, staff._id);

  console.log('Seed complete:');
  console.log('  Admin: admin@stockflow.dev / Admin123!');
  console.log('  Staff: staff@stockflow.dev / Staff123!');
  console.log(
    `  Categories: ${categories.length}, Suppliers: ${suppliers.length}, Products: ${products.length}`
  );
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
