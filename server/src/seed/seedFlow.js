import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { PurchaseOrder } from '../models/PurchaseOrder.model.js';
import { SalesOrder } from '../models/SalesOrder.model.js';
import { StockMovement } from '../models/StockMovement.model.js';
import { Supplier } from '../models/Supplier.model.js';
import * as purchaseOrderService from '../services/purchaseOrder.service.js';
import * as salesOrderService from '../services/salesOrder.service.js';
import * as stockService from '../services/stock.service.js';
import { CATEGORIES, PRODUCTS, SUPPLIERS } from './seedData.js';

/** Removes catalog and order data; never touches `User`. */
export const clearFlowData = async () => {
  await Promise.all([
    StockMovement.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    SalesOrder.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
  ]);
};

export const seedCatalog = async (actorId) => {
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
      ...(sku === 'OFC-2003' ? { description: 'Demo: frequently low stock' } : {}),
    });

    if (qty > 0) {
      await stockService.increaseStock({
        productId: product._id,
        quantity: qty,
        reason: 'Opening inventory (mock data)',
        refType: 'MANUAL',
        userId: actorId,
      });
    }
    products.push(product);
  }

  const archivedDesk = await Product.create({
    sku: 'FRN-3099',
    name: 'Discontinued Corner Desk (Demo Archive)',
    description: 'Archived sample for catalog filter testing',
    category: categories[2]._id,
    supplier: suppliers[1]._id,
    costPrice: 180000,
    salePrice: 320000,
    reorderLevel: 2,
    isArchived: true,
  });

  products.push(archivedDesk);

  await stockService.adjustStock({
    productId: products.find((p) => p.sku === 'NET-4003')._id,
    quantityChange: -1,
    reason: 'Demo stock count correction',
    userId: actorId,
  });

  return { categories, suppliers, products };
};

const productCost = (products, sku) => {
  const match = products.find((p) => p.sku === sku);
  if (!match) throw new Error(`Unknown product sku: ${sku}`);
  return match.costPrice;
};

const productId = (products, sku) => products.find((p) => p.sku === sku)._id.toString();

/**
 * Purchase and sales samples covering each status transition in the UI.
 * All monetary amounts follow product cost/sale prices in MMK.
 */
export const seedOrderFlows = async ({ suppliers, products, actorId, staffId = null }) => {
  const staff = staffId || actorId;

  const poReceived = await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[0]._id.toString(),
      items: [
        {
          product: productId(products, 'ELC-1003'),
          quantity: 20,
          unitCost: productCost(products, 'ELC-1003'),
        },
        {
          product: productId(products, 'ELC-1005'),
          quantity: 12,
          unitCost: productCost(products, 'ELC-1005'),
        },
      ],
    },
    actorId
  );
  await purchaseOrderService.markAsOrdered(poReceived._id);
  await purchaseOrderService.receivePurchaseOrder(poReceived._id, actorId);

  const poOrdered = await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[1]._id.toString(),
      items: [
        {
          product: productId(products, 'FRN-3003'),
          quantity: 4,
          unitCost: productCost(products, 'FRN-3003'),
        },
      ],
    },
    staff
  );
  await purchaseOrderService.markAsOrdered(poOrdered._id);

  await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[2]._id.toString(),
      items: [
        {
          product: productId(products, 'PKG-5003'),
          quantity: 25,
          unitCost: productCost(products, 'PKG-5003'),
        },
        {
          product: productId(products, 'PKG-5001'),
          quantity: 10,
          unitCost: productCost(products, 'PKG-5001'),
        },
      ],
    },
    staff
  );

  await purchaseOrderService.createPurchaseOrder(
    {
      supplier: suppliers[0]._id.toString(),
      items: [
        {
          product: productId(products, 'NET-4006'),
          quantity: 2,
          unitCost: productCost(products, 'NET-4006'),
        },
      ],
    },
    actorId
  );

  const soCompleted = await salesOrderService.createSalesOrder(
    {
      customerName: 'Golden Pagoda Retail',
      customerPhone: '+95-9-421-100-334',
      items: [
        { product: productId(products, 'ELC-1001'), quantity: 3 },
        { product: productId(products, 'ELC-1002'), quantity: 1 },
      ],
    },
    staff
  );
  await salesOrderService.confirmSalesOrder(soCompleted._id, staff);
  await salesOrderService.completeSalesOrder(soCompleted._id);

  const soConfirmed = await salesOrderService.createSalesOrder(
    {
      customerName: 'Inya Lake Supplies',
      customerPhone: '+95-9-781-555-902',
      items: [{ product: productId(products, 'OFC-2001'), quantity: 8 }],
    },
    staff
  );
  await salesOrderService.confirmSalesOrder(soConfirmed._id, staff);

  await salesOrderService.createSalesOrder(
    {
      customerName: 'Bogyoke Market Stall 12',
      customerPhone: '+95-9-512-880-221',
      items: [
        { product: productId(products, 'FRN-3004'), quantity: 1 },
        { product: productId(products, 'NET-4002'), quantity: 1 },
      ],
    },
    actorId
  );

  await salesOrderService.createSalesOrder(
    {
      customerName: 'Walk-in (pending confirm)',
      customerPhone: '',
      items: [{ product: productId(products, 'PKG-5002'), quantity: 5 }],
    },
    staff
  );

  const soCancel = await salesOrderService.createSalesOrder(
    {
      customerName: 'Cancelled demo order',
      customerPhone: '+95-9-940-112-009',
      items: [{ product: productId(products, 'NET-4005'), quantity: 2 }],
    },
    staff
  );
  await salesOrderService.confirmSalesOrder(soCancel._id, staff);
  await salesOrderService.cancelSalesOrder(soCancel._id, staff);

  return {
    purchaseOrders: {
      received: poReceived.poNumber,
      ordered: poOrdered.poNumber,
      drafts: 2,
    },
    salesOrders: {
      completed: soCompleted.orderNumber,
      confirmed: soConfirmed.orderNumber,
      pending: 2,
      cancelled: soCancel.orderNumber,
    },
  };
};