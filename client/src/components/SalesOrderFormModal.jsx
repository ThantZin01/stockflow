import { useState } from 'react';
import { Modal } from './Modal.jsx';

const EMPTY_ITEM = { product: '', quantity: 1 };

export const SalesOrderFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  errorMessage,
  products = [],
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const productMap = new Map(products.map((p) => [p._id, p]));

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addRow = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeRow = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));

  const estimatedTotal = items.reduce((sum, item) => {
    const product = productMap.get(item.product);
    if (!product) return sum;
    return sum + (Number(item.quantity) || 0) * Number(product.salePrice || 0);
  }, 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      customerName,
      customerPhone,
      items: items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
      })),
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <Modal isOpen={isOpen} title="New Sales Order" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="e.g. Acme Retail"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Customer Phone</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">Line Items</label>
            <button
              type="button"
              onClick={addRow}
              className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
            >
              + Add item
            </button>
          </div>

          {items.map((item, idx) => {
            const matched = productMap.get(item.product);
            return (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-7">
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.sku} — {p.name} (${Number(p.salePrice).toFixed(2)}, stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    required
                    placeholder="Qty"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2 text-right text-xs text-slate-600">
                  {matched
                    ? `$${(Number(item.quantity || 0) * Number(matched.salePrice || 0)).toFixed(2)}`
                    : '—'}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={items.length <= 1}
                    className="text-xs text-red-600 hover:underline disabled:opacity-30 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
          <span className="text-slate-600">Estimated Total (server-verified)</span>
          <span className="font-semibold text-slate-900">${estimatedTotal.toFixed(2)}</span>
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
