'use client';

import React from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  BookOpen,
  Award,
  ArrowRight,
  FileQuestion,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useCandidatePerformance } from '@/hooks/usePlatformQueries';

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export default function PreparationPage() {
  const { data, isLoading } = useCandidatePerformance();

  const summary = data?.summary || {
    totalAttempts: 0,
    totalQuestionsAnswered: 0,
    avgScore: 0,
    avgAccuracy: 0,
    bestScore: 0,
    availableTestsCount: 0,
    questionBankCount: 0,
  };
  const subjectBreakdown: any[] = data?.subjectBreakdown || [];
  const questionCategories: any[] = data?.questionCategories || [];

  return (
    <div className="space-y-6 w-full pb-16" data-testid="preparation-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold border border-slate-200 mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-slate-700" />
            <span>বিসিএস ও সরকারি নিয়োগ প্রস্তুতি হাব</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            পরীক্ষার প্রস্তুতি কেন্দ্র (Exam Preparation)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার প্রদত্ত মডেল টেস্ট এবং প্রশ্নব্যাংক অনুশীলনের বাস্তব পরিসংখ্যান ও বিষয়ভিত্তিক অগ্রগতি।
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/model-tests"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Target className="w-4 h-4" />
            <span>মডেল টেস্ট দিন</span>
          </Link>
          <Link
            href="/question-bank"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>প্রশ্নব্যাংক</span>
          </Link>
        </div>
      </div>

      {/* Live Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">সম্পন্ন মডেল টেস্ট</span>
          <div className="text-2xl font-black text-slate-900">{toBn(summary.totalAttempts)} টি</div>
          <p className="text-[11px] text-slate-500 mt-1">মোট উপলব্ধ: {toBn(summary.availableTestsCount)} টি</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">অনুশীলনকৃত প্রশ্ন</span>
          <div className="text-2xl font-black text-emerald-700">{toBn(summary.totalQuestionsAnswered)} টি</div>
          <p className="text-[11px] text-slate-500 mt-1">প্রশ্নব্যাংকে মোট: {toBn(summary.questionBankCount)} টি</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">গড় নির্ভুলতা</span>
          <div className="text-2xl font-black text-blue-700">{toBn(summary.avgAccuracy)}%</div>
          <p className="text-[11px] text-slate-500 mt-1">সকল মডেল টেস্টের গড়</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">সর্বোচ্চ স্কোর</span>
          <div className="text-2xl font-black text-amber-700">{toBn(summary.bestScore)}</div>
          <p className="text-[11px] text-slate-500 mt-1">গড় স্কোর: {toBn(summary.avgScore)}</p>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>বিষয়ভিত্তিক প্রস্তুতি অগ্রগতি</span>
          </h2>
          <Link
            href="/dashboard/performance"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>বিস্তারিত পারফরম্যান্স</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">তথ্য লোড হচ্ছে...</div>
        ) : subjectBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectBreakdown.map((sub: any) => (
              <div key={sub.category} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{sub.category}</span>
                  <span className="text-xs font-black text-emerald-700">{toBn(sub.accuracy)}% সঠিক</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, sub.accuracy || 0)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>টেস্ট দিয়েছেন: {toBn(sub.attempts)} টি</span>
                  <span>সঠিক উত্তর: {toBn(sub.correctCount)} / {toBn(sub.totalQuestions)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">এখনো কোনো মডেল টেস্ট সম্পন্ন করা হয়নি</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              অনলাইন মডেল টেস্টে অংশগ্রহণ করলে এখানে আপনার বিষয়ভিত্তিক সঠিক উত্তরের হার ও প্রস্তুতি অগ্রগতি স্বয়ংক্রিয়ভাবে যুক্ত হবে।
            </p>
            <Link
              href="/model-tests"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              <span>মডেল টেস্ট শুরু করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Question Bank Categories from DB */}
      {questionCategories.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <span>প্রশ্নব্যাংকে উপলব্ধ বিষয়সমূহ</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {questionCategories.map((cat: any) => (
              <Link
                key={cat.category}
                href="/question-bank"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/40 transition-colors flex items-center justify-between"
              >
                <span className="text-xs font-bold text-slate-800">{cat.category}</span>
                <span className="text-xs font-black text-emerald-700">{toBn(cat.count)} টি</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
