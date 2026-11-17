import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adjustStock } from '../api/stock.api.js';

const EMPTY_FORM = { productId: '', direction: 'add', amount: '', reason: '' };

/**
 * Manual stock adjustment form. Pass `fixedProduct` to lock it to one product
 * (product detail page); otherwise a product dropdown is shown.
 */
export const StockAdjustForm = ({ products = [], fixedProduct = null, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: (response) => {
      const product = response?.data?.product;
      setSuccessMessage(
        product ? `${product.sku} stock is now ${product.quantity}.` : 'Stock adjusted.'
      );
      setErrorMessage('');
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      onSuccess?.();
    },
    onError: (err) => {
      setErrorMessage(err.message);
      setSuccessMessage('');
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    mutation.mutate({
      productId: fixedProduct?._id || form.productId,
      quantityChange: form.direction === 'remove' ? -amount : amount,
      reason: form.reason,
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!fixedProduct && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Product</label>
          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.sku} — {p.name} (stock: {p.quantity})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Direction</label>
          <select
            name="direction"
            value={form.direction}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="add">Add (+)</option>
            <option value="remove">Remove (−)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quantity</label>
          <input
            type="number"
            name="amount"
            min="1"
            step="1"
            value={form.amount}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Reason</label>
        <input
          type="text"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="e.g. Damaged items, stock count correction"
          required
          className={inputClass}
        />
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
      >
        {mutation.isPending ? 'Saving...' : 'Apply Adjustment'}
      </button>
    </form>
  );
};
