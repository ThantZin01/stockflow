import { Link } from 'react-router-dom';

const highlights = [
  'Real-time stock and low-stock alerts',
  'Purchase and sales order workflows',
  'Dashboard KPIs priced in MMK',
];

const BrandMark = ({ variant = 'dark' }) => (
  <div className="flex items-center gap-2.5">
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
        variant === 'dark'
          ? 'bg-white/10 text-white ring-1 ring-white/20'
          : 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
      }`}
    >
      SF
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
    <div className="grid min-h-screen min-h-[100dvh] lg:grid-cols-[1fr_minmax(0,28rem)] xl:grid-cols-[1.1fr_minmax(0,32rem)] 2xl:grid-cols-[1.2fr_34rem]">
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/30 via-transparent to-transparent"
          aria-hidden
        />
        <div
          className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10">
          <Link to="/login" className="inline-block hover:opacity-90 transition-opacity">
            <BrandMark variant="dark" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
            Inventory control built for busy shops
          </h1>
          <p className="text-base text-teal-100/80 leading-relaxed">
            Track products, suppliers, and orders in one place. Prices and reports use{' '}
            <span className="font-medium text-amber-200">MMK</span> by default.
          </p>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-200/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          StockFlow · Inventory &amp; order management
        </p>
      </section>

      <section className="flex flex-col bg-slate-100 text-slate-900 lg:bg-gradient-to-b lg:from-slate-100 lg:to-slate-200/80">
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

        <div className="flex flex-1 flex-col justify-center px-4 pb-8 pt-2 sm:px-6 sm:pb-10 lg:px-10 xl:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 hidden lg:block">
              <BrandMark variant="light" />
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{subtitle}</p>
            </div>

            <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl lg:hidden">{title}</h2>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-8 ring-1 ring-slate-900/5">
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
          </div>
        </div>
      </section>
    </div>
  </div>
);