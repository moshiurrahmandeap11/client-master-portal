'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Check, 
  X, 
  Eye, 
  Search, 
  ExternalLink,
  Layers,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { getAdminHeaders } from '@/lib/axios';
import { CircularDraft } from '@/types';
import FluidTabBar from './layout/FluidTabBar';

interface JobVerificationCenterProps {
  drafts: CircularDraft[];
  onRefreshDrafts: () => Promise<void>;
  onApproveDraft?: (draft: CircularDraft) => Promise<void>;
  onRejectDraft?: (draft: CircularDraft) => Promise<void>;
}

export default function JobVerificationCenter({
  drafts,
  onRefreshDrafts
}: JobVerificationCenterProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDraft, setSelectedDraft] = useState<CircularDraft | null>(null);
  
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isVerifyingAll, setIsVerifyingAll] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const d of drafts) {
      const status = (d as any).status || 'pending_review';
      if (status === 'approved' || status === 'published') {
        approved++;
      } else if (status === 'rejected') {
        rejected++;
      } else {
        pending++;
      }
    }

    return { total: drafts.length, pending, approved, rejected };
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    return drafts.filter(draft => {
      const d = draft as any;
      const title = (d.extractedTitle || d.title || d.rawSourceData?.titleBn || d.rawSourceData?.title || '').toLowerCase();
      const org = (d.extractedOrg || d.rawSourceData?.organization || '').toLowerCase();
      const source = (d.sourceName || 'Teletalk Alljobs').toLowerCase();
      const q = (searchQuery || '').toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || org.includes(q) || source.includes(q);
      if (!matchesSearch) return false;

      const status = (d.status || 'pending_review').toLowerCase();
      if (statusFilter === 'all') return true;
      if (statusFilter === 'pending') return status === 'pending_review' || status === 'draft' || status === 'pending';
      if (statusFilter === 'approved') return status === 'approved' || status === 'published';
      if (statusFilter === 'rejected') return status === 'rejected';

      return true;
    });
  }, [drafts, searchQuery, statusFilter]);

  const handleRunVerification = async (draftId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVerifying(draftId);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch('/api/admin/verification/run', { 
        method: 'POST', 
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ draftId, forceRerun: true })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'যাচাই প্রক্রিয়া সম্পন্ন করা যায়নি');
      }

      await onRefreshDrafts();
      setActionSuccessMsg('সার্কুলার যাচাই সফলভাবে সম্পন্ন হয়েছে!');

      if (selectedDraft?.id === draftId) {
        const updated = drafts.find(d => d.id === draftId);
        if (updated) setSelectedDraft(updated);
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'যাচাইকরণে ত্রুটি ঘটেছে');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleVerifyAll = async () => {
    setIsVerifyingAll(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch('/api/admin/verification/run', { 
        method: 'POST', 
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ runAll: true })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'ব্যাচ যাচাই ব্যর্থ হয়েছে');
      }

      await onRefreshDrafts();
      setActionSuccessMsg('সকল অপেক্ষমাণ সার্কুলার সফলভাবে যাচাই করা হয়েছে!');
    } catch (err: any) {
      setActionErrorMsg(err.message || 'যাচাইকরণে ত্রুটি');
    } finally {
      setIsVerifyingAll(false);
    }
  };

  const handleApproveVerification = async (draftId: string) => {
    setIsSubmittingAction(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      let res = await fetch(`/api/admin/verification/${draftId}/approve`, { 
        method: 'POST', 
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ publishDirectly: true })
      });
      
      let data = await res.json().catch(() => ({}));

      // Fallback to general draft action route if verification sub-route returns error
      if (!res.ok || !data.success) {
        res = await fetch(`/api/admin/drafts/action`, {
          method: 'POST',
          headers: getAdminHeaders(),
          credentials: 'include',
          body: JSON.stringify({ action: 'approve', draftId })
        });
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'অনুমোদন সম্পন্ন করা যায়নি');
      }

      await onRefreshDrafts();
      setActionSuccessMsg('সার্কুলারটি সফলভাবে অনুমোদিত হয়েছে এবং সরাসরি মূল ওয়েবসাইটে লাইভ প্রকাশ করা হয়েছে!');
      if (selectedDraft?.id === draftId) setSelectedDraft(null);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'অনুমোদন ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRejectDraft = async (draftId: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই খসড়াটি বাতিল করতে চান?')) return;
    setIsSubmittingAction(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/drafts/action`, {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'reject', draftId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'বাতিল করা যায়নি');
      }

      await onRefreshDrafts();
      setActionSuccessMsg('খসড়া সার্কুলারটি বাতিল করা হয়েছে।');
      if (selectedDraft?.id === draftId) setSelectedDraft(null);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'অ্যাকশন ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. UNIFIED STATS ROW (Identical style, pure white, cohesive polish) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট সংগৃহীত খসড়া</span>
            <span className="text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.total}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ইনজেস্টকৃত সার্কুলার</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">অপেক্ষমাণ খসড়া</span>
            <span className="text-slate-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.pending}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">যাচাই ও অনুমোদন প্রয়োজন</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">অনুমোদিত ও প্রকাশিত</span>
            <span className="text-slate-400">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.approved}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ওয়েবসাইটে সরাসরি লাইভ</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">বাতিলকৃত খসড়া</span>
            <span className="text-slate-400">
              <X className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.rejected}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">বাতিল হিসেবে সংরক্ষিত</span>
        </div>
      </div>

      {/* Global Notifications */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="সার্কুলার বা প্রতিষ্ঠান খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <FluidTabBar
            tabs={[
              { id: 'all', label: 'সব', count: stats.total },
              { id: 'pending', label: 'অপেক্ষমাণ', count: stats.pending },
              { id: 'approved', label: 'অনুমোদিত', count: stats.approved },
              { id: 'rejected', label: 'বাতিল', count: stats.rejected }
            ]}
            activeTab={statusFilter}
            onChange={(id) => setStatusFilter(id)}
            size="sm"
            variant="slate"
          />

          <button
            type="button"
            disabled={isVerifyingAll}
            onClick={handleVerifyAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingAll ? 'animate-spin' : ''}`} />
            <span>{isVerifyingAll ? 'যাচাই চলছে...' : 'সব অটো-যাচাই'}</span>
          </button>
        </div>
      </div>

      {/* 3. DRAFTS LIST */}
      <div className="space-y-3">
        {filteredDrafts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 space-y-1">
            <p className="font-bold text-sm text-slate-800">কোনো ড্রাফট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন সার্কুলার সংগ্রহ করুন।</p>
          </div>
        ) : (
          filteredDrafts.map(draft => {
            const d = draft as any;
            const raw = (typeof d.rawSourceData === 'object' && d.rawSourceData !== null) ? d.rawSourceData : {};
            const title = d.extractedTitle || d.title || raw.titleBn || raw.title || 'সরকারি চাকরির সার্কুলার';
            const org = d.extractedOrg || raw.organization || raw.orgName || 'বাংলাদেশ সরকার';
            const source = d.sourceName || raw.sourceName || 'Teletalk Alljobs';
            const vacancies = Number(d.vacancies || d.totalPositions || raw.totalPositions || raw.vacancies) || 1;
            const deadline = d.deadline || (raw.deadline ? String(raw.deadline).split('T')[0] : '২০২৬-১২-৩১');
            const govtFee = Number(d.govtFee || d.officialFee || raw.officialFee) || 200;
            const isApproved = d.status === 'approved' || d.status === 'published';
            const isRejected = d.status === 'rejected';

            return (
              <div
                key={draft.id}
                className="bg-white hover:bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isApproved ? 'অনুমোদিত' : isRejected ? 'বাতিল' : 'যাচাই অপেক্ষমাণ'}
                      </span>
                      <h2 className="font-black text-sm text-slate-900 truncate">
                        {title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="font-bold text-slate-800">{org}</span>
                      <span>•</span>
                      <span>উৎস: {source}</span>
                      <span>•</span>
                      <span>শূন্যপদ: <strong>{vacancies}টি</strong></span>
                      <span>•</span>
                      <span>ডেডলাইন: <strong>{deadline}</strong></span>
                      <span>•</span>
                      <span>সরকারি ফি: <strong>৳{govtFee}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedDraft(draft)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বিস্তারিত দেখুন</span>
                    </button>

                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleApproveVerification(draft.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>যাচাই ও অনুমোদন</span>
                      </button>
                    )}

                    {!isRejected && !isApproved && (
                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleRejectDraft(draft.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="বাতিল করুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedDraft && (() => {
        const d = selectedDraft as any;
        const raw = (typeof d.rawSourceData === 'object' && d.rawSourceData !== null) ? d.rawSourceData : {};
        const title = d.extractedTitle || d.title || raw.titleBn || raw.title || 'সরকারি চাকরির সার্কুলার';
        const org = d.extractedOrg || raw.organization || raw.orgName || 'বাংলাদেশ সরকার';
        const source = d.sourceName || raw.sourceName || 'Teletalk Alljobs';
        const totalVacancies = Number(d.vacancies || d.totalPositions || raw.totalPositions || raw.vacancies) || 1;
        const deadline = d.deadline || (raw.deadline ? String(raw.deadline).split('T')[0] : '২০২৬-১২-৩১');
        const officialFee = Number(d.govtFee || d.officialFee || raw.officialFee) || 200;
        const positions = Array.isArray(raw.positions) ? raw.positions : [];
        const isApproved = d.status === 'approved' || d.status === 'published';

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    সার্কুলার বিস্তারিত বিবরণ
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    প্রতিষ্ঠান: <span className="font-bold text-slate-800">{org}</span> • উৎস: {source}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDraft(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 block">মোট শূন্যপদ</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{totalVacancies} টি</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 block">সরকারি আবেদন ফি</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">৳{officialFee}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 block">আবেদনের শেষ তারিখ</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">{deadline}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 block">বর্তমান অবস্থা</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">
                    {isApproved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                  </span>
                </div>
              </div>

              {/* Positions Breakdown */}
              {positions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">
                    পদের তালিকা ({positions.length}টি পদবি):
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2 px-3">পদের নাম</th>
                          <th className="py-2 px-3">শূন্যপদ</th>
                          <th className="py-2 px-3">গ্রেড / বেতন</th>
                          <th className="py-2 px-3">শিক্ষাগত যোগ্যতা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {positions.map((pos: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-900">{pos.title || 'পদবি'}</td>
                            <td className="py-2 px-3 font-bold text-emerald-700">{pos.posts || pos.vacancies || 1}টি</td>
                            <td className="py-2 px-3 text-slate-600">{pos.grade || pos.salary || 'জাতীয় স্কেল'}</td>
                            <td className="py-2 px-3 text-slate-600">{pos.education || pos.minEducation || 'বিজ্ঞপ্তি অনুসারে'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Source & Reference Links */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">সার্কুলার সোর্স লিংক:</span>
                <a
                  href={raw.sourceUrl || selectedDraft.sourceUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline font-mono text-[11px] flex items-center gap-1 break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>{raw.sourceUrl || selectedDraft.sourceUrl || 'টেলিটক অলজবস পোর্টাল'}</span>
                </a>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDraft(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>

                {!isApproved && (
                  <button
                    type="button"
                    disabled={isSubmittingAction}
                    onClick={() => handleApproveVerification(selectedDraft.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>যাচাই অনুমোদন ও লাইভ প্রকাশ করুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
