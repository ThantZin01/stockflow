import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createSupplier,
  deleteSupplier,
  fetchSupplierById,
  fetchSuppliers,
  updateSupplier,
} from '../api/suppliers.api.js';
import { Modal } from '../components/Modal.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useAuth } from '../hooks/useAuth.js';

const emptySupplier = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
};

export const SuppliersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [formData, setFormData] = useState(emptySupplier);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['suppliers', { page }],
    queryFn: () => fetchSuppliers({ page, limit: 15 }),
  });

  const detailQuery = useQuery({
    queryKey: ['supplier', selectedSupplierId],
    queryFn: () => fetchSupplierById(selectedSupplierId),
    enabled: Boolean(selectedSupplierId),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingSupplier(null);
    setFormData(emptySupplier);
    setErrorMessage('');
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingSupplier
        ? updateSupplier({ id: editingSupplier._id, ...payload })
        : createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      closeModal();
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const openCreate = () => {
    setEditingSupplier(null);
    setFormData(emptySupplier);
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      contactName: sup.contactName || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const suppliers = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };
  const detailData = detailQuery.data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage vendor contacts and view supplied products.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 cursor-pointer"
        >
          + Add Supplier
        </button>
      </div>

      {errorMessage && !modalOpen && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">Loading suppliers...</div>
        )}
        {isError && (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load suppliers: {error?.message}
          </div>
        )}
        {!isLoading && !isError && suppliers.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No suppliers found. Click &ldquo;+ Add Supplier&rdquo; to create one.
          </div>
        )}
        {!isLoading && !isError && suppliers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Email / Phone</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {suppliers.map((sup) => (
                  <tr key={sup._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{sup.name}</td>
                    <td className="px-6 py-4 text-slate-600">{sup.contactName || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{sup.email || '—'}</div>
                      <div className="text-xs text-slate-400">{sup.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSupplierId(sup._id)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                      >
                        Products
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(sup)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Edit
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(sup._id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        onClose={closeModal}
      >
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData((p) => ({ ...p, contactName: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedSupplierId)}
        title={detailData?.supplier?.name || 'Supplier Details'}
        onClose={() => setSelectedSupplierId(null)}
      >
        {detailQuery.isLoading && (
          <p className="text-sm text-slate-500">Loading supplier details...</p>
        )}
        {detailData && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1 text-xs text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Contact:</span>{' '}
                {detailData.supplier.contactName || '—'}
              </p>
              <p>
                <span className="font-medium text-slate-800">Email:</span>{' '}
                {detailData.supplier.email || '—'}
              </p>
              <p>
                <span className="font-medium text-slate-800">Phone:</span>{' '}
                {detailData.supplier.phone || '—'}
              </p>
              <p>
                <span className="font-medium text-slate-800">Address:</span>{' '}
                {detailData.supplier.address || '—'}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Supplied Products ({detailData.products.length})
              </h3>
              {detailData.products.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No active products assigned to this supplier.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                  {detailData.products.map((prod) => (
                    <li
                      key={prod._id}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <div>
                        <Link
                          to={`/products/${prod._id}`}
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          {prod.name}
                        </Link>
                        <span className="ml-2 text-slate-400">({prod.sku})</span>
                      </div>
                      <span className="text-slate-700 font-medium">Qty: {prod.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
