import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginUser, registerUser } from '../api/auth.api.js';
import { TOKEN_STORAGE_KEY } from '../api/axios.js';
import { AuthContext } from './auth-context.js';

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
  );

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('stockflow:unauthorized', onUnauthorized);
    return () => window.removeEventListener('stockflow:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return;
    }

    let isMounted = true;

    fetchCurrentUser()
      .then((res) => {
        if (isMounted) {
          setUser(res.data);
        }
      })
      .catch((error) => {
        // Network and 429 failures keep the token so a reload can recover.
        // 401/403 mean the session itself was rejected.
        if (error.statusCode === 401 || error.statusCode === 403) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);
    const { token, user: loggedInUser } = res.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerUser(payload);
    const { token, user: registeredUser } = res.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
