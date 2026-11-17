import { Modal } from './Modal.jsx';

const STATUS_BADGE = {
  pending: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export const SalesOrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <Modal isOpen={!!order} title={`Sales Order ${order.orderNumber}`} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
          <div>
            <span className="text-slate-500">Status: </span>
            <span
              className={`rounded px-2 py-0.5 font-medium uppercase ${
                STATUS_BADGE[order.status] || ''
              }`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Customer: </span>
            <span className="font-medium text-slate-900">{order.customerName}</span>
          </div>
          <div>
            <span className="text-slate-500">Phone: </span>
            <span className="text-slate-800">{order.customerPhone || '—'}</span>
          </div>
          <div>
            <span className="text-slate-500">Created by: </span>
            <span className="text-slate-800">{order.createdBy?.name || '—'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Created: </span>
            <span className="text-slate-800">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-left font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="font-mono text-slate-500">{item.sku}</div>
                  </td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center border-t border-slate-200 pt-3 font-semibold">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>
    </Modal>
  );
};
