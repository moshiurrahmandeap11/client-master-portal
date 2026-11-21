import { serverDB } from '@/lib/db';
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

export const serverApi = {
  async getPlatformSettings() {
    const data = await fetchBackendJson('/api/cms/settings', 60);
    const live = data?.settings || data?.data;
    if (live) return live;
    return serverDB.getPlatformSettings();
  },

  async getCmsPages(): Promise<PageRecord[]> {
    const data = await fetchBackendJson('/api/cms/pages', 60);
    const list = data?.pages || data?.data;
    if (Array.isArray(list) && list.length > 0) return list;
    return serverDB.getPages() as unknown as PageRecord[];
  },

  async getCmsPageBySlug(slug: string): Promise<PageRecord | null> {
    const clean = slug.replace(/^\/+/, '') || 'home';
    const data = await fetchBackendJson(`/api/cms/pages/${encodeURIComponent(clean)}`, 60);
    const page = data?.page || data?.data;
    if (page && page.status === 'published') return page as PageRecord;

    const fullPath = '/' + clean;
    return (serverDB.getPublishedPageBySlug(fullPath) ||
      serverDB.getPublishedPageById(clean) ||
      null) as unknown as PageRecord | null;
  },

  async getPublicJobs(limit = 100): Promise<JobCircular[]> {
    const data = await fetchBackendJson(`/api/jobs?limit=${limit}`, 30);
    const list = data?.jobs || data?.data;
    if (Array.isArray(list) && list.length > 0) return list as JobCircular[];
    return serverDB.getPublicJobs();
  },

  async getJobByIdOrSlug(idOrSlug: string): Promise<JobCircular | null> {
    const data = await fetchBackendJson(`/api/jobs/${encodeURIComponent(idOrSlug)}`, 0);
    const job = data?.job || data?.data;
    if (job && (job.id || job.slug)) return job as JobCircular;
    return serverDB.getPublicJobById(idOrSlug) || serverDB.getJobByIdOrSlug(idOrSlug) || null;
  },

  async getCategories(): Promise<any[]> {
    const data = await fetchBackendJson('/api/jobs/categories', 60);
    if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
    return serverDB.getCategories ? serverDB.getCategories() : [];
  },
};
