'use client';

import { useCallback, useEffect, useState } from 'react';
import { jobsService, type JobsQueryParams } from '@/services/jobs.service';
import type { JobCircular } from '@/types';

export function useJobs(initialParams: JobsQueryParams = {}, autoFetch = true) {
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (params: JobsQueryParams = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const data = await jobsService.getJobs(params);
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'চাকরির তথ্য লোড করা যায়নি');
        return { jobs: [] };
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchJobs(initialParams).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return { jobs, setJobs, loading, error, fetchJobs };
}
