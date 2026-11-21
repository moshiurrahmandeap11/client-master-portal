import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/types';
import ApplyClient from '@/components/apply_components/ApplyClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchJobFromBackend(idOrSlug: string): Promise<JobCircular | null> {
  try {
    const backendUrl = (process.env.INTERNAL_BACKEND_URL || 'http://localhost:6969').replace(/\/+$/, '');
    const res = await fetch(`${backendUrl}/api/jobs/${encodeURIComponent(idOrSlug)}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const rawJob = data.job || data.data;
      if (rawJob && (rawJob.id || rawJob.slug)) {
        return rawJob as JobCircular;
      }
    }
  } catch {
    // Backend fetch failed or timed out
  }
  return null;
}

async function resolveJob(idOrSlug: string): Promise<JobCircular | null> {
  const remote = await fetchJobFromBackend(idOrSlug);
  if (remote) return remote;

  const local = serverDB.getPublicJobById(idOrSlug) || serverDB.getJobByIdOrSlug(idOrSlug);
  if (local) return local;

  return null;
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
