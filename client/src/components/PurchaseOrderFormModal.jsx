import { useState } from 'react';
import { Modal } from './Modal.jsx';

const EMPTY_ITEM = { product: '', quantity: 1, unitCost: 0 };

const buildInitialItems = (order) =>
  order?.items?.length
    ? order.items.map((item) => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        unitCost: item.unitCost,
      }))
    : [{ ...EMPTY_ITEM }];

export const PurchaseOrderFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  errorMessage,
  suppliers = [],
  products = [],
  initialOrder = null,
}) => {
  const [supplier, setSupplier] = useState(
    () => initialOrder?.supplier?._id || initialOrder?.supplier || ''
  );
  const [items, setItems] = useState(() => buildInitialItems(initialOrder));

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'product') {
          const matched = products.find((p) => p._id === value);
          return {
            ...item,
            product: value,
            unitCost: matched ? matched.costPrice : item.unitCost,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const addRow = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeRow = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));

  const estimatedTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
    0
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      supplier,
      items: items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      })),
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <Modal
      isOpen={isOpen}
      title={initialOrder ? `Edit ${initialOrder.poNumber}` : 'New Purchase Order'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Supplier</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
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

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <select
                  value={item.product}
                  onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.sku} — {p.name}
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
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitCost}
                  onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                  required
                  placeholder="Cost"
                  className={inputClass}
                />
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
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
          <span className="text-slate-600">Estimated Total</span>
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
            {isSaving ? 'Saving...' : initialOrder ? 'Save Draft' : 'Create Draft'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
