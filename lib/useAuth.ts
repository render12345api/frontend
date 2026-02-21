import { useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  credits: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const { user } = await response.json();
        setState({ user, loading: false, error: null });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('[v0] Auth check failed:', error);
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, confirmPassword: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
        credentials: 'include',
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { user } = await response.json();
      setState({ user, loading: false, error: null });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { user } = await response.json();
      setState({ user, loading: false, error: null });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      console.error('[v0] Logout failed:', error);
    }
  }, []);

  return {
    ...state,
    signup,
    login,
    logout,
    checkAuth,
  };
}
