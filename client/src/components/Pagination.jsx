export const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-600 bg-white">
      <span>
        Page <span className="font-medium text-slate-900">{page}</span> of{' '}
        <span className="font-medium text-slate-900">{totalPages}</span>
        {typeof total === 'number' ? ` (${total} total)` : ''}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="rounded-lg border border-slate-200 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

