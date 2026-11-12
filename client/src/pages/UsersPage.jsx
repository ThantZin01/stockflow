import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchUsers, updateUserRole, updateUserStatus } from '../api/users.api.js';
import { useAuth } from '../hooks/useAuth.js';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', { page, limit }],
    queryFn: () => fetchUsers({ page, limit }),
  });

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => setActionError(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => setActionError(err.message),
  });

  const users = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-600">Manage staff roles and account access.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">Total users: {meta.total}</span>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">Loading users...</div>
        )}

        {isError && (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load users: {error?.message}
          </div>
        )}

        {!isLoading && !isError && users.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">No users found.</div>
        )}

        {!isLoading && !isError && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((item) => {
                  const isSelf = item._id === currentUser?._id;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item.name}
                        {isSelf && <span className="ml-2 text-xs text-slate-400">(You)</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={item.role}
                          disabled={isSelf || roleMutation.isPending}
                          onChange={(e) =>
                            roleMutation.mutate({ id: item._id, role: e.target.value })
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 disabled:opacity-50"
                        >
                          <option value="staff">staff</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={isSelf || statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: item._id,
                              isActive: !item.isActive,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-600">
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
