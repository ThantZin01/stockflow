import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { AuthAlert, AuthField, AuthSubmit } from '../components/auth/AuthField.jsx';
import { useAuth } from '../hooks/useAuth.js';

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
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
      await register(formData);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="The first user becomes admin. Everyone else starts as staff."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-teal-700 underline-offset-2 hover:text-teal-600 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="name"
          name="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Alex Morgan"
          value={formData.name}
          onChange={handleChange}
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          minLength={6}
          hint="Minimum 6 characters."
          value={formData.password}
          onChange={handleChange}
        />
        <AuthSubmit disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
};