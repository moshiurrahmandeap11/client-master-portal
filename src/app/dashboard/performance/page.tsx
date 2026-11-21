'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  FileCheck,
  ArrowRight,
  Award,
} from 'lucide-react';
import { useCandidatePerformance } from '@/hooks/usePlatformQueries';

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export default function PerformanceAnalyticsPage() {
  const { data, isLoading } = useCandidatePerformance();

  const summary = data?.summary || {
    totalAttempts: 0,
    totalQuestionsAnswered: 0,
    avgScore: 0,
    avgAccuracy: 0,
    bestScore: 0,
  };
  const attempts: any[] = data?.attempts || [];
  const subjectBreakdown: any[] = data?.subjectBreakdown || [];

  return (
    <div className="space-y-6 w-full pb-16" data-testid="performance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold border border-slate-200 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
            <span>পারফরম্যান্স অ্যানালিটিক্স ও প্রগ্রেস রিপোর্ট</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            পারফরম্যান্স অ্যানালিটিক্স ও দুর্বলতা ট্র্যাকার
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার প্রদত্ত মডেল টেস্টের বাস্তব স্কোর, নির্ভুলতার হার এবং বিষয়ভিত্তিক বিশ্লেষণ।
          </p>
        </div>

        <Link
          href="/model-tests"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start shadow-sm"
        >
          <Target className="w-4 h-4" />
          <span>নতুন মডেল টেস্ট দিন</span>
        </Link>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div data-testid="kpi-total-tests" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">মোট মডেল টেস্ট সম্পন্ন</span>
          <div className="text-2xl font-black text-slate-900">{toBn(summary.totalAttempts)} টি</div>
          <p className="text-[11px] text-slate-500 mt-1">মোট উত্তরকৃত প্রশ্ন: {toBn(summary.totalQuestionsAnswered)}</p>
        </div>

        <div data-testid="kpi-avg-score" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 block mb-1">গড় স্কোর (Average Score)</span>
          <div className="text-2xl font-black text-emerald-700">{toBn(summary.avgScore)}</div>
          <p className="text-[11px] text-slate-500 mt-1">প্রদত্ত সকল টেস্টের গড়</p>
        </div>

        <div data-testid="kpi-accuracy" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 block mb-1">গড় নির্ভুলতা (Accuracy)</span>
          <div className="text-2xl font-black text-blue-700">{toBn(summary.avgAccuracy)}%</div>
          <p className="text-[11px] text-slate-500 mt-1">সঠিক উত্তরের অনুপাত</p>
        </div>

        <div data-testid="kpi-best-score" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 block mb-1">সর্বোচ্চ স্কোর</span>
          <div className="text-2xl font-black text-amber-700">{toBn(summary.bestScore)}</div>
          <p className="text-[11px] text-slate-500 mt-1">ব্যক্তিগত সেরা অর্জন</p>
        </div>
      </div>

      {/* Recent Model Test Attempts */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          <span>সম্প্রতি সম্পন্ন মডেল টেস্টসমূহ</span>
        </h2>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">পারফরম্যান্স ডাটা লোড হচ্ছে...</div>
        ) : attempts.length > 0 ? (
          <div className="space-y-3">
            {attempts.map((a: any) => {
              const passed = a.totalMarks > 0 ? a.score / a.totalMarks >= 0.5 : a.accuracy >= 50;
              return (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {a.modelTest?.title || a.category || 'মডেল টেস্ট'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>তারিখ: {new Date(a.createdAt).toLocaleDateString('bn-BD')}</span>
                      <span>সঠিক: {toBn(a.correctCount)}</span>
                      <span>ভুল: {toBn(a.wrongCount)}</span>
                      <span>নির্ভুলতা: {toBn(a.accuracy)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">
                        {toBn(a.score)} / {toBn(a.totalMarks)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          passed ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{passed ? 'উত্তীর্ণ' : 'আরও অনুশীলন প্রয়োজন'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Award className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">এখনো কোনো পরীক্ষার ফলাফল রেকর্ড হয়নি</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              মডেল টেস্টে অংশগ্রহণ করলেই আপনার স্কোর, নির্ভুলতা এবং বিষয়ভিত্তিক বিশ্লেষণ এখানে সংরক্ষিত হবে।
            </p>
            <Link
              href="/model-tests"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              <span>মডেল টেস্ট দিন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Subject-wise Weakness Tracker */}
      {subjectBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900">বিষয়ভিত্তিক শক্তিমত্তা ও দুর্বলতা</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectBreakdown.map((sub: any) => (
              <div key={sub.category} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{sub.category}</span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      sub.accuracy >= 70
                        ? 'bg-emerald-50 text-emerald-700'
                        : sub.accuracy >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {toBn(sub.accuracy)}% নির্ভুলতা
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.accuracy >= 70 ? 'bg-emerald-600' : sub.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, sub.accuracy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
