'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

const api = {
  get: async <T = any>(url: string): Promise<T> => (await apiClient.get(url)).data,
  post: async <T = any>(url: string, body?: any): Promise<T> => (await apiClient.post(url, body)).data,
};

export interface PlatformSettingsData {
  id?: string;
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  supportPhone?: string;
  general?: {
    siteName?: string;
    tagline?: string;
    contactEmail?: string;
    supportPhone?: string;
    whatsappNumber?: string;
    heroHeadline?: string;
    footerCopyright?: string;
    [key: string]: any;
  };
  workflow?: {
    defaultServiceFee?: number;
    autoVerifyEmails?: boolean;
    allowWalletSplit?: boolean;
    enableAiResumeImport?: boolean;
    [key: string]: any;
  };
  operational?: {
    maintenanceMode?: boolean;
    allowRegistration?: boolean;
    bkashNumber?: string;
    nagadNumber?: string;
    [key: string]: any;
  };
  headerLinks?: any[];
  footerLinks?: any;
  seo?: any;
  [key: string]: any;
}

/**
 * Single deduped React Query hook for global platform settings.
 * Shared across Navbar, Footer, HeroSection, ApplyClient, Wallet, Contact, FAQ & Dashboard.
 */
export function usePlatformSettings(initialData?: PlatformSettingsData | null) {
  return useQuery<PlatformSettingsData>({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const res = await api.get<any>('/api/platform/settings');
      return res?.settings || res?.data || {};
    },
    initialData: initialData || undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function getPlatformContacts(settings?: PlatformSettingsData | null) {
  const bkash = (settings?.operational?.bkashNumber || '').trim();
  const nagad = (settings?.operational?.nagadNumber || '').trim();
  const supportPhone = (settings?.general?.supportPhone || settings?.supportPhone || '').trim();
  const whatsappNumber = (settings?.general?.whatsappNumber || '').trim();
  const contactEmail = (settings?.general?.contactEmail || settings?.contactEmail || 'support@chakrisheba.com').trim();
  return {
    bkashNumber: bkash,
    nagadNumber: nagad,
    supportPhone,
    whatsappNumber,
    contactEmail,
  };
}

export function usePublicStats(initialData?: any) {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const res = await api.get<any>('/api/cms/public-stats');
      return res?.stats || res?.data || {};
    },
    initialData: initialData || undefined,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePublicReviews(initialData?: any[]) {
  return useQuery<any[]>({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const res = await api.get<any>('/api/cms/reviews');
      return Array.isArray(res?.reviews) ? res.reviews : Array.isArray(res?.data) ? res.data : [];
    },
    initialData: initialData || undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useExamResource<T = any>(
  resource: 'admit-cards' | 'notices' | 'results' | 'viva-notices' | 'questions' | 'model-tests',
  params?: Record<string, string>,
) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = `/api/exams/${resource}${queryString ? `?${queryString}` : ''}`;

  return useQuery<T[]>({
    queryKey: ['exams', resource, queryString],
    queryFn: async () => {
      const res = await api.get<any>(url);
      const list = res?.data ?? res?.items ?? res;
      return Array.isArray(list) ? list : [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCmsContent(kind: 'blog' | 'guide') {
  return useQuery<any[]>({
    queryKey: ['cms-content', kind],
    queryFn: async () => {
      const res = await api.get<any>(`/api/cms/content?kind=${kind}`);
      const list = res?.posts ?? res?.data;
      return Array.isArray(list) ? list : [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCmsContentDetail(slug: string) {
  return useQuery<any | null>({
    queryKey: ['cms-content-detail', slug],
    queryFn: async () => {
      const res = await api.get<any>(`/api/cms/content/${encodeURIComponent(slug)}`);
      return res?.post ?? res?.data ?? null;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCandidatePerformance(enabled = true) {
  return useQuery<any>({
    queryKey: ['candidate-performance'],
    queryFn: async () => {
      const res = await api.get<any>('/api/exams/my-performance');
      return res?.data ?? res;
    },
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCandidateCalendar(enabled = true) {
  return useQuery<any>({
    queryKey: ['candidate-calendar'],
    queryFn: async () => {
      const res = await api.get<any>('/api/exams/calendar');
      return res?.data ?? res;
    },
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitModelTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      modelTestId,
      answers,
      durationSec,
    }: {
      modelTestId: string;
      answers: Record<string, number>;
      durationSec?: number;
    }) => {
      const res = await api.post<any>(`/api/exams/model-tests/${modelTestId}/submit`, {
        answers,
        durationSec,
      });
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-performance'] });
    },
  });
}
