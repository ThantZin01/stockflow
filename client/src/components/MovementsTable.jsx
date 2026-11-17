import { Link } from 'react-router-dom';

const TYPE_STYLES = {
  IN: 'bg-emerald-50 text-emerald-700',
  OUT: 'bg-red-50 text-red-700',
  ADJUSTMENT: 'bg-amber-50 text-amber-700',
};

/**
 * Presentational table for stock movements. Loading/error/empty states are
 * handled here so every page renders them consistently.
 */
export const MovementsTable = ({ movements, isLoading, isError, error, showProduct = true }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading movements...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-red-600">
        Failed to load movements: {error?.message}
      </div>
    );
  }

  if (!movements?.length) {
    return <div className="p-8 text-center text-sm text-slate-500">No stock movements found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-6 py-3">Date</th>
            {showProduct && <th className="px-6 py-3">Product</th>}
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Change</th>
            <th className="px-6 py-3">Reason</th>
            <th className="px-6 py-3">Source</th>
            <th className="px-6 py-3">By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {movements.map((mv) => (
            <tr key={mv._id} className="hover:bg-slate-50">
              <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                {new Date(mv.createdAt).toLocaleString()}
              </td>
              {showProduct && (
                <td className="px-6 py-3">
                  {mv.product ? (
                    <Link
                      to={`/products/${mv.product._id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {mv.product.name}
                    </Link>
                  ) : (
                    <span className="text-slate-400">Deleted product</span>
                  )}
                  <div className="font-mono text-xs text-slate-500">{mv.product?.sku}</div>
                </td>
              )}
              <td className="px-6 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[mv.type] || ''}`}
                >
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
              <td className="px-6 py-3 text-xs text-slate-500">{mv.refType}</td>
              <td className="px-6 py-3 text-xs text-slate-500">{mv.createdBy?.name || 'System'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
