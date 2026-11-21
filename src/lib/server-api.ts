import { JobCircular, PageRecord } from '@/types';

const getBackendBaseUrl = () =>
  (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6969').replace(/\/+$/, '');

async function fetchBackendJson(path: string, revalidateSeconds = 30): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${getBackendBaseUrl()}${path}`, {
      next: revalidateSeconds === 0 ? { revalidate: 0 } : { revalidate: revalidateSeconds },
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const DEFAULT_SETTINGS_SHAPE = {
  id: 'global',
  siteName: 'চাকরি সেবা',
  tagline: 'বাংলাদেশের বিশ্বস্ত সরকারি ও ব্যাংক চাকরি আবেদন প্ল্যাটফর্ম',
  contactEmail: 'support@chakrisheba.com',
  supportPhone: '',
  general: {
    siteName: 'চাকরি সেবা',
    tagline: 'বাংলাদেশের বিশ্বস্ত সরকারি ও ব্যাংক চাকরি আবেদন প্ল্যাটফর্ম',
    contactEmail: 'support@chakrisheba.com',
    supportPhone: '',
    whatsappNumber: '',
    heroHeadline: 'সঠিক তথ্যে নির্ভুল সরকারি ও ব্যাংক চাকরি আবেদন',
    footerCopyright: `© ${new Date().getFullYear()} চাকরি সেবা (Chakri Sheba)। সর্বস্বত্ব সংরক্ষিত।`,
  },
  workflow: {
    defaultServiceFee: 50,
    autoVerifyEmails: false,
    allowWalletSplit: true,
    enableAiResumeImport: true,
  },
  operational: {
    maintenanceMode: false,
    allowRegistration: true,
    bkashNumber: '',
    nagadNumber: '',
  },
  headerLinks: [],
  footerLinks: { columns: [] },
  seo: {},
};

export const serverApi = {
  async getPlatformSettings() {
    const data = await fetchBackendJson('/api/cms/settings', 60);
    const live = data?.settings || data?.data;
    return live || DEFAULT_SETTINGS_SHAPE;
  },

  async getPublicStats() {
    const data = await fetchBackendJson('/api/cms/public-stats', 60);
    return (
      data?.stats ||
      data?.data || {
        publishedJobs: 0,
        totalCandidates: 0,
        totalApplications: 0,
        completedApplications: 0,
        totalSubscribers: 0,
        totalOrganizations: 0,
      }
    );
  },

  async getPublicReviews(): Promise<any[]> {
    const data = await fetchBackendJson('/api/cms/reviews', 60);
    const list = data?.reviews || data?.data;
    return Array.isArray(list) ? list : [];
  },

  async getCmsPages(): Promise<PageRecord[]> {
    const data = await fetchBackendJson('/api/cms/pages', 60);
    const list = data?.pages || data?.data;
    return Array.isArray(list) ? list : [];
  },

  async getCmsPageBySlug(slug: string): Promise<PageRecord | null> {
    const clean = slug.replace(/^\/+/, '') || 'home';
    const data = await fetchBackendJson(`/api/cms/pages/${encodeURIComponent(clean)}`, 60);
    const page = data?.page || data?.data;
    if (page && page.status === 'published') return page as PageRecord;
    return null;
  },

  async getContentPosts(kind?: 'blog' | 'guide'): Promise<any[]> {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    const data = await fetchBackendJson(`/api/cms/content${q}`, 60);
    const list = data?.posts || data?.data;
    return Array.isArray(list) ? list : [];
  },

  async getContentPostBySlug(slug: string): Promise<any | null> {
    const data = await fetchBackendJson(`/api/cms/content/${encodeURIComponent(slug)}`, 60);
    return data?.post || data?.data || null;
  },

  async getPublicJobs(limit = 100): Promise<JobCircular[]> {
    const data = await fetchBackendJson(`/api/jobs?limit=${limit}`, 30);
    const list = data?.jobs || data?.data;
    return Array.isArray(list) ? (list as JobCircular[]) : [];
  },

  async getJobFeed(
    feed: 'latest-jobs' | 'todays-jobs' | 'closing-soon' | 'deadline-today' | 'featured-jobs' | 'updated-circulars',
  ): Promise<JobCircular[]> {
    const data = await fetchBackendJson(`/api/jobs/${feed}`, 30);
    const list = data?.jobs || data?.data;
    return Array.isArray(list) ? (list as JobCircular[]) : [];
  },

  async getDailyJobs(date?: string): Promise<JobCircular[]> {
    const path = date ? `/api/jobs/daily/${encodeURIComponent(date)}` : '/api/jobs/daily';
    const data = await fetchBackendJson(path, 30);
    const list = data?.jobs || data?.data;
    return Array.isArray(list) ? (list as JobCircular[]) : [];
  },

  async getJobByIdOrSlug(idOrSlug: string): Promise<JobCircular | null> {
    const data = await fetchBackendJson(`/api/jobs/${encodeURIComponent(idOrSlug)}`, 0);
    const job = data?.job || data?.data;
    if (job && (job.id || job.slug)) return job as JobCircular;
    return null;
  },

  async getCategories(): Promise<any[]> {
    const data = await fetchBackendJson('/api/jobs/categories', 60);
    const list = data?.data || data?.categories;
    if (!Array.isArray(list)) return [];
    const bySlug = new Map<string, any>();
    list.forEach((c: any) => bySlug.set(c.slug, c));
    return list.map((c: any) => {
      const parent = c.parentSlug ? bySlug.get(c.parentSlug) : null;
      return {
        ...c,
        id: c.id,
        slug: c.slug,
        name_bn: c.titleBn || c.name_bn || c.titleEn || c.slug,
        name_en: c.titleEn || c.name_en || c.slug,
        description_bn: c.description || c.description_bn || '',
        icon: c.icon || 'Briefcase',
        parent_id: parent?.id || c.parent_id || null,
        is_active: c.isActive !== false && c.is_active !== false,
        order_index: c.orderIndex ?? c.order_index ?? 0,
        seo_title: c.seo_title || `${c.titleBn || c.titleEn} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`,
        seo_description: c.seo_description || c.description || '',
      };
    });
  },

  async getOrganizations(): Promise<any[]> {
    const data = await fetchBackendJson('/api/jobs/organizations', 60);
    const list = data?.organizations || data?.data;
    return Array.isArray(list) ? list : [];
  },

  async getOrganizationBySlug(slug: string): Promise<{ organization: any; jobs: JobCircular[] } | null> {
    const data = await fetchBackendJson(`/api/jobs/organizations/${encodeURIComponent(slug)}`, 30);
    if (!data?.organization) return null;
    return {
      organization: data.organization,
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
    };
  },
};
