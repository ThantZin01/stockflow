import { Link } from 'react-router-dom';

const highlights = [
  'Real-time stock levels & low-stock alerts',
  'Transactional purchase & sales order workflows',
  'Dashboard KPIs & valuation reports in MMK',
];

const previewMetrics = [
  { label: 'Active SKUs', value: '30', trend: '+12%' },
  { label: 'Low Stock', value: '5', trend: 'Alerts' },
  { label: 'Order Sync', value: '100%', trend: 'Atomic' },
];

const BrandMark = ({ variant = 'dark' }) => (
  <div className="flex items-center gap-2.5">
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        variant === 'dark'
          ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30'
          : 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
      }`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    </span>
    <span
      className={`text-xl font-semibold tracking-tight ${
        variant === 'dark' ? 'text-white' : 'text-slate-900'
      }`}
    >
      StockFlow
    </span>
  </div>
);

export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100">
    <div className="grid min-h-screen min-h-[100dvh] lg:grid-cols-[1fr_minmax(0,28rem)] xl:grid-cols-[1.15fr_minmax(0,32rem)] 2xl:grid-cols-[1.2fr_34rem]">
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-25 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/30 via-transparent to-transparent"
          aria-hidden
        />
        <div
          className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/login" className="inline-block hover:opacity-90 transition-opacity">
            <BrandMark variant="dark" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-200 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Inventory Platform
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-7 my-auto py-8">
          <div className="space-y-4">
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
              Inventory control built for busy shops
            </h1>
            <p className="text-base text-teal-100/80 leading-relaxed">
              Track products, suppliers, and orders in one place. Prices and reports use{' '}
              <span className="font-medium text-amber-200">MMK</span> by default.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200/95">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-200/90">
                Operations Overview
              </span>
              <span className="rounded-md bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                MongoDB Transactions
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {previewMetrics.map((m) => (
                <div key={m.label} className="rounded-xl bg-slate-950/50 p-3 ring-1 ring-white/10">
                  <p className="text-[11px] text-slate-400">{m.label}</p>
                  <p className="mt-1 text-lg font-bold text-white">{m.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-teal-300">{m.trend}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          StockFlow · Inventory &amp; order management
        </p>
      </section>

      <section className="flex flex-col bg-slate-100 text-slate-900 lg:bg-gradient-to-b lg:from-slate-50 lg:to-slate-200/80">
        <div className="relative overflow-hidden px-5 pt-8 pb-5 lg:hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950"
            aria-hidden
          />
          <div className="relative flex items-center justify-between">
            <BrandMark variant="dark" />
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-200 ring-1 ring-white/15">
              MMK
            </span>
          </div>
          <p className="relative mt-3 text-sm text-slate-300/90">{subtitle}</p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 pb-8 pt-6 sm:px-6 sm:pb-10 lg:px-10 xl:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 hidden lg:block">
              <BrandMark variant="light" />
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{subtitle}</p>
            </div>

            <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl lg:hidden">{title}</h2>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />
              <div className="p-6 sm:p-8">{children}</div>
            </div>

            {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
          </div>
        </div>
      </section>
    </div>
  </div>
);
