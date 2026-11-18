import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { AuthAlert, AuthField, AuthSubmit } from '../components/auth/AuthField.jsx';
import { useAuth } from '../hooks/useAuth.js';

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
        />
        <AuthSubmit disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
};