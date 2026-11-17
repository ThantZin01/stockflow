import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchSalesReport, fetchStockValue, fetchTopProducts } from '../api/reports.api.js';
import { SalesChart } from '../components/SalesChart.jsx';
import { StatCard } from '../components/StatCard.jsx';

export const ReportsPage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [topLimit, setTopLimit] = useState(10);

  const salesQuery = useQuery({
    queryKey: ['reports', 'sales', { from, to }],
    queryFn: () => fetchSalesReport({ from, to }),
  });

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'top-products', { limit: topLimit }],
    queryFn: () => fetchTopProducts({ limit: topLimit }),
  });

  const stockValueQuery = useQuery({
    queryKey: ['reports', 'stock-value'],
    queryFn: fetchStockValue,
  });

  const stockValue = stockValueQuery.data?.data;
  const topProducts = topProductsQuery.data?.data || [];
  const categories = stockValue?.byCategory || [];

  const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sales trends, top-selling products, and current inventory valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Units in Stock"
          value={stockValueQuery.isLoading ? '...' : (stockValue?.totalUnits ?? 0)}
          subtext="Across active products"
        />
        <StatCard
          label="Inventory Cost Value"
          value={
            stockValueQuery.isLoading
              ? '...'
              : `$${Number(stockValue?.totalCostValue ?? 0).toFixed(2)}`
          }
          subtext="Sum of quantity × cost price"
        />
        <StatCard
          label="Inventory Retail Value"
          value={
            stockValueQuery.isLoading
              ? '...'
              : `$${Number(stockValue?.totalRetailValue ?? 0).toFixed(2)}`
          }
          subtext="Sum of quantity × sale price"
          accent="text-indigo-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Sales by Date</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={inputClass}
              />
            </label>
            {(from || to) && (
              <button
                type="button"
                onClick={() => {
                  setFrom('');
                  setTo('');
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <SalesChart
          data={salesQuery.data?.data}
          isLoading={salesQuery.isLoading}
          isError={salesQuery.isError}
          error={salesQuery.error}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Top Selling Products</h2>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
          {topProductsQuery.isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading top products...</div>
          ) : topProductsQuery.isError ? (
            <div className="p-8 text-center text-sm text-red-600">
              Failed to load: {topProductsQuery.error?.message}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No sales recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-right">Units Sold</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {topProducts.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{p.name}</div>
                        <div className="font-mono text-xs text-slate-500">{p.sku}</div>
                      </td>
                      <td className="px-6 py-3 text-right font-medium">{p.unitsSold}</td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        ${Number(p.revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Stock Value by Category</h2>
          </div>
          {stockValueQuery.isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading valuation...</div>
          ) : stockValueQuery.isError ? (
            <div className="p-8 text-center text-sm text-red-600">
              Failed to load: {stockValueQuery.error?.message}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No active products yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Units</th>
                    <th className="px-6 py-3 text-right">Cost Value</th>
                    <th className="px-6 py-3 text-right">Retail Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {categories.map((cat) => (
                    <tr key={cat.categoryId || cat.categoryName} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">{cat.categoryName}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{cat.totalUnits}</td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        ${Number(cat.costValue).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600">
                        ${Number(cat.retailValue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
