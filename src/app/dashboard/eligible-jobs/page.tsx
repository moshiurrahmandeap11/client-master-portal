'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EligibleJobsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/recommended-jobs');
  }, [router]);

  return (
    <div className="p-8 text-center text-sm font-semibold text-slate-500">
      যোগ্যতাসম্পন্ন চাকরির তালিকা লোড হচ্ছে...
    </div>
  );
}
