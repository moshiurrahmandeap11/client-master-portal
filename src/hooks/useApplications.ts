'use client';

import { useCallback, useEffect, useState } from 'react';
import { applicationsService } from '@/services';
import type { ApplicationRequest } from '@/types';

export function useApplications(autoFetch = true) {
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsService.getApplications();
      const list = data.applications || data.data || [];
      setApplications(Array.isArray(list) ? list : []);
      return list;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'আবেদনের তালিকা লোড করা যায়নি');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchApplications().catch(() => {});
    }
  }, [autoFetch, fetchApplications]);

  return { applications, setApplications, loading, error, fetchApplications };
}
