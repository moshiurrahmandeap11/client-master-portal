import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { serverApi } from '@/lib/server-api';
import CmsPageRenderer from '@/components/shared/CmsPageRenderer';
import { PageRecord } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function resolvePage(rawSlug: string): Promise<PageRecord | null> {
  if (!rawSlug) return null;
  const livePage = await serverApi.getCmsPageBySlug(rawSlug);
  if (livePage) return livePage;

  const cleanSlug = rawSlug.replace(/^_/, '');
  const allPages = serverDB.getPages();
  const matched = allPages.find(p => 
    p.id === rawSlug || 
    p.id === cleanSlug || 
    p.id === `_${cleanSlug}` || 
    p.slug === rawSlug ||
    p.slug === cleanSlug ||
    p.slug === `/${rawSlug}` || 
    p.slug === `/${cleanSlug}`
  );

  if (matched) {
    return (serverDB.getPublishedPageById(matched.id) || matched) as any;
  }

  return null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const page = await resolvePage(rawSlug);

  if (!page) {
    return { 
      title: 'পৃষ্ঠা পাওয়া যায়নি | চাকরি সেবা',
      robots: { index: false }
    };
  }

  return {
    title: page.metaTitle || `${page.title} | চাকরি সেবা`,
    description: page.metaDescription || `${page.title} — চাকরি সেবা প্ল্যাটফর্মের অফিসিয়াল পেজ।`,
    alternates: {
      canonical: page.slug || `/p/${rawSlug}`
    },
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
      type: 'website'
    }
  };
}

export default async function DynamicCmsPage(props: Props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const page = await resolvePage(rawSlug);

  if (!page) {
    notFound();
  }

  const publicJobs = await serverApi.getPublicJobs(60);
  return <CmsPageRenderer page={page} initialJobs={publicJobs} />;
}
