'use client';

import { useCallback, useEffect, useState } from 'react';
import { authService, loginService } from '@/services';
import type { AdminLoginRequest } from '@/types';

export function useAdminSession(autoCheck = true) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(autoCheck);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const isAdmin = Boolean(data?.isLoggedIn && (data?.role === 'admin' || data?.user?.role === 'admin'));
        setIsAuthenticated(isAdmin);
        return isAdmin;
      }
      setIsAuthenticated(false);
      return false;
    } catch {
      setIsAuthenticated(false);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  const login = useCallback(async (payload: AdminLoginRequest) => {
    setError(null);
    try {
      const res = await loginService.adminLogin(payload);
      if (res.success) {
        setIsAuthenticated(true);
      }
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'অ্যাডমিন লগইন ব্যর্থ হয়েছে';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkSession().catch(() => {});
    }
  }, [autoCheck, checkSession]);

  return { isAuthenticated, setIsAuthenticated, checking, error, checkSession, login, logout };
}
