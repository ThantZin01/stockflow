import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById } from '../api/products.api.js';

export const ProductDetailPage = () => {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });

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
  const movements = data?.data?.movements || [];

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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent Stock Movements</h2>
        </div>

        {movements.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No stock movements recorded for this product yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Change</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {movements.map((mv) => (
                  <tr key={mv._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(mv.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {mv.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-3 font-medium ${
                        mv.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {mv.quantity > 0 ? `+${mv.quantity}` : mv.quantity}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{mv.reason}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {mv.createdBy?.name || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
