import { Link } from 'react-router-dom';

export const LowStockTable = ({ query }) => {
  const { data, isLoading, isError, error } = query;
  const products = data?.data || [];

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading low-stock items...</div>;
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-red-600">Failed to load: {error?.message}</div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        All products are above their reorder level.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Supplier</th>
            <th className="px-6 py-3 text-right">Stock</th>
            <th className="px-6 py-3 text-right">Reorder Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {products.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="px-6 py-3">
                <Link
                  to={`/products/${p._id}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {p.name}
                </Link>
                <div className="font-mono text-xs text-slate-500">{p.sku}</div>
              </td>
              <td className="px-6 py-3 text-slate-600">{p.supplier?.name || '—'}</td>
              <td
                className={`px-6 py-3 text-right font-semibold ${
                  p.quantity === 0 ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {p.quantity}
              </td>
              <td className="px-6 py-3 text-right text-slate-600">{p.reorderLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
