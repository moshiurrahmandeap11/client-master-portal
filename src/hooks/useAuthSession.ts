'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/axios';

export interface AuthSessionData {
  isLoggedIn: boolean;
  role?: 'candidate' | 'admin' | null;
  user?: any;
  impersonatingName?: string | null;
}

export function useAuthSession() {
  const queryClient = useQueryClient();

  const query = useQuery<AuthSessionData>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/api/auth/me');
        if (!res.ok) {
          return { isLoggedIn: false };
        }
        const data = await res.json();
        return {
          isLoggedIn: !!data?.isLoggedIn,
          role: data?.role || null,
          user: data?.user || null,
          impersonatingName: data?.impersonatingName || null,
        };
      } catch {
        return { isLoggedIn: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['auth'] });

  return {
    ...query,
    session: query.data || { isLoggedIn: false },
    invalidate,
  };
}

export default useAuthSession;
