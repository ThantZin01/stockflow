import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { collectPages } from '../api/collectPages.js';
import { fetchProducts } from '../api/products.api.js';
import {
  cancelSalesOrder,
  completeSalesOrder,
  confirmSalesOrder,
  createSalesOrder,
  fetchSalesOrders,
} from '../api/salesOrders.api.js';
import { Pagination } from '../components/Pagination.jsx';
import { SalesOrderDetailModal } from '../components/SalesOrderDetailModal.jsx';
import { SalesOrderFormModal } from '../components/SalesOrderFormModal.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { formatMMK } from '../utils/currency.js';

const STATUS_BADGE = {
  pending: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export const SalesOrdersPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['sales-orders', { status, search: debouncedSearch, page }],
    queryFn: () => fetchSalesOrders({ status, search: debouncedSearch, page, limit: 10 }),
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'options'],
    queryFn: () =>
      collectPages((pageNumber) =>
        fetchProducts({ sort: 'name_asc', page: pageNumber, limit: 200 })
      ),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stock'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };

  const createMutation = useMutation({
    mutationFn: createSalesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      setFormOpen(false);
      setFormError('');
    },
    onError: (err) => setFormError(err.message),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmSalesOrder,
    onSuccess: () => {
      setActionError('');
      invalidateAll();
    },
    onError: (err) => setActionError(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: completeSalesOrder,
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
    onError: (err) => setActionError(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSalesOrder,
    onSuccess: () => {
      setActionError('');
      invalidateAll();
    },
    onError: (err) => setActionError(err.message),
  });

  const isActing =
    confirmMutation.isPending || completeMutation.isPending || cancelMutation.isPending;

  const orders = ordersQuery.data?.data || [];
  const meta = ordersQuery.data?.meta;
  const products = productsQuery.data || [];

  const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create customer orders, confirm stock deductions, and track fulfillment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError('');
            setFormOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 cursor-pointer"
        >
          New Sales Order
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order # or customer..."
            className={`${inputClass} w-64`}
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {ordersQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading sales orders...</div>
        ) : ordersQuery.isError ? (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load sales orders: {ordersQuery.error?.message}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No sales orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((so) => (
                  <tr key={so._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-medium text-slate-900">
                      {so.orderNumber}
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-slate-900">{so.customerName}</div>
                      {so.customerPhone && (
                        <div className="text-xs text-slate-500">{so.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{so.items.length}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      ${Number(so.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                          STATUS_BADGE[so.status] || ''
                        }`}
                      >
                        {so.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(so.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(so)}
                        className="text-xs font-medium text-slate-600 hover:underline cursor-pointer"
                      >
                        View
                      </button>
                      {so.status === 'pending' && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => confirmMutation.mutate(so._id)}
                          className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                      {so.status === 'confirmed' && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => completeMutation.mutate(so._id)}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {(so.status === 'pending' || so.status === 'confirmed') && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => cancelMutation.mutate(so._id)}
                          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          Cancel
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
          page={meta?.page || 1}
          totalPages={meta?.totalPages}
          total={meta?.total}
          onPageChange={setPage}
        />
      </div>

      <SalesOrderFormModal
        key={formOpen ? 'open' : 'closed'}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setFormError('');
        }}
        onSubmit={(payload) => createMutation.mutate(payload)}
        isSaving={createMutation.isPending}
        errorMessage={formError}
        products={products}
      />

      <SalesOrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
    </div>
  );
};
