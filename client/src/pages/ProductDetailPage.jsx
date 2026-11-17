import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById } from '../api/products.api.js';
import { fetchStockMovements } from '../api/stock.api.js';
import { MovementsTable } from '../components/MovementsTable.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StockAdjustForm } from '../components/StockAdjustForm.jsx';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [movementPage, setMovementPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });

  const movementsQuery = useQuery({
    queryKey: ['stock', 'movements', { product: id, page: movementPage }],
    queryFn: () => fetchStockMovements({ product: id, page: movementPage, limit: 10 }),
  });

  const movementMeta = movementsQuery.data?.meta;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
        Loading product details...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-sm text-red-600">
        Failed to load product: {error?.message}
      </div>
    );
  }

  const product = data?.data?.product;

  if (!product) {
    return null;
  }

  const isLow = product.quantity <= product.reorderLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/products" className="text-xs font-medium text-indigo-600 hover:underline">
            &larr; Back to Products
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <span className="rounded bg-slate-100 px-2.5 py-0.5 font-mono text-xs text-slate-700">
              {product.sku}
            </span>
            {product.isArchived && (
              <span className="rounded bg-slate-200 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-700">
                Archived
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Stock Status
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{product.quantity}</p>
          <p className="mt-1 text-xs text-slate-500">
            Reorder Level: <span className="font-medium">{product.reorderLevel}</span>{' '}
            {isLow && <span className="ml-1 text-amber-600 font-semibold">(Low Stock)</span>}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pricing</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Sale: ${Number(product.salePrice).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cost: ${Number(product.costPrice).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Classification
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Category: {product.category?.name || '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Supplier: {product.supplier?.name || '—'}</p>
        </div>
      </div>

      {product.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </h2>
          <p className="mt-2 text-sm text-slate-700">{product.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Stock Movement History</h2>
          </div>
          <MovementsTable
            movements={movementsQuery.data?.data}
            isLoading={movementsQuery.isLoading}
            isError={movementsQuery.isError}
            error={movementsQuery.error}
            showProduct={false}
          />
          <Pagination
            page={movementMeta?.page || 1}
            totalPages={movementMeta?.totalPages}
            total={movementMeta?.total}
            onPageChange={setMovementPage}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Adjust Stock</h2>
          {product.isArchived ? (
            <p className="text-sm text-slate-500">Unarchive this product to adjust its stock.</p>
          ) : (
            <StockAdjustForm fixedProduct={product} onSuccess={() => setMovementPage(1)} />
          )}
        </div>
      </div>
    </div>
  );
};
