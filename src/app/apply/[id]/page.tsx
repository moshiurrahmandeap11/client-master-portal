import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { JobCircular } from '@/types';
import ApplyClient from '@/components/apply_components/ApplyClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function resolveJob(idOrSlug: string): Promise<JobCircular | null> {
  return await serverApi.getJobByIdOrSlug(idOrSlug);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const job = await resolveJob(params.id);
  if (!job || job.id.startsWith('draft-') || (job as any).status === 'UNPUBLISHED' || (job as any).status === 'DRAFT' || (job as any).status === 'ARCHIVED') {
    return {
      title: 'আবেদন | চাকরি সেবা',
      description: 'সরকারি ও ব্যাংক চাকরির নির্ভুল অনলাইন আবেদন সেবা।',
    };
  }

  const isExpired = Boolean(
    CentralDeadlineEngine.evaluateDeadline(job).isClosed ||
    (job as any).status === 'EXPIRED' || 
    (job as any).status === 'CLOSED' ||
    (job.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))
  );

  return {
    title: isExpired 
      ? `আবেদনের সময় শেষ - ${job.title} | চাকরি সেবা`
      : `অনলাইন আবেদন - ${job.title} | চাকরি সেবা`,
    description: `${job.title} - ${job.organization}। ${isExpired ? 'এই সার্কুলারের আবেদনের সময় শেষ হয়েছে।' : '১০০% নির্ভুল অনলাইন আবেদন করুন চাকরি সেবার মাধ্যমে।'}`,
  };
}

export default async function ApplyPage(props: Props) {
  const params = await props.params;
  const job = await resolveJob(params.id);

  if (!job || job.id.startsWith('draft-') || (job as any).status === 'UNPUBLISHED' || (job as any).status === 'DRAFT' || (job as any).status === 'ARCHIVED') {
    notFound();
  }

  return <ApplyClient initialJob={job} />;
}
