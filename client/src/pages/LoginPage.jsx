import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthAlert, AuthField, AuthSubmit } from '../components/auth/AuthField.jsx';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { useAuth } from '../hooks/useAuth.js';

const MailIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requested = location.state?.from?.pathname;
  const from =
    requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fillDemo = (email, password) => {
    setErrorMessage('');
    setFormData({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage inventory, orders, and reports."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-teal-700 underline-offset-2 hover:text-teal-600 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          icon={MailIcon}
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={formData.password}
          onChange={handleChange}
          icon={LockIcon}
        />
        <AuthSubmit disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</AuthSubmit>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-xs font-medium text-slate-500 text-center">Quick demo credentials</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => fillDemo('admin@stockflow.dev', 'Admin123!')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 cursor-pointer"
          >
            Fill Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('staff@stockflow.dev', 'Staff123!')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 cursor-pointer"
          >
            Fill Staff
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
