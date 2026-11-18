import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { collectPages } from '../api/collectPages.js';
import { fetchProducts } from '../api/products.api.js';
import {
  createPurchaseOrder,
  fetchPurchaseOrders,
  markPurchaseOrderOrdered,
  receivePurchaseOrder,
  updatePurchaseOrder,
} from '../api/purchaseOrders.api.js';
import { fetchSuppliers } from '../api/suppliers.api.js';
import { Pagination } from '../components/Pagination.jsx';
import { PurchaseOrderDetailModal } from '../components/PurchaseOrderDetailModal.jsx';
import { PurchaseOrderFormModal } from '../components/PurchaseOrderFormModal.jsx';

const STATUS_BADGE = {
  draft: 'bg-slate-100 text-slate-700',
  ordered: 'bg-amber-50 text-amber-700',
  received: 'bg-emerald-50 text-emerald-700',
};

export const PurchaseOrdersPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [supplier, setSupplier] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['purchase-orders', { status, supplier, page }],
    queryFn: () => fetchPurchaseOrders({ status, supplier, page, limit: 10 }),
  });

  const suppliersQuery = useQuery({
    queryKey: ['suppliers', 'options'],
    queryFn: () => collectPages((pageNumber) => fetchSuppliers({ page: pageNumber, limit: 200 })),
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'options'],
    queryFn: () =>
      collectPages((pageNumber) =>
        fetchProducts({ sort: 'name_asc', page: pageNumber, limit: 200 })
      ),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingOrder(null);
    setFormError('');
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stock'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingOrder
        ? updatePurchaseOrder({ id: editingOrder._id, ...payload })
        : createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      closeForm();
    },
    onError: (err) => setFormError(err.message),
  });

  const orderMutation = useMutation({
    mutationFn: markPurchaseOrderOrdered,
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (err) => setActionError(err.message),
  });

  const receiveMutation = useMutation({
    mutationFn: receivePurchaseOrder,
    onSuccess: () => {
      setActionError('');
      invalidateAll();
    },
    onError: (err) => setActionError(err.message),
  });

  const orders = ordersQuery.data?.data || [];
  const meta = ordersQuery.data?.meta;
  const suppliers = suppliersQuery.data || [];
  const products = productsQuery.data || [];

  const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create restock orders, submit to suppliers, and receive inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingOrder(null);
            setFormOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 cursor-pointer"
        >
          New Purchase Order
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
          </select>
          <select
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">All suppliers</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {ordersQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading purchase orders...</div>
        ) : ordersQuery.isError ? (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load purchase orders: {ordersQuery.error?.message}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No purchase orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">PO Number</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-medium text-slate-900">
                      {po.poNumber}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{po.supplier?.name || '—'}</td>
                    <td className="px-6 py-3 text-slate-600">{po.items.length}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      ${Number(po.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                          STATUS_BADGE[po.status] || ''
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(po)}
                        className="text-xs font-medium text-slate-600 hover:underline cursor-pointer"
                      >
                        View
                      </button>
                      {po.status === 'draft' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrder(po);
                              setFormOpen(true);
                            }}
                            className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={orderMutation.isPending}
                            onClick={() => orderMutation.mutate(po._id)}
                            className="text-xs font-medium text-amber-600 hover:underline cursor-pointer"
                          >
                            Mark Ordered
                          </button>
                        </>
                      )}
                      {po.status === 'ordered' && (
                        <button
                          type="button"
                          disabled={receiveMutation.isPending}
                          onClick={() => receiveMutation.mutate(po._id)}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                        >
                          Receive
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

      <PurchaseOrderFormModal
        key={editingOrder?._id || (formOpen ? 'new' : 'closed')}
        isOpen={formOpen}
        onClose={closeForm}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        isSaving={saveMutation.isPending}
        errorMessage={formError}
        suppliers={suppliers}
        products={products}
        initialOrder={editingOrder}
      />

      <PurchaseOrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
    </div>
  );
};
