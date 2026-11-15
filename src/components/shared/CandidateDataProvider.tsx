'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CandidateDocument, CandidateProfile } from '@/types';
import { storage } from '@/lib/store';
import { fetchWithAuth } from '@/lib/axios';

interface CandidateData {
  profile: CandidateProfile | null;
  documents: CandidateDocument[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const Context = createContext<CandidateData>({
  profile: null,
  documents: [],
  loading: true,
  refresh: async () => {},
});

export function CandidateDataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Primary Candidate Profile Query (Cached in TanStack Query)
  const profileQuery = useQuery({
    queryKey: ['candidate', 'profile'],
    queryFn: async (): Promise<CandidateProfile | null> => {
      const res = await fetchWithAuth('/api/profile');
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) {
        throw new Error('Failed to load candidate profile');
      }
      const data = await res.json();
      return (data.profile || data.user || null) as CandidateProfile | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh in memory
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  // Candidate Documents Query
  const documentsQuery = useQuery({
    queryKey: ['candidate', 'documents'],
    queryFn: async (): Promise<CandidateDocument[]> => {
      // First check if profile already brought documents to prevent extra query
      if (profileQuery.data && Array.isArray((profileQuery.data as any).documents) && (profileQuery.data as any).documents.length > 0) {
        return (profileQuery.data as any).documents;
      }
      const res = await fetchWithAuth('/api/documents');
      if (res.status === 401) {
        return [];
      }
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return Array.isArray(data.documents) ? data.documents : [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  // Sync to local storage for fast hydration & offline readiness
  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      storage.setAuth({
        isLoggedIn: true,
        role: 'candidate',
        userId: p.id,
        name: p.name,
        phone: p.phone || '',
        email: p.email || '',
      });
      storage.updateUser(p);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cs_user_changed'));
      }
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (documentsQuery.data && documentsQuery.data.length > 0) {
      storage.replaceDocuments(documentsQuery.data);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cs_docs_changed'));
      }
    }
  }, [documentsQuery.data]);

  // Synchronous initial fallback from storage while query settles
  const cachedAuth = typeof window !== 'undefined' ? storage.getAuth() : { isLoggedIn: false };
  const cachedUser = cachedAuth.isLoggedIn && (cachedAuth as any).role === 'candidate' ? storage.getUser() : null;
  const cachedDocs = cachedAuth.isLoggedIn ? storage.getDocuments() : [];

  const profile = profileQuery.data ?? (profileQuery.isLoading ? cachedUser : null);
  const documents = (documentsQuery.data && documentsQuery.data.length > 0) 
    ? documentsQuery.data 
    : (Array.isArray((profileQuery.data as any)?.documents) && (profileQuery.data as any)?.documents.length > 0)
      ? (profileQuery.data as any).documents
      : (documentsQuery.isLoading ? cachedDocs : []);

  const loading = profileQuery.isLoading && !cachedUser;

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['candidate'] }),
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
    ]);
    await Promise.all([
      profileQuery.refetch(),
      documentsQuery.refetch(),
    ]);
  }, [queryClient, profileQuery, documentsQuery]);

  const value = useMemo(
    () => ({ profile, documents, loading, refresh }),
    [profile, documents, loading, refresh]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCandidateData() {
  return useContext(Context);
}

export default CandidateDataProvider;
