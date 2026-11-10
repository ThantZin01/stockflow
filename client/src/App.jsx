import { useQuery } from '@tanstack/react-query';
import { Link, Route, Routes } from 'react-router-dom';
import { getHealthStatus } from './api/health.api.js';

const HomePage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: getHealthStatus,
    retry: 1,
  });

  const health = data?.data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">StockFlow</h1>
            <p className="text-sm text-slate-500">Inventory &amp; Order Management System</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Phase 1 — Setup
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">API Health Check</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {isLoading && <p className="text-sm text-slate-500">Checking backend connection...</p>}

          {isError && (
            <div className="text-sm text-red-600">
              <p className="font-medium">Unable to reach API</p>
              <p className="text-xs mt-1">{error?.message}</p>
            </div>
          )}

          {!isLoading && !isError && health && (
            <dl className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div>
                <dt className="text-xs text-slate-500">API Status</dt>
                <dd className="font-medium text-emerald-600 uppercase">{health.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Database</dt>
                <dd className="font-medium text-slate-800 capitalize">{health.database}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Timestamp</dt>
                <dd className="font-mono text-xs text-slate-600">{health.timestamp}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-4xl font-bold text-slate-900">404</h1>
    <p className="mt-2 text-slate-600">Page not found.</p>
    <Link
      to="/"
      className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
    >
      Back to Home
    </Link>
  </div>
);

export const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
