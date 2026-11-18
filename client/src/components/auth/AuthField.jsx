import { useState } from 'react';
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
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          className={`block w-full rounded-xl border border-slate-300 bg-slate-50/80 py-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm ${
            icon ? 'pl-10' : 'pl-4'
          } ${isPassword ? 'pr-16' : 'pr-4'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-500 hover:text-teal-700 cursor-pointer"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

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
    className="mt-1 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
