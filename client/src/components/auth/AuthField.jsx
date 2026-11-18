import { Link } from 'react-router-dom';

export const AuthField = ({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  autoComplete,
  placeholder,
  required = true,
  minLength,
  hint,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minLength={minLength}
      className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-slate-50/80 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm"
    />
    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
);

export const AuthAlert = ({ variant = 'error', children }) => (
  <div
    className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
      variant === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-teal-200 bg-teal-50 text-teal-900'
    }`}
    role="alert"
  >
    {children}
  </div>
);

export const AuthSubmit = ({ disabled, children }) => (
  <button
    type="submit"
    disabled={disabled}
    className="mt-1 flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {children}
  </button>
);

export const AuthLink = ({ to, children }) => (
  <Link
    to={to}
    className="font-semibold text-teal-700 underline-offset-2 hover:text-teal-600 hover:underline"
  >
    {children}
  </Link>
);