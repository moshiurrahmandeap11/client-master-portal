'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

const api = {
  get: async <T = any>(url: string): Promise<T> => (await apiClient.get(url)).data,
  post: async <T = any>(url: string, body?: any): Promise<T> => (await apiClient.post(url, body)).data,
  put: async <T = any>(url: string, body?: any): Promise<T> => (await apiClient.put(url, body)).data,
  delete: async <T = any>(url: string): Promise<T> => (await apiClient.delete(url)).data,
};
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox' | 'json';

interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

interface ResourceSpec {
  key: string;
  label: string;
  endpoint: string;
  publicQueryKey: string[];
  titleField: string;
  subtitleField?: string;
  fields: FieldSpec[];
}

const RESOURCES: ResourceSpec[] = [
  {
    key: 'notices',
    label: 'পরীক্ষার নোটিশ',
    endpoint: '/api/admin/exams/notices',
    publicQueryKey: ['exams', 'notices'],
    titleField: 'title',
    subtitleField: 'organization',
    fields: [
      { name: 'title', label: 'শিরোনাম', type: 'text', required: true, placeholder: 'যেমন: ৪৭তম বিসিএস প্রিলিমিনারি পরীক্ষার তারিখ' },
      { name: 'organization', label: 'প্রতিষ্ঠান', type: 'text', placeholder: 'যেমন: বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)' },
      {
        name: 'stage',
        label: 'পরীক্ষার ধাপ',
        type: 'select',
        defaultValue: 'WRITTEN',
        options: [
          { value: 'PRELIMINARY', label: 'প্রিলিমিনারি' },
          { value: 'WRITTEN', label: 'লিখিত' },
          { value: 'PRACTICAL', label: 'ব্যবহারিক' },
          { value: 'VIVA', label: 'ভাইভা' },
        ],
      },
      { name: 'examDate', label: 'পরীক্ষার তারিখ', type: 'date' },
      { name: 'examTime', label: 'সময়', type: 'text', placeholder: 'যেমন: সকাল ১০:০০ - ১২:০০' },
      { name: 'venue', label: 'কেন্দ্র / স্থান', type: 'text', placeholder: 'যেমন: ঢাকা মহানগরীর নির্ধারিত কেন্দ্রসমূহ' },
      { name: 'noticeUrl', label: 'অফিশিয়াল নোটিশ / PDF লিংক', type: 'text', placeholder: 'https://...' },
      { name: 'description', label: 'নির্দেশনা (প্রতি লাইনে একটি)', type: 'textarea' },
    ],
  },
  {
    key: 'admit-cards',
    label: 'প্রবেশপত্র',
    endpoint: '/api/admin/exams/admit-cards',
    publicQueryKey: ['exams', 'admit-cards'],
    titleField: 'title',
    subtitleField: 'organization',
    fields: [
      { name: 'title', label: 'শিরোনাম', type: 'text', required: true },
      { name: 'organization', label: 'প্রতিষ্ঠান', type: 'text' },
      { name: 'category', label: 'ক্যাটাগরি', type: 'text', defaultValue: 'govt', placeholder: 'govt / bank / bcs / teacher' },
      { name: 'examDate', label: 'পরীক্ষার তারিখ', type: 'date' },
      { name: 'deadline', label: 'ডাউনলোডের শেষ তারিখ', type: 'date' },
      { name: 'downloadUrl', label: 'ডাউনলোড পোর্টাল লিংক', type: 'text', placeholder: 'https://...' },
      { name: 'rollInstructions', label: 'ডাউনলোড নির্দেশনা', type: 'textarea' },
      { name: 'isAvailable', label: 'এখন ডাউনলোডের জন্য উন্মুক্ত', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'results',
    label: 'পরীক্ষার ফলাফল',
    endpoint: '/api/admin/exams/results',
    publicQueryKey: ['exams', 'results'],
    titleField: 'title',
    subtitleField: 'organization',
    fields: [
      { name: 'title', label: 'ফলাফলের শিরোনাম', type: 'text', required: true },
      { name: 'organization', label: 'প্রতিষ্ঠান', type: 'text' },
      {
        name: 'stage',
        label: 'ধাপ',
        type: 'select',
        defaultValue: 'WRITTEN',
        options: [
          { value: 'PRELIMINARY', label: 'প্রিলিমিনারি' },
          { value: 'WRITTEN', label: 'লিখিত' },
          { value: 'FINAL', label: 'চূড়ান্ত' },
        ],
      },
      { name: 'pdfUrl', label: 'ফলাফল PDF লিংক', type: 'text', placeholder: 'https://...' },
      { name: 'passedRolls', label: 'উত্তীর্ণ রোল নম্বরসমূহ (কমা বা স্পেস দিয়ে)', type: 'textarea', placeholder: '110234, 110235, 110240' },
      { name: 'summary', label: 'পরবর্তী ধাপের নির্দেশনা', type: 'textarea' },
    ],
  },
  {
    key: 'viva-notices',
    label: 'ভাইভা নোটিশ',
    endpoint: '/api/admin/exams/viva-notices',
    publicQueryKey: ['exams', 'viva-notices'],
    titleField: 'title',
    subtitleField: 'organization',
    fields: [
      { name: 'title', label: 'ভাইভা শিরোনাম', type: 'text', required: true },
      { name: 'organization', label: 'প্রতিষ্ঠান', type: 'text' },
      { name: 'category', label: 'দপ্তর / পদ', type: 'text' },
      { name: 'vivaDate', label: 'ভাইভার তারিখ', type: 'date' },
      { name: 'venue', label: 'ভাইভা বোর্ড / স্থান', type: 'text' },
      { name: 'noticeUrl', label: 'অফিশিয়াল নোটিশ লিংক', type: 'text', placeholder: 'https://...' },
      { name: 'instructions', label: 'প্রয়োজনীয় কাগজপত্র (প্রতি লাইনে একটি)', type: 'textarea' },
    ],
  },
  {
    key: 'questions',
    label: 'প্রশ্নব্যাংক',
    endpoint: '/api/admin/exams/questions',
    publicQueryKey: ['exams', 'questions'],
    titleField: 'question',
    subtitleField: 'category',
    fields: [
      { name: 'category', label: 'বিষয়', type: 'text', required: true, defaultValue: 'সাধারণ জ্ঞান', placeholder: 'বাংলা / ইংরেজি / গণিত / সাধারণ জ্ঞান / আইসিটি' },
      { name: 'question', label: 'প্রশ্ন', type: 'textarea', required: true },
      { name: 'options', label: 'অপশনসমূহ (প্রতি লাইনে একটি করে ৪টি অপশন)', type: 'textarea', required: true, placeholder: 'অপশন ক\nঅপশন খ\nঅপশন গ\nঅপশন ঘ' },
      { name: 'correctIndex', label: 'সঠিক অপশন ইনডেক্স (০ থেকে ৩)', type: 'number', defaultValue: 0 },
      { name: 'explanation', label: 'ব্যাখ্যা', type: 'textarea' },
      { name: 'organization', label: 'পরীক্ষার নাম / প্রতিষ্ঠান', type: 'text' },
      { name: 'examYear', label: 'সাল', type: 'number', placeholder: '2026' },
    ],
  },
  {
    key: 'model-tests',
    label: 'মডেল টেস্ট',
    endpoint: '/api/admin/exams/model-tests',
    publicQueryKey: ['exams', 'model-tests'],
    titleField: 'title',
    subtitleField: 'category',
    fields: [
      { name: 'title', label: 'মডেল টেস্টের নাম', type: 'text', required: true },
      { name: 'category', label: 'ক্যাটাগরি', type: 'text', required: true, defaultValue: 'বিসিএস ও সরকারি চাকরি' },
      { name: 'description', label: 'সংক্ষিপ্ত বিবরণ', type: 'textarea' },
      { name: 'totalMarks', label: 'মোট নম্বর', type: 'number', defaultValue: 100 },
      { name: 'durationMinutes', label: 'সময় (মিনিট)', type: 'number', defaultValue: 60 },
      { name: 'negativeMark', label: 'নেগেটিভ মার্ক', type: 'number', defaultValue: 0.25 },
      {
        name: 'questions',
        label: 'প্রশ্ন JSON অ্যারে ([{"question":"...","options":["ক","খ","গ","ঘ"],"correctIndex":0,"explanation":"..."}])',
        type: 'json',
        defaultValue: '[]',
      },
      { name: 'isPublished', label: 'প্রকাশিত (Published)', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'content-posts',
    label: 'ব্লগ ও ক্যারিয়ার গাইড',
    endpoint: '/api/admin/content-posts',
    publicQueryKey: ['cms-content'],
    titleField: 'title',
    subtitleField: 'kind',
    fields: [
      {
        name: 'kind',
        label: 'ধরন',
        type: 'select',
        defaultValue: 'blog',
        options: [
          { value: 'blog', label: 'ব্লগ আর্টিকেল' },
          { value: 'guide', label: 'ক্যারিয়ার গাইড' },
        ],
      },
      { name: 'title', label: 'শিরোনাম', type: 'text', required: true },
      { name: 'slug', label: 'স্লাগ (খালি রাখলে অটো তৈরি হবে)', type: 'text', placeholder: 'bcs-preparation-guide' },
      { name: 'category', label: 'ক্যাটাগরি', type: 'text', placeholder: 'বিসিএস / ব্যাংক / সিভি টিপস' },
      { name: 'author', label: 'লেখক', type: 'text', defaultValue: 'চাকরি সেবা এডিটোরিয়াল' },
      { name: 'readTime', label: 'পড়ার সময়', type: 'text', defaultValue: '৫ মিনিট' },
      { name: 'excerpt', label: 'সংক্ষিপ্ত সারাংশ', type: 'textarea' },
      { name: 'content', label: 'মূল কনটেন্ট (প্যারাগ্রাফ আলাদা করতে ফাঁকা লাইন দিন)', type: 'textarea', required: true },
      { name: 'tags', label: 'ট্যাগ (কমা দিয়ে)', type: 'text', placeholder: 'বিসিএস, প্রস্তুতি, গাইড' },
    ],
  },
  {
    key: 'organizations',
    label: 'নিয়োগকারী প্রতিষ্ঠান',
    endpoint: '/api/admin/organizations',
    publicQueryKey: ['organizations'],
    titleField: 'name',
    subtitleField: 'type',
    fields: [
      { name: 'name', label: 'প্রতিষ্ঠানের নাম (ইংরেজি/মূল)', type: 'text', required: true },
      { name: 'nameBn', label: 'প্রতিষ্ঠানের নাম (বাংলা)', type: 'text' },
      { name: 'slug', label: 'স্লাগ', type: 'text', placeholder: 'bangladesh-bank' },
      {
        name: 'type',
        label: 'ধরন',
        type: 'select',
        defaultValue: 'Govt',
        options: [
          { value: 'Govt', label: 'সরকারি' },
          { value: 'Autonomous', label: 'স্বায়ত্তশাসিত' },
          { value: 'Bank', label: 'ব্যাংক' },
          { value: 'Private', label: 'বেসরকারি' },
        ],
      },
      { name: 'websiteUrl', label: 'অফিশিয়াল ওয়েবসাইট', type: 'text', placeholder: 'https://...' },
      { name: 'logoUrl', label: 'লোগো URL', type: 'text', placeholder: 'https://...' },
      { name: 'description', label: 'বিবরণ', type: 'textarea' },
      { name: 'isActive', label: 'সক্রিয়', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'reviews',
    label: 'প্রার্থীদের মতামত',
    endpoint: '/api/admin/reviews',
    publicQueryKey: ['public-reviews'],
    titleField: 'name',
    subtitleField: 'institution',
    fields: [
      { name: 'name', label: 'প্রার্থীর নাম', type: 'text', required: true },
      { name: 'role', label: 'পদ / পরিচয়', type: 'text', placeholder: 'যেমন: সিনিয়র অফিসার প্রার্থী' },
      { name: 'institution', label: 'প্রতিষ্ঠান / জেলা', type: 'text', placeholder: 'যেমন: ঢাকা বিশ্ববিদ্যালয় / চট্টগ্রাম' },
      { name: 'quote', label: 'মতামত', type: 'textarea', required: true },
      { name: 'rating', label: 'রেটিং (১-৫)', type: 'number', defaultValue: 5 },
      { name: 'isApproved', label: 'হোমপেজে প্রদর্শন করুন', type: 'checkbox', defaultValue: true },
      { name: 'orderIndex', label: 'ক্রম (Order)', type: 'number', defaultValue: 0 },
    ],
  },
];

export default function DynamicContentManager() {
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState<string>(RESOURCES[0].key);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const spec = RESOURCES.find((r) => r.key === activeKey) || RESOURCES[0];

  const { data: items = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['admin-dynamic', spec.key],
    queryFn: async () => {
      const res = await api.get<any>(spec.endpoint);
      return Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      if (editingId) {
        return await api.put<any>(`${spec.endpoint}/${editingId}`, payload);
      }
      return await api.post<any>(spec.endpoint, payload);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-dynamic', spec.key] });
      queryClient.invalidateQueries({ queryKey: spec.publicQueryKey });
      setShowForm(false);
      setEditingId(null);
      setFormState({});
      setFeedback({ type: 'ok', text: res?.message || 'সফলভাবে সংরক্ষিত হয়েছে!' });
      setTimeout(() => setFeedback(null), 3500);
    },
    onError: (err: any) => {
      setFeedback({ type: 'err', text: err?.message || 'সংরক্ষণে ত্রুটি হয়েছে।' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete<any>(`${spec.endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dynamic', spec.key] });
      queryClient.invalidateQueries({ queryKey: spec.publicQueryKey });
      setFeedback({ type: 'ok', text: 'সফলভাবে মুছে ফেলা হয়েছে।' });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const openCreateForm = () => {
    const initial: Record<string, any> = {};
    spec.fields.forEach((f) => {
      initial[f.name] = f.defaultValue !== undefined ? f.defaultValue : f.type === 'checkbox' ? true : '';
    });
    setEditingId(null);
    setFormState(initial);
    setShowForm(true);
  };

  const openEditForm = (item: any) => {
    const initial: Record<string, any> = {};
    spec.fields.forEach((f) => {
      const raw = item[f.name];
      if (f.type === 'date' && raw) {
        initial[f.name] = new Date(raw).toISOString().split('T')[0];
      } else if (f.type === 'json') {
        initial[f.name] = typeof raw === 'string' ? raw : JSON.stringify(raw ?? [], null, 2);
      } else if (Array.isArray(raw)) {
        initial[f.name] = f.name === 'options' ? raw.join('\n') : raw.join(', ');
      } else {
        initial[f.name] = raw ?? (f.defaultValue ?? '');
      }
    });
    setEditingId(item.id);
    setFormState(initial);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = { ...formState };
    for (const f of spec.fields) {
      if (f.type === 'json' && typeof payload[f.name] === 'string') {
        try {
          payload[f.name] = JSON.parse(payload[f.name] || '[]');
        } catch {
          setFeedback({ type: 'err', text: `${f.label} সঠিক JSON ফরম্যাটে দিন।` });
          return;
        }
      }
    }
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>ডাইনামিক কনটেন্ট, পরীক্ষা ও রিভিউ ম্যানেজার</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            এখান থেকে যুক্ত করা প্রতিটি তথ্য সরাসরি ডাটাবেসে সেভ হয় এবং লাইভ ওয়েবসাইটে প্রদর্শিত হয়।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন {spec.label} যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Resource Tabs */}
      <div className="flex flex-wrap gap-2">
        {RESOURCES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              setActiveKey(r.key);
              setShowForm(false);
              setEditingId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeKey === r.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-emerald-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900">
              {editingId ? `${spec.label} এডিট করুন` : `নতুন ${spec.label} যুক্ত করুন`}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spec.fields.map((f) => (
              <div
                key={f.name}
                className={f.type === 'textarea' || f.type === 'json' ? 'md:col-span-2 space-y-1' : 'space-y-1'}
              >
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formState[f.name])}
                      onChange={(e) => setFormState((p) => ({ ...p, [f.name]: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-700"
                    />
                    <span>{f.label}</span>
                  </label>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-slate-700">
                      {f.label} {f.required && <span className="text-rose-600">*</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        value={formState[f.name] ?? ''}
                        onChange={(e) => setFormState((p) => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
                      >
                        {(f.options || []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' || f.type === 'json' ? (
                      <textarea
                        rows={f.type === 'json' ? 5 : 3}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formState[f.name] ?? ''}
                        onChange={(e) => setFormState((p) => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                      />
                    ) : (
                      <input
                        type={f.type}
                        step={f.type === 'number' ? 'any' : undefined}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formState[f.name] ?? ''}
                        onChange={(e) => setFormState((p) => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500">ডাটা লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">এখনো কোনো {spec.label} যুক্ত করা হয়নি</p>
            <p className="text-xs text-slate-500">
              উপরের &ldquo;নতুন {spec.label} যুক্ত করুন&rdquo; বাটনে ক্লিক করে প্রথম তথ্য যুক্ত করুন।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {item[spec.titleField] || item.title || item.name || item.id}
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-3 mt-0.5">
                    {spec.subtitleField && item[spec.subtitleField] && (
                      <span>{String(item[spec.subtitleField])}</span>
                    )}
                    {item.createdAt && (
                      <span>যুক্ত: {new Date(item.createdAt).toLocaleDateString('bn-BD')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                    title="এডিট"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`এই ${spec.label} মুছে ফেলতে চান?`)) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="p-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
