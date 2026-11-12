'use client';

import { useCallback, useEffect, useState } from 'react';
import { authService, loginService } from '@/services';
import type { AuthState, AuthUser, LoginRequest, RegisterRequest } from '@/types';

const INITIAL_AUTH: AuthState = {
  isLoggedIn: false,
  role: null,
  name: '',
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(INITIAL_AUTH);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data?.isLoggedIn && data?.user) {
          setUser(data.user);
          setAuth({
            isLoggedIn: true,
            role: data.role || (data.user.role === 'admin' ? 'admin' : 'candidate'),
            name: data.user.name || data.user.nameBn || 'চাকরিপ্রার্থী',
            email: data.user.email || '',
            phone: data.user.phone || '',
            userId: data.user.id || '',
          });
          return data.user as AuthUser;
        }
      }
      setUser(null);
      setAuth(INITIAL_AUTH);
      return null;
    } catch {
      setUser(null);
      setAuth(INITIAL_AUTH);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
    const handleChange = () => {
      refreshSession();
    };
    window.addEventListener('cs_auth_changed', handleChange);
    window.addEventListener('cs_auth_unauthorized', handleChange);
    return () => {
      window.removeEventListener('cs_auth_changed', handleChange);
      window.removeEventListener('cs_auth_unauthorized', handleChange);
    };
  }, [refreshSession]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const result = await loginService.login(payload);
      if (result.success) {
        window.dispatchEvent(new Event('cs_auth_changed'));
        await refreshSession();
      }
      return result;
    },
    [refreshSession]
  );

  const register = useCallback(async (payload: RegisterRequest) => {
    return loginService.register(payload);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAuth(INITIAL_AUTH);
    window.dispatchEvent(new Event('cs_auth_changed'));
  }, []);

  return {
    auth,
    user,
    loading,
    isLoggedIn: auth.isLoggedIn,
    refreshSession,
    login,
    register,
    logout,
  };
}
