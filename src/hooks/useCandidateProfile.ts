'use client';

import { useCallback, useEffect, useState } from 'react';
import { emptyCandidateProfile } from '@/data/candidateDefaults';
import { profileService } from '@/services';
import type { CandidateProfile } from '@/types';

export function useCandidateProfile(autoFetch = true) {
  const [profile, setProfile] = useState<CandidateProfile>(emptyCandidateProfile);
  const [loading, setLoading] = useState(autoFetch);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      const loaded = data.profile || data.user || data.data;
      if (loaded) setProfile(loaded);
      return loaded || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'প্রোফাইল লোড করা যায়নি');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (patch: Partial<CandidateProfile>) => {
    setSaving(true);
    setError(null);
    try {
      const data = await profileService.updateProfile(patch);
      if (data.profile) setProfile(data.profile);
      else setProfile((prev) => ({ ...prev, ...patch }));
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'প্রোফাইল আপডেট ব্যর্থ হয়েছে';
      setError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProfile().catch(() => {});
    }
  }, [autoFetch, fetchProfile]);

  return {
    profile,
    setProfile,
    loading,
    saving,
    error,
    fetchProfile,
    updateProfile,
  };
}
