import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/stock', label: 'Stock' },
  { to: '/purchase-orders', label: 'Purchase Orders' },
  { to: '/sales-orders', label: 'Sales Orders' },
  { to: '/reports', label: 'Reports' },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const links =
    user?.role === 'admin' ? [...navItems, { to: '/users', label: 'Users (Admin)' }] : navItems;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-100 text-slate-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[min(18rem,88vw)] bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 text-slate-100 flex flex-col shadow-2xl transition-transform duration-200 ease-out md:static md:w-64 md:translate-x-0 md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/10">
          <span className="text-lg font-bold tracking-tight text-white">StockFlow</span>
          <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-200 uppercase tracking-wide">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-slate-400">
          <p className="truncate">
            Signed in as <span className="text-slate-200 font-medium">{user?.email}</span>
          </p>
          <p className="mt-1 text-teal-400/80">Prices shown in MMK</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-14 sm:h-16 bg-white/90 border-b border-slate-200/80 backdrop-blur-md px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Open menu"
              className="md:hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 cursor-pointer"
            >
              Menu
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate md:hidden">StockFlow</p>
              <p className="text-sm font-medium text-slate-600 hidden md:block truncate">
                Inventory &amp; order management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 max-w-[10rem] md:max-w-none truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};