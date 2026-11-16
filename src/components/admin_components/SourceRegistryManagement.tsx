'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Globe,
  Pause,
  Play,
  Edit3,
  Trash2,
  ExternalLink,
  History,
  Layers,
  Database,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { getAdminHeaders } from '@/lib/axios';
import { JobSource, SourceClassification, CollectionMethod, SourceHealthStatus, SpiderRun } from '@/types';
import FluidTabBar from './layout/FluidTabBar';

const CLASSIFICATION_LABELS: Record<SourceClassification, { label: string; color: string }> = {
  official: { label: 'সরকারি পোর্টাল', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  news: { label: 'জাতীয় সংবাদপত্র', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  job_board: { label: 'জব পোর্টাল', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  custom_api: { label: 'কাস্টম সোর্স', color: 'bg-slate-100 text-slate-800 border-slate-200' }
};

const METHOD_LABELS: Record<CollectionMethod, { label: string }> = {
  html_scrape: { label: 'ওয়েব পেজ নোটিশ' },
  json_api: { label: 'সরাসরি এপিআই' },
  rss_feed: { label: 'RSS ফিড' },
  gemini_ocr_pdf: { label: 'অফিসিয়াল PDF সার্কুলার' },
  manual_entry: { label: 'ম্যানুয়াল এন্ট্রি' }
};

const HEALTH_CONFIG: Record<SourceHealthStatus, { label: string; dot: string; text: string }> = {
  healthy: { label: 'সক্রিয়', dot: 'bg-emerald-500', text: 'text-slate-800' },
  degraded: { label: 'ধীরগতির', dot: 'bg-amber-500', text: 'text-slate-800' },
  failing: { label: 'ত্রুটিযুক্ত', dot: 'bg-rose-500', text: 'text-slate-800' },
  paused: { label: 'স্থগিত', dot: 'bg-slate-400', text: 'text-slate-600' }
};

export default function SourceRegistryManagement() {
  const [sources, setSources] = useState<JobSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  // Sub-tab Navigation
  const [activeTab, setActiveTab] = useState<'sources' | 'runs'>('sources');

  // Runs & History
  const [spiderRuns, setSpiderRuns] = useState<SpiderRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);

  // Connectivity Test State
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<JobSource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add / Edit Form Inputs
  const [formName, setFormName] = useState('');
  const [formOrgName, setFormOrgName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formClassification, setFormClassification] = useState<SourceClassification>('official');
  const [formMethod, setFormMethod] = useState<CollectionMethod>('html_scrape');
  const [formScanInterval, setFormScanInterval] = useState('360');
  const [formEnabled, setFormEnabled] = useState(true);
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null);
  const [isScrapingAll, setIsScrapingAll] = useState(false);

  const fetchSpiderRuns = async () => {
    setIsLoadingRuns(true);
    try {
      const res = await fetch('/api/admin/sources/runs?limit=50', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setSpiderRuns(data.runs || []);
      }
    } catch (err: any) {
      console.error('Failed to load runs:', err);
    } finally {
      setIsLoadingRuns(false);
    }
  };

  const fetchSources = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/sources', { headers: getAdminHeaders() });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: সোর্স তালিকা লোড করতে ব্যর্থ হয়েছে।`);
      }
      const data = await res.json();
      setSources(data.sources || []);
    } catch (err: any) {
      setFetchError(err.message || 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
    fetchSpiderRuns();
  }, []);

  const handleTestSource = async (src: JobSource) => {
    setTestingSourceId(src.id);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/sources/${src.id}/test`, { method: 'POST', headers: getAdminHeaders() });
      const data = await res.json();
      if (data.reachable) {
        setSuccessMessage(`সোর্স "${src.name}" সফলভাবে টেস্ট সম্পন্ন হয়েছে! (HTTP ${data.httpStatus || 200})`);
      } else {
        setFetchError(`কানেকশন টেস্ট ব্যর্থ হয়েছে (${src.name}): ${data.error || "সার্ভার রেসপন্স দেয়নি"}`);
      }
      fetchSources();
    } catch (err: any) {
      setFetchError(err.message || "কানেকশন টেস্ট ব্যর্থ হয়েছে");
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleScrapeSource = async (src: JobSource) => {
    setScrapingSourceId(src.id);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/sources/${src.id}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সংগ্রহ ব্যর্থ হয়েছে।');
      setSuccessMessage(`"${src.name}" থেকে সফলভাবে তথ্য সংগ্রহ সম্পন্ন হয়েছে।`);
      fetchSources();
    } catch (err: any) {
      setFetchError(err.message || 'সংগ্রহে সমস্যা হয়েছে।');
    } finally {
      setScrapingSourceId(null);
    }
  };

  const handleScrapeAll = async () => {
    setIsScrapingAll(true);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/sources/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সকল সোর্স স্ক্যান ব্যর্থ হয়েছে।');
      setSuccessMessage(`সকল সক্রিয় সোর্স সফলভাবে স্ক্যান হয়েছে! মোট ${data.report?.totalNewDrafts || 0}টি নতুন সার্কুলার ড্রাফটে যুক্ত হয়েছে।`);
      fetchSources();
    } catch (err: any) {
      setFetchError(err.message || 'স্ক্যানিংয়ে সমস্যা হয়েছে।');
    } finally {
      setIsScrapingAll(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormOrgName('');
    setFormUrl('');
    setFormClassification('official');
    setFormMethod('html_scrape');
    setFormScanInterval('360');
    setFormEnabled(true);
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (src: JobSource) => {
    resetForm();
    setEditingSource(src);
    setFormName(src.name);
    setFormOrgName(src.organizationName || '');
    setFormUrl(src.sourceUrl);
    setFormClassification(src.classification || 'official');
    setFormMethod(src.collectionMethod || 'html_scrape');
    setFormScanInterval(String(src.scanIntervalMinutes || 360));
    setFormEnabled(src.enabled !== undefined ? src.enabled : true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('সোর্সের নাম কমপক্ষে ২ অক্ষরের হতে হবে।');
      return;
    }

    try {
      new URL(formUrl);
    } catch {
      setFormError('সঠিক URL প্রদান করুন (যেমন: https://example.gov.bd)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify({
          name: formName.trim(),
          organizationName: formOrgName.trim() || undefined,
          sourceUrl: formUrl.trim(),
          classification: formClassification,
          collectionMethod: formMethod,
          scanIntervalMinutes: parseInt(formScanInterval, 10) || 360,
          enabled: formEnabled
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সোর্স যোগ করতে ব্যর্থ হয়েছে।');

      setSuccessMessage(`সোর্স "${formName}" সফলভাবে তৈরি হয়েছে।`);
      setShowAddModal(false);
      resetForm();
      fetchSources();
    } catch (err: any) {
      setFormError(err.message || 'সোর্স সংরক্ষণ করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;
    setFormError(null);

    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('সোর্সের নাম প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/sources/${editingSource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify({
          name: formName.trim(),
          organizationName: formOrgName.trim() || undefined,
          sourceUrl: formUrl.trim(),
          classification: formClassification,
          collectionMethod: formMethod,
          scanIntervalMinutes: parseInt(formScanInterval, 10) || 360,
          enabled: formEnabled
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সোর্স আপডেট ব্যর্থ হয়েছে।');

      setSuccessMessage(`সোর্স "${formName}" সফলভাবে আপডেট হয়েছে।`);
      setEditingSource(null);
      resetForm();
      fetchSources();
    } catch (err: any) {
      setFormError(err.message || 'আপডেট করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEnabled = async (src: JobSource) => {
    const newStatus = !(src.enabled ?? true);
    try {
      const res = await fetch(`/api/admin/sources/${src.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify({ enabled: newStatus })
      });
      if (res.ok) {
        setSuccessMessage(`সোর্স "${src.name}" ${newStatus ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`);
        fetchSources();
      }
    } catch (err: any) {
      setFetchError(err.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteSource = async (src: JobSource) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${src.name}" সোর্সটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/admin/sources/${src.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        setSuccessMessage(`সোর্স "${src.name}" মুছে ফেলা হয়েছে।`);
        fetchSources();
      }
    } catch (err: any) {
      setFetchError(err.message || 'মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  const filteredSources = useMemo(() => {
    return sources.filter(s => {
      const matchSearch =
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sourceUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClassification =
        classificationFilter === 'all' || (s.classification || 'official') === classificationFilter;

      const currentHealth = s.healthStatus || (s.enabled ? 'healthy' : 'paused');
      const matchHealth = healthFilter === 'all' || currentHealth === healthFilter;

      return matchSearch && matchClassification && matchHealth;
    });
  }, [sources, searchTerm, classificationFilter, healthFilter]);

  const stats = useMemo(() => {
    const total = sources.length;
    const active = sources.filter(s => s.enabled ?? true).length;
    const paused = sources.filter(s => (s.enabled ?? true) === false).length;
    const collected = sources.reduce((acc, s) => acc + (s.metrics?.collected || 0), 0);
    return { total, active, paused, collected };
  }, [sources]);

  return (
    <div className="w-full space-y-6">
      {/* 1. UNIFIED STATS ROW (100% Cohesive white cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট সোর্স</span>
            <span className="text-slate-400">
              <Radio className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.total}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">নিবন্ধিত পোর্টাল ও সোর্স</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সক্রিয় সোর্স</span>
            <span className="text-slate-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.active}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">নিয়মিত স্ক্যান সক্রিয়</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">স্থগিত সোর্স</span>
            <span className="text-slate-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.paused}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">সাময়িক বন্ধ রাখা হয়েছে</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সংগৃহীত বিজ্ঞপ্তি</span>
            <span className="text-slate-400">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.collected}টি</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">মোট সংগৃহীত সার্কুলার</span>
        </div>
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {fetchError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{fetchError}</span>
          </div>
          <button type="button" onClick={() => setFetchError(null)} className="text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SUB-TABS & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <FluidTabBar
          tabs={[
            { id: 'sources', label: `সোর্স তালিকা ও অবস্থা (${sources.length})`, icon: Radio },
            { id: 'runs', label: `স্ক্যান ও সিঙ্ক হিস্ট্রি (${spiderRuns.length})`, icon: History }
          ]}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'sources' | 'runs');
            if (id === 'runs') fetchSpiderRuns();
          }}
          variant="white"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScrapeAll}
            disabled={isScrapingAll}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScrapingAll ? 'animate-spin' : ''}`} />
            <span>{isScrapingAll ? 'স্ক্যান চলছে...' : 'সকল সক্রিয় সোর্স স্ক্যান করুন'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন সোর্স যোগ করুন</span>
          </button>
        </div>
      </div>

      {activeTab === 'sources' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="সোর্সের নাম বা URL দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">সকল ধরন</option>
                <option value="official">সরকারি পোর্টাল</option>
                <option value="news">সংবাদপত্র</option>
                <option value="job_board">জব পোর্টাল</option>
                <option value="custom_api">কাস্টম সোর্স</option>
              </select>

              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="healthy">সক্রিয়</option>
                <option value="paused">স্থগিত</option>
                <option value="degraded">ধীরগতির</option>
                <option value="failing">ত্রুটিযুক্ত</option>
              </select>
            </div>
          </div>

          {/* Sources Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                <span>সোর্স তালিকা লোড হচ্ছে...</span>
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 text-sm">কোনো সোর্স পাওয়া যায়নি</div>
                <p className="text-slate-400">ফিল্টার পরিবর্তন করুন অথবা নতুন সোর্স যোগ করুন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">সোর্সের নাম ও বিবরণ</th>
                      <th className="py-3 px-3">কালেকশন মেথড</th>
                      <th className="py-3 px-3">স্ক্যান ব্যবধান</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3">সংগৃহীত</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSources.map((src) => {
                      const classificationInfo = CLASSIFICATION_LABELS[src.classification || 'official'] || CLASSIFICATION_LABELS.official;
                      const methodInfo = METHOD_LABELS[src.collectionMethod || 'html_scrape'] || METHOD_LABELS.html_scrape;
                      const currentHealth = src.healthStatus || (src.enabled ? 'healthy' : 'paused');
                      const healthInfo = HEALTH_CONFIG[currentHealth] || HEALTH_CONFIG.healthy;
                      const isEnabled = src.enabled ?? true;
                      const isScraping = scrapingSourceId === src.id;
                      const isTesting = testingSourceId === src.id;

                      return (
                        <tr key={src.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${healthInfo.dot}`} />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{src.name}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${classificationInfo.color}`}>
                                    {classificationInfo.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <a
                                    href={src.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-[10px] text-emerald-700 hover:underline max-w-xs truncate"
                                    title={src.sourceUrl}
                                  >
                                    {src.sourceUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-700">
                            {methodInfo.label}
                          </td>

                          <td className="py-3.5 px-3 text-slate-700">
                            {src.scanIntervalMinutes ? `প্রতি ${Math.round(src.scanIntervalMinutes / 60)} ঘণ্টা পর` : 'প্রতি ৬ ঘণ্টা পর'}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 font-bold text-xs ${healthInfo.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${healthInfo.dot}`} />
                              <span>{healthInfo.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-slate-800">
                            {src.metrics?.collected || 0}টি
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleScrapeSource(src)}
                                disabled={isScraping}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="এখনই সার্কুলার সংগ্রহ করুন"
                              >
                                <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                                <span>সংগ্রহ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleTestSource(src)}
                                disabled={isTesting}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                title="কানেকশন টেস্ট করুন"
                              >
                                <span>{isTesting ? 'টেস্ট...' : 'টেস্ট'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleEnabled(src)}
                                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                  isEnabled
                                    ? 'text-amber-700 hover:bg-amber-50'
                                    : 'text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title={isEnabled ? 'সোর্স স্থগিত করুন' : 'সোর্স চালু করুন'}
                              >
                                {isEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(src)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="সম্পাদনা"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSource(src)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RUNS HISTORY */}
      {activeTab === 'runs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">
              সর্বশেষ স্ক্যান ও স্ক্র্যাপ রেকর্ড ({spiderRuns.length}টি)
            </h2>
            <button
              type="button"
              onClick={fetchSpiderRuns}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
            >
              রিফ্রেশ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">রান আইডি</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">নতুন সার্কুলার</th>
                  <th className="py-2.5 px-3">সময়কাল</th>
                  <th className="py-2.5 px-4 text-right">রান টাইম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {spiderRuns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      কোনো রান হিস্ট্রি পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  spiderRuns.slice(0, 20).map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{run.id}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          run.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {run.status === 'completed' ? 'সফল' : 'ব্যর্থ'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        {(run as any).newDraftsCreated ?? (run as any).jobsExtracted ?? 0}টি
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                        {run.startedAt ? new Date(run.startedAt).toLocaleTimeString('bn-BD') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingSource) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingSource ? 'সোর্স সম্পাদনা করুন' : 'নতুন চাকরির সোর্স যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSource(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={editingSource ? handleEditSubmit : handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">সোর্সের নাম *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: বাংলাদেশ ব্যাংক রিক্রুটমেন্ট"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">সোর্স URL *</label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://erecruitment.bb.org.bd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">সোর্সের শ্রেণি</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as SourceClassification)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="official">সরকারি পোর্টাল</option>
                    <option value="news">জাতীয় সংবাদপত্র</option>
                    <option value="job_board">জব পোর্টাল</option>
                    <option value="custom_api">কাস্টম সোর্স</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">স্ক্যান ব্যবধান</label>
                  <select
                    value={formScanInterval}
                    onChange={(e) => setFormScanInterval(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="60">প্রতি ১ ঘণ্টা পর</option>
                    <option value="180">প্রতি ৩ ঘণ্টা পর</option>
                    <option value="360">প্রতি ৬ ঘণ্টা পর</option>
                    <option value="720">প্রতি ১২ ঘণ্টা পর</option>
                    <option value="1440">প্রতি ২৪ ঘণ্টা পর</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSource(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingSource ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
