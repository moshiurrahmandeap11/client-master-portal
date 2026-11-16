'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  CheckCircle2,
  FileText,
  Edit3,
  Eye,
  Trash2,
  Check,
  X,
  Search,
  Download,
  Building2,
  Globe,
  Clock,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { JobCircular } from '@/types';
import JobLogo from '@/components/shared/JobLogo';
import { getAdminHeaders } from '@/lib/axios';
import FluidTabBar from './layout/FluidTabBar';

export interface GeminiBrowserSpiderHubProps {
  jobs?: JobCircular[];
  onRefreshData?: () => void;
  onOpenEditJob?: (job: JobCircular) => void;
  onDeleteJob?: (jobId: string, title: string) => void;
}

export default function GeminiBrowserSpiderHub({
  jobs = [],
  onRefreshData,
  onOpenEditJob,
  onDeleteJob
}: GeminiBrowserSpiderHubProps) {
  const [spiderStatus, setSpiderStatus] = useState<any>(null);
  const [syncedJobsList, setSyncedJobsList] = useState<JobCircular[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'DRAFT'>('ALL');

  // Policy & Extractor State
  const [isAutoPublish, setIsAutoPublish] = useState<boolean>(false);
  const [isTogglingAutoPublish, setIsTogglingAutoPublish] = useState<boolean>(false);
  const [extractorPdfUrl, setExtractorPdfUrl] = useState<string>('https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1793683909289.pdf');
  const [isExtractingCircular, setIsExtractingCircular] = useState<boolean>(false);
  const [extractedCircularResult, setExtractedCircularResult] = useState<any>(null);
  const [isSavingExtractedJob, setIsSavingExtractedJob] = useState<boolean>(false);

  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        headers: getAdminHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSpiderStatus(data);
        if (typeof data.autoPublish === 'boolean') {
          setIsAutoPublish(data.autoPublish);
        }
        if (Array.isArray(data.syncedJobs)) {
          setSyncedJobsList(data.syncedJobs);
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const displayJobs = useMemo(() => {
    const source = jobs.length > 0 ? jobs : syncedJobsList;

    return source.filter(j => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (j.title || '').toLowerCase().includes(q);
        const matchesOrg = (j.organization || '').toLowerCase().includes(q);
        const matchesId = (j.id || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesId) return false;
      }

      if (statusFilter !== 'ALL') {
        const rawStatus = String((j as any).status || (j as any).publicationStatus || 'PUBLISHED').toUpperCase();
        const isOpen = rawStatus === 'OPEN' || rawStatus === 'PUBLISHED' || rawStatus === 'ACTIVE';
        if (statusFilter === 'OPEN' && !isOpen) return false;
        if (statusFilter === 'DRAFT' && isOpen) return false;
      }

      return true;
    });
  }, [jobs, syncedJobsList, searchQuery, statusFilter]);

  const liveJobsCount = useMemo(() => {
    const source = jobs.length > 0 ? jobs : syncedJobsList;
    return source.filter(j => {
      const s = String((j as any).status || (j as any).publicationStatus || 'PUBLISHED').toUpperCase();
      return s === 'OPEN' || s === 'PUBLISHED' || s === 'ACTIVE';
    }).length;
  }, [jobs, syncedJobsList]);

  const draftJobsCount = useMemo(() => {
    const source = jobs.length > 0 ? jobs : syncedJobsList;
    return source.length - liveJobsCount;
  }, [jobs, syncedJobsList, liveJobsCount]);

  const handleToggleAutoPublish = async () => {
    setIsTogglingAutoPublish(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'toggle_auto_publish' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAutoPublish(data.autoPublish);
        showToast(data.message || 'পাবলিকেশন পলিসি আপডেট হয়েছে।');
      } else {
        showToast(data.message || data.error || 'পলিসি পরিবর্তন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'পলিসি পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsTogglingAutoPublish(false);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'sync', limit: 35 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'নতুন সার্কুলার সফলভাবে সংগ্রহ করা হয়েছে।');
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || data.error || 'সিঙ্ক ব্যর্থ হয়েছে।', 'error');
      }
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunExtraction = async () => {
    const url = extractorPdfUrl.trim();
    if (!url) {
      showToast('অনুগ্রহ করে সার্কুলারের একটি PDF লিঙ্ক বা নোটিশের URL দিন।', 'error');
      return;
    }
    setIsExtractingCircular(true);
    setExtractedCircularResult(null);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'parse_circular', pdfUrl: url })
      });
      const data = await res.json();
      if (res.ok && data.success && data.job) {
        setExtractedCircularResult(data.job);
        showToast('সার্কুলার বিশ্লেষণ সম্পন্ন হয়েছে!');
      } else {
        showToast(data.message || data.error || 'সার্কুলার স্ক্যান করতে সমস্যা হয়েছে।', 'error');
      }
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setIsExtractingCircular(false);
    }
  };

  const handleSaveExtractedJob = async (publishImmediately: boolean) => {
    if (!extractedCircularResult) return;
    setIsSavingExtractedJob(true);
    try {
      const jobToSave = {
        ...extractedCircularResult,
        status: publishImmediately ? 'PUBLISHED' : 'DRAFT',
        publicationStatus: publishImmediately ? 'PUBLISHED' : 'DRAFT'
      };

      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          action: 'save_extracted_job',
          job: jobToSave
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'সার্কুলারটি ডাটাবেজে সংরক্ষিত হয়েছে।');
        setExtractedCircularResult(null);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setIsSavingExtractedJob(false);
    }
  };

  const handleTogglePublish = async (job: JobCircular) => {
    setActionJobId(job.id);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'toggle_publish', jobId: job.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'স্ট্যাটাস আপডেট সফল হয়েছে।');
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setActionJobId(null);
    }
  };

  const handleDeleteJobItem = (job: JobCircular) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${job.title}" সার্কুলারটি মুছে ফেলতে চান?`)) {
      if (onDeleteJob) {
        onDeleteJob(job.id, job.title);
      }
    }
  };

  const handleToggleSelect = (jobId: string) => {
    setSelectedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = displayJobs.map(j => j.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedJobIds.includes(id));
    if (allSelected) {
      setSelectedJobIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedJobIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.length === 0) return;
    if (!confirm(`আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedJobIds.length}টি সার্কুলার মুছে ফেলতে চান?`)) {
      return;
    }
    setIsBulkProcessing(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'bulk_delete', jobIds: selectedJobIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'সার্কুলারগুলো মুছে ফেলা হয়েছে।');
        setSelectedJobIds([]);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || data.error || 'ডিলিট করতে সমস্যা হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(`ত্রুটি: ${err.message}`, 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkStatusChange = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (selectedJobIds.length === 0) return;
    setIsBulkProcessing(true);
    const action = targetStatus === 'PUBLISHED' ? 'bulk_publish' : 'bulk_draft';
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action, jobIds: selectedJobIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে।');
        setSelectedJobIds([]);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(`ত্রুটি: ${err.message}`, 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. UNIFIED STATS ROW (Identical style, pure white, cohesive polish) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Card 1: Total */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট সার্কুলার</span>
            <span className="text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {displayJobs.length}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ডাটাবেজে সংরক্ষিত</span>
        </div>

        {/* Card 2: Published */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">লাইভ প্রকাশিত</span>
            <span className="text-slate-400">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {liveJobsCount}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ওয়েবসাইটে সক্রিয়</span>
        </div>

        {/* Card 3: Drafts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">অপেক্ষমাণ খসড়া</span>
            <span className="text-slate-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {draftJobsCount}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">যাচাই ও অনুমোদন প্রয়োজন</span>
        </div>

        {/* Card 4: Publication Policy (Consistent style with sleek toggle link) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">প্রকাশনা পলিসি</span>
            <span className="text-slate-400">
              <Sliders className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {isAutoPublish ? 'স্বয়ংক্রিয় লাইভ' : 'খসড়া অনুমোদন'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {isAutoPublish ? 'সরাসরি ওয়েবসাইটে প্রকাশ' : 'অ্যাডমিন রিভিউ আবশ্যক'}
            </span>
            <button
              type="button"
              onClick={handleToggleAutoPublish}
              disabled={isTogglingAutoPublish}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isAutoPublish ? 'ড্রাফট করুন' : 'অটো অন'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Toast Feedback */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. DIRECT CIRCULAR PDF / NOTICE EXTRACTOR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              সার্কুলার লিংক বা নোটিশ থেকে সরাসরি তথ্য সংগ্রহ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              যেকোনো সার্কুলারের অফিসিয়াল PDF বা লিংক দিয়ে সরাসরি পদের বিবরণ ও ডেডলাইন বিশ্লেষণ করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'সংগ্রহ চলছে...' : 'অলজবস থেকে সার্কুলার সংগ্রহ করুন'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <input
            type="text"
            value={extractorPdfUrl}
            onChange={(e) => setExtractorPdfUrl(e.target.value)}
            placeholder="https://alljobs.teletalk.com.bd/.../advertisement.pdf"
            className="w-full sm:flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all font-mono"
          />
          <button
            type="button"
            onClick={handleRunExtraction}
            disabled={isExtractingCircular || !extractorPdfUrl.trim()}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <ArrowRight className={`w-3.5 h-3.5 ${isExtractingCircular ? 'animate-spin' : ''}`} />
            <span>{isExtractingCircular ? 'বিশ্লেষণ চলছে...' : 'সার্কুলার বিশ্লেষণ করুন'}</span>
          </button>
        </div>
      </div>

      {/* EXTRACTED CIRCULAR PREVIEW CARD */}
      {extractedCircularResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">
                  {extractedCircularResult.organization} — {extractedCircularResult.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                সার্কুলারটি সফলভাবে বিশ্লেষণ হয়েছে। খসড়া হিসেবে সেভ করুন অথবা সরাসরি লাইভ প্রকাশ করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveExtractedJob(false)}
                disabled={isSavingExtractedJob}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                খসড়া (Draft) সেভ
              </button>
              <button
                type="button"
                onClick={() => handleSaveExtractedJob(true)}
                disabled={isSavingExtractedJob}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>সরাসরি লাইভ পাবলিশ</span>
              </button>
              <button
                type="button"
                onClick={() => setExtractedCircularResult(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase">মোট শূন্যপদ</span>
              <div className="text-base font-black text-slate-900 mt-0.5">{extractedCircularResult.totalPosts || 1}টি</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase">আবেদনের শেষ তারিখ</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">{extractedCircularResult.deadline}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase">বেতন স্কেল</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">{extractedCircularResult.salary || 'জাতীয় স্কেল'}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase">বয়সসীমা</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">{extractedCircularResult.ageLimit || '১৮-৩০ বছর'}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SYNCED JOBS MANAGEMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h2 className="font-black text-sm text-slate-900">
              সংগৃহীত সার্কুলার তালিকা ({displayJobs.length}টি)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              সার্কুলার সম্পাদনা, স্ট্যাটাস পরিবর্তন এবং সরাসরি ওয়েবসাইটে প্রকাশ করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { fetchStatus(); if (onRefreshData) onRefreshData(); }}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সার্কুলারের শিরোনাম, প্রতিষ্ঠান বা আইডি দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <FluidTabBar
            tabs={[
              { id: 'ALL', label: 'সব', count: displayJobs.length },
              { id: 'OPEN', label: 'লাইভ প্রকাশিত', count: liveJobsCount },
              { id: 'DRAFT', label: 'ড্রাফট', count: draftJobsCount }
            ]}
            activeTab={statusFilter}
            onChange={(id) => setStatusFilter(id as 'ALL' | 'OPEN' | 'DRAFT')}
            size="sm"
            variant="slate"
          />
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedJobIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-xl shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">
                {selectedJobIds.length}
              </span>
              <span className="text-xs font-bold text-slate-200">
                টি সার্কুলার নির্বাচিত
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('PUBLISHED')}
                disabled={isBulkProcessing}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>লাইভ প্রকাশ</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('DRAFT')}
                disabled={isBulkProcessing}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>ড্রাফট করুন</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ডিলিট</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedJobIds([])}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                title="নির্বাচন বাতিল করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={displayJobs.length > 0 && displayJobs.every(j => selectedJobIds.includes(j.id))}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    title="সবগুলো নির্বাচন করুন"
                  />
                </th>
                <th className="py-3 px-3">সার্কুলার ও প্রতিষ্ঠান</th>
                <th className="py-3 px-3">পদ সংখ্যা</th>
                <th className="py-3 px-3">ডেডলাইন</th>
                <th className="py-3 px-3">সরকারি ফি</th>
                <th className="py-3 px-3">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <p className="font-bold text-xs text-slate-700">কোনো সার্কুলার পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      "অলজবস থেকে সার্কুলার সংগ্রহ করুন" বাটনে ক্লিক করে তথ্য সংগ্রহ করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                displayJobs.map((job) => {
                  const rawStatus = String((job as any).status || (job as any).publicationStatus || 'PUBLISHED').toUpperCase();
                  const isPublished = rawStatus === 'PUBLISHED' || rawStatus === 'ACTIVE' || rawStatus === 'OPEN';
                  const isProcessing = actionJobId === job.id;

                  return (
                    <tr key={job.id} className={`transition-colors ${selectedJobIds.includes(job.id) ? 'bg-slate-50' : 'hover:bg-slate-50/70'}`}>
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedJobIds.includes(job.id)}
                          onChange={() => handleToggleSelect(job.id)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Title & Organization */}
                      <td className="py-3 px-3 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <JobLogo logo={job.logo} organization={job.organization} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs line-clamp-1" title={job.title}>
                              {job.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                              <span>{job.organization}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {job.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vacancies */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{(job as any).totalPositions || job.totalPosts || 1}টি পদ</div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{job.deadline}</div>
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        ৳{(job as any).officialFee || job.govtFee || 200}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span>{isPublished ? 'লাইভ প্রকাশিত' : 'ড্রাফট'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(job)}
                            disabled={isProcessing}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                              isPublished
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                            title={isPublished ? 'বিজ্ঞপ্তিটি ড্রাফটে নিতে ক্লিক করুন' : 'বিজ্ঞপ্তিটি অবিলম্বে লাইভ প্রকাশ করতে ক্লিক করুন'}
                          >
                            {isProcessing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isPublished ? (
                              <span>ড্রাফট করুন</span>
                            ) : (
                              <span>লাইভ পাবলিশ</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenEditJob) onOpenEditJob(job);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="সার্কুলার সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            <span>সম্পাদনা</span>
                          </button>

                          <Link
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors inline-flex items-center"
                            title="ওয়েবসাইটে দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteJobItem(job)}
                            disabled={isProcessing}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
