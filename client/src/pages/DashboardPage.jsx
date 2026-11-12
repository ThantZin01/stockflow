import { useQuery } from '@tanstack/react-query';
import { getHealthStatus } from '../api/health.api.js';
import { useAuth } from '../hooks/useAuth.js';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: getHealthStatus,
  });

  const health = data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back, <span className="font-medium text-slate-900">{user?.name}</span>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          System Status
        </h2>

        {isLoading && <p className="mt-3 text-sm text-slate-500">Checking backend status...</p>}

        {isError && (
          <p className="mt-3 text-sm text-red-600">Unable to reach API: {error?.message}</p>
        )}

        {!isLoading && !isError && health && (
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <dt className="text-xs text-slate-500">API Status</dt>
              <dd className="mt-1 text-lg font-semibold text-emerald-600 uppercase">
                {health.status}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <dt className="text-xs text-slate-500">Database</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900 capitalize">
                {health.database}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <dt className="text-xs text-slate-500">Current Role</dt>
              <dd className="mt-1 text-lg font-semibold text-indigo-600 capitalize">
                {user?.role}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
};
