import { useState } from 'react';
import { Modal } from './Modal.jsx';

export const ProductFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  categories = [],
  suppliers = [],
  onSubmit,
  isSubmitting = false,
  errorMessage = '',
}) => {
  const isEditing = Boolean(initialData?._id);

  const [formData, setFormData] = useState(() => ({
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category?._id || initialData?.category || categories[0]?._id || '',
    supplier: initialData?.supplier?._id || initialData?.supplier || suppliers[0]?._id || '',
    costPrice: initialData?.costPrice ?? '',
    salePrice: initialData?.salePrice ?? '',
    reorderLevel: initialData?.reorderLevel ?? 5,
    initialQuantity: 0,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      supplier: formData.supplier,
      costPrice: Number(formData.costPrice),
      salePrice: Number(formData.salePrice),
      reorderLevel: Number(formData.reorderLevel),
    };

    if (!isEditing) {
      payload.initialQuantity = Number(formData.initialQuantity) || 0;
    }

    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} title={isEditing ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">SKU *</label>
            <input
              name="sku"
              type="text"
              required
              value={formData.sku}
              onChange={handleChange}
              placeholder="SKU-001"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Name *</label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Wireless Mouse"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">Category *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Supplier *</label>
            <select
              name="supplier"
              required
              value={formData.supplier}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select supplier</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">Cost Price (MMK) *</label>
            <input
              name="costPrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.costPrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Sale Price (MMK) *</label>
            <input
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.salePrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Reorder Level *</label>
            <input
              name="reorderLevel"
              type="number"
              min="0"
              step="1"
              required
              value={formData.reorderLevel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {!isEditing && (
          <div>
            <label className="block text-xs font-medium text-slate-700">Initial Quantity</label>
            <input
              name="initialQuantity"
              type="number"
              min="0"
              step="1"
              value={formData.initialQuantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
