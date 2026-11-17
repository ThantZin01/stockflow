import { Product } from '../models/Product.model.js';
import { SalesOrder } from '../models/SalesOrder.model.js';

const REVENUE_STATUSES = ['confirmed', 'completed'];

/**
 * Returns top-level KPI metrics for the dashboard summary cards.
 */
export const getSummary = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalProducts, lowStockCount, ordersToday, monthlyRevenueAgg] = await Promise.all([
    Product.countDocuments({ isArchived: false }),
    Product.countDocuments({
      isArchived: false,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    }),
    SalesOrder.countDocuments({
      createdAt: { $gte: startOfDay },
      status: { $ne: 'cancelled' },
    }),
    SalesOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
        },
      },
    ]),
  ]);

  return {
    totalProducts,
    lowStockCount,
    ordersToday,
    revenueThisMonth: Number((monthlyRevenueAgg[0]?.revenue || 0).toFixed(2)),
  };
};

/**
 * Aggregates daily sales revenue and order counts for a date range (defaults to last 30 days).
 *
 * Note (Aggregation Pipeline): `$group` with `$dateToString` buckets orders by
 * calendar day directly in MongoDB instead of loading all orders into Node.js.
 */
export const getSalesByDate = async ({ from, to }) => {
  const endDate = to ? new Date(`${to}T23:59:59.999`) : new Date();
  const startDate = from
    ? new Date(`${from}T00:00:00.000`)
    : new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);

  if (!from) {
    startDate.setHours(0, 0, 0, 0);
  }

  const rows = await SalesOrder.aggregate([
    {
      $match: {
        status: { $in: REVENUE_STATUSES },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: { $round: ['$revenue', 2] },
        orders: 1,
      },
    },
  ]);

  return rows;
};

/**
 * Aggregates top-selling products by units sold across non-cancelled, confirmed/completed orders.
 *
 * Note (Aggregation Pipeline): `$unwind` flattens the embedded `items` array so
 * `$group` can sum quantities and revenue per product across all orders.
 */
export const getTopProducts = async ({ limit = 10 }) =>
  SalesOrder.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        sku: { $first: '$items.sku' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
      },
    },
    { $sort: { unitsSold: -1, revenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: 1,
        sku: 1,
        unitsSold: 1,
        revenue: { $round: ['$revenue', 2] },
      },
    },
  ]);

/**
 * Computes total inventory cost value, retail value, and breakdown by category.
 */
export const getStockValue = async () => {
  const [totalsAgg, byCategory] = await Promise.all([
    Product.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: '$quantity' },
          totalCostValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          totalRetailValue: { $sum: { $multiply: ['$quantity', '$salePrice'] } },
        },
      },
    ]),
    Product.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalUnits: { $sum: '$quantity' },
          costValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          retailValue: { $sum: { $multiply: ['$quantity', '$salePrice'] } },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { costValue: -1 } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
          productCount: 1,
          totalUnits: 1,
          costValue: { $round: ['$costValue', 2] },
          retailValue: { $round: ['$retailValue', 2] },
        },
      },
    ]),
  ]);

  const totals = totalsAgg[0] || { totalUnits: 0, totalCostValue: 0, totalRetailValue: 0 };

  return {
    totalUnits: totals.totalUnits,
    totalCostValue: Number(totals.totalCostValue.toFixed(2)),
    totalRetailValue: Number(totals.totalRetailValue.toFixed(2)),
    byCategory,
  };
};
