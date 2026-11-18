export const StatCard = ({ label, value, subtext, accent = 'text-slate-900' }) => (
  <div className="bg-white/90 rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm ring-1 ring-slate-900/5">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
  </div>
);
