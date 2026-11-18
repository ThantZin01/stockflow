import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMMK, formatMMKAxis } from '../utils/currency.js';

export const SalesChart = ({ data = [], isLoading, isError, error }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-500">
        Loading sales chart...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-red-600">
        Failed to load sales data: {error?.message}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-500">
        No confirmed or completed sales in this period.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(v) => `${formatMMKAxis(v)} MMK`}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue' ? [formatMMK(value), 'Revenue (MMK)'] : [value, 'Orders']
            }
          />
          <Area type="monotone" dataKey="revenue" stroke="#0d9488" fill="#ccfbf1" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
