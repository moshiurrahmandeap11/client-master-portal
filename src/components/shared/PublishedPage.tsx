import React from 'react';
import type { PageRecord } from '@/types';
import { serverApi } from '@/lib/server-api';
import CmsPageRenderer from '@/components/shared/CmsPageRenderer';

export default async function PublishedPage({ page }: { page: NonNullable<PageRecord['publishedContent']> | PageRecord }) {
  const normalizedPage: PageRecord = {
    id: (page as any).id || (page as any).slug?.replace(/^\//, '') || 'page',
    slug: page.slug || '/',
    title: page.title || 'পৃষ্ঠা',
    status: 'published',
    version: (page as any).version || 1,
    sections: page.sections || [],
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    revisions: [],
    updatedAt: (page as any).publishedAt || (page as any).updatedAt || new Date().toISOString()
  };

  const jobs = await serverApi.getPublicJobs();
  return <CmsPageRenderer page={normalizedPage} initialJobs={jobs} />;
}
