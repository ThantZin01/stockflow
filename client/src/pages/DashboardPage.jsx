import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchReportSummary, fetchSalesReport } from '../api/reports.api.js';
import { fetchLowStock } from '../api/stock.api.js';
import { LowStockTable } from '../components/LowStockTable.jsx';
import { SalesChart } from '../components/SalesChart.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { formatMMK } from '../utils/currency.js';

export const DashboardPage = () => {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: fetchReportSummary,
  });

  const salesQuery = useQuery({
    queryKey: ['reports', 'sales', 'dashboard'],
    queryFn: () => fetchSalesReport(),
  });

  const lowStockQuery = useQuery({
    queryKey: ['stock', 'low', { page: 1, limit: 5 }],
    queryFn: () => fetchLowStock({ page: 1, limit: 5 }),
  });

  const summary = summaryQuery.data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back, <span className="font-medium text-slate-900">{user?.name}</span>.
        </p>
      </div>

      {summaryQuery.isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load dashboard metrics: {summaryQuery.error?.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={summaryQuery.isLoading ? '...' : (summary?.totalProducts ?? 0)}
          subtext="Active catalog items"
        />
        <StatCard
          label="Low Stock"
          value={summaryQuery.isLoading ? '...' : (summary?.lowStockCount ?? 0)}
          subtext="At or below reorder level"
          accent={summary?.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}
        />
        <StatCard
          label="Orders Today"
          value={summaryQuery.isLoading ? '...' : (summary?.ordersToday ?? 0)}
          subtext="Non-cancelled sales orders"
        />
        <StatCard
          label="Revenue This Month (MMK)"
          value={
            summaryQuery.isLoading ? '...' : formatMMK(summary?.revenueThisMonth ?? 0)
          }
          subtext="Confirmed & completed orders"
          accent="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Sales (Last 30 Days)</h2>
            <Link to="/reports" className="text-xs font-medium text-teal-700 hover:underline">
              Full reports &rarr;
            </Link>
          </div>
          <SalesChart
            data={salesQuery.data?.data}
            isLoading={salesQuery.isLoading}
            isError={salesQuery.isError}
            error={salesQuery.error}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Low Stock Alerts</h2>
            <Link to="/stock" className="text-xs font-medium text-teal-700 hover:underline">
              Manage stock &rarr;
            </Link>
          </div>
          <LowStockTable query={lowStockQuery} />
        </div>
      </div>
    </div>
  );
};
