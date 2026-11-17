import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchProducts } from '../api/products.api.js';
import { fetchLowStock, fetchStockMovements } from '../api/stock.api.js';
import { LowStockTable } from '../components/LowStockTable.jsx';
import { MovementsTable } from '../components/MovementsTable.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StockAdjustForm } from '../components/StockAdjustForm.jsx';

const EMPTY_FILTERS = { product: '', type: '', from: '', to: '' };

export const StockPage = () => {
  const [lowPage, setLowPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const lowStockQuery = useQuery({
    queryKey: ['stock', 'low', { page: lowPage }],
    queryFn: () => fetchLowStock({ page: lowPage, limit: 5 }),
  });

  const movementsQuery = useQuery({
    queryKey: ['stock', 'movements', { ...filters, page: movementPage }],
    queryFn: () => fetchStockMovements({ ...filters, page: movementPage, limit: 10 }),
  });

  // Dropdown options for the adjust form and the product filter.
  const productsQuery = useQuery({
    queryKey: ['products', { sort: 'name_asc', limit: 200 }],
    queryFn: () => fetchProducts({ sort: 'name_asc', page: 1, limit: 200 }),
  });

  const products = productsQuery.data?.data || [];
  const lowMeta = lowStockQuery.data?.meta;
  const movementMeta = movementsQuery.data?.meta;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setMovementPage(1);
  };

  const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stock</h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor low stock, make manual adjustments, and audit every quantity change.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Low Stock</h2>
            {typeof lowMeta?.total === 'number' && (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {lowMeta.total} item{lowMeta.total === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <LowStockTable query={lowStockQuery} />
          <Pagination
            page={lowMeta?.page || 1}
            totalPages={lowMeta?.totalPages}
            total={lowMeta?.total}
            onPageChange={setLowPage}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Manual Adjustment</h2>
          {productsQuery.isError ? (
            <p className="text-sm text-red-600">
              Failed to load products: {productsQuery.error?.message}
            </p>
          ) : (
            <StockAdjustForm products={products} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Movement History</h2>
          <div className="flex flex-wrap gap-3">
            <select
              name="product"
              value={filters.product}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All types</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              From
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              To
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setMovementPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
        <MovementsTable
          movements={movementsQuery.data?.data}
          isLoading={movementsQuery.isLoading}
          isError={movementsQuery.isError}
          error={movementsQuery.error}
        />
        <Pagination
          page={movementMeta?.page || 1}
          totalPages={movementMeta?.totalPages}
          total={movementMeta?.total}
          onPageChange={setMovementPage}
        />
      </div>
    </div>
  );
};
