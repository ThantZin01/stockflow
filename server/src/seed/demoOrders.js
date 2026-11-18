import { SalesOrder } from '../models/SalesOrder.model.js';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + (n % 6), 30, 0, 0);
  return d;
};

const CUSTOMERS = [
  ['Shwe Myanmar Retail', '09-781-445-102'],
  ['Golden Pagoda Electronics', '09-420-889-330'],
  ['Inya Lake Workspace', '09-512-778-901'],
  ['Bogyoke Street Boutique', '09-655-223-118'],
  ['Mingalar Wholesale', '09-940-112-887'],
  ['Thanlyin Trade Center', '09-431-667-540'],
];

/**
 * Extra sales orders spread across the last ~28 days so dashboard charts and
 * "revenue this month" have realistic MMK totals after seeding.
 */
export const seedDemoSalesHistory = async (products, staffId, salesOrderService) => {
  const scenarios = [
    { daysAgo: 0, itemIdx: 0, qty: 2, complete: true },
    { daysAgo: 0, itemIdx: 7, qty: 15, complete: false },
    { daysAgo: 1, itemIdx: 1, qty: 1, complete: true },
    { daysAgo: 2, itemIdx: 19, qty: 3, complete: true },
    { daysAgo: 4, itemIdx: 6, qty: 8, complete: true },
    { daysAgo: 5, itemIdx: 17, qty: 2, complete: true },
    { daysAgo: 7, itemIdx: 3, qty: 1, complete: true },
    { daysAgo: 9, itemIdx: 24, qty: 5, complete: true },
    { daysAgo: 11, itemIdx: 5, qty: 2, complete: true },
    { daysAgo: 14, itemIdx: 11, qty: 12, complete: true },
    { daysAgo: 16, itemIdx: 20, qty: 1, complete: true },
    { daysAgo: 18, itemIdx: 8, qty: 6, complete: true },
    { daysAgo: 21, itemIdx: 15, qty: 4, complete: true },
    { daysAgo: 23, itemIdx: 22, qty: 7, complete: true },
    { daysAgo: 26, itemIdx: 4, qty: 3, complete: true },
    { daysAgo: 28, itemIdx: 13, qty: 1, complete: true },
  ];

  let customerIdx = 0;

  for (const spec of scenarios) {
    const [customerName, customerPhone] = CUSTOMERS[customerIdx % CUSTOMERS.length];
    customerIdx += 1;

    const product = products[spec.itemIdx];
    if (!product) continue;

    const order = await salesOrderService.createSalesOrder(
      {
        customerName,
        customerPhone,
        items: [{ product: product._id.toString(), quantity: spec.qty }],
      },
      staffId
    );

    await salesOrderService.confirmSalesOrder(order._id, staffId);

    let status = 'confirmed';
    if (spec.complete) {
      await salesOrderService.completeSalesOrder(order._id);
      status = 'completed';
    }

    const createdAt = daysAgo(spec.daysAgo);
    await SalesOrder.updateOne(
      { _id: order._id },
      { $set: { createdAt, updatedAt: createdAt, status } }
    );
  }
};