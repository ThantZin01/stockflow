import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../api/categories.api.js';
import { Modal } from '../components/Modal.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useAuth } from '../hooks/useAuth.js';

export const CategoriesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories', { page }],
    queryFn: () => fetchCategories({ page, limit: 20 }),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setErrorMessage('');
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingCategory
        ? updateCategory({ id: editingCategory._id, ...payload })
        : createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const categories = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-600">Organize products into categories.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 cursor-pointer"
        >
          + Add Category
        </button>
      </div>

      {errorMessage && !modalOpen && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">Loading categories...</div>
        )}

        {isError && (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load categories: {error?.message}
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No categories yet. Click &ldquo;+ Add Category&rdquo; to create one.
          </div>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-6 py-4 text-slate-600">{cat.description || '—'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Edit
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(cat._id)}
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
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        onClose={closeModal}
      >
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Electronics"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
