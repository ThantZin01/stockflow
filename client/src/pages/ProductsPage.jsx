import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../api/categories.api.js';
import { collectPages } from '../api/collectPages.js';
import {
  archiveProduct,
  createProduct,
  fetchProducts,
  updateProduct,
} from '../api/products.api.js';
import { fetchSuppliers } from '../api/suppliers.api.js';
import { Pagination } from '../components/Pagination.jsx';
import { ProductFormModal } from '../components/ProductFormModal.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'products',
      { search: debouncedSearch, category, lowStockOnly, includeArchived, sort, page },
    ],
    queryFn: () =>
      fetchProducts({
        search: debouncedSearch,
        category,
        lowStock: lowStockOnly ? 'true' : '',
        includeArchived: includeArchived ? 'true' : 'false',
        sort,
        page,
        limit: 10,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'options'],
    queryFn: () => collectPages((pageNumber) => fetchCategories({ page: pageNumber, limit: 200 })),
  });

  const suppliersQuery = useQuery({
    queryKey: ['suppliers', 'options'],
    queryFn: () => collectPages((pageNumber) => fetchSuppliers({ page: pageNumber, limit: 200 })),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setErrorMessage('');
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingProduct
        ? updateProduct({ id: editingProduct._id, ...payload })
        : createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      closeModal();
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err) => setErrorMessage(err.message),
  });

  const products = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };
  const categories = categoriesQuery.data || [];
  const suppliers = suppliersQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage catalog, pricing, and reorder thresholds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setErrorMessage('');
            setModalOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or SKU..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="price_asc">Sale Price: Low to High</option>
            <option value="price_desc">Sale Price: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-indigo-600"
            />
            Low stock only (quantity &le; reorder level)
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => {
                setIncludeArchived(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-indigo-600"
            />
            Show archived products
          </label>
        </div>
      </div>

      {errorMessage && !modalOpen && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">Loading products...</div>
        )}
        {isError && (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load products: {error?.message}
          </div>
        )}
        {!isLoading && !isError && products.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">No matching products found.</div>
        )}
        {!isLoading && !isError && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">SKU / Name</th>
                  <th className="px-6 py-3">Category / Supplier</th>
                  <th className="px-6 py-3">Cost / Sale</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {products.map((prod) => {
                  const isLow = prod.quantity <= prod.reorderLevel;
                  return (
                    <tr
                      key={prod._id}
                      className={`hover:bg-slate-50 ${prod.isArchived ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/products/${prod._id}`}
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            {prod.name}
                          </Link>
                          {prod.isArchived && (
                            <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400">{prod.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div>{prod.category?.name || '—'}</div>
                        <div className="text-xs text-slate-400">{prod.supplier?.name || '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div>Sale: ${Number(prod.salePrice).toFixed(2)}</div>
                        <div className="text-xs text-slate-400">
                          Cost: ${Number(prod.costPrice).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {prod.quantity} {isLow ? `(Low ≤ ${prod.reorderLevel})` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prod);
                            setErrorMessage('');
                            setModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={archiveMutation.isPending}
                          onClick={() =>
                            archiveMutation.mutate({
                              id: prod._id,
                              isArchived: !prod.isArchived,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          {prod.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {modalOpen && (
        <ProductFormModal
          key={editingProduct?._id || 'new'}
          isOpen={modalOpen}
          onClose={closeModal}
          initialData={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSubmit={(payload) => saveMutation.mutate(payload)}
          isSubmitting={saveMutation.isPending}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};
