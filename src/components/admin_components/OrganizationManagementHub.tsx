'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Globe,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  X,
  Check,
  Eye,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';
import { CompanyProfile, JobCircular } from '@/types';


import { getAdminHeaders } from '@/lib/axios';

interface OrganizationManagementHubProps {
  onRefreshData?: () => void;
  activeTab?: string;
}

export default function OrganizationManagementHub({ onRefreshData, activeTab }: OrganizationManagementHubProps) {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [allJobs, setAllJobs] = useState<JobCircular[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [companyJobsFilter, setCompanyJobsFilter] = useState<'with_jobs' | 'all'>('with_jobs');

  useEffect(() => {
    if (activeTab === 'employer-verification') {
      setVerificationFilter('unverified');
    } else if (activeTab === 'company-jobs') {
      setCompanyJobsFilter('with_jobs');
    }
  }, [activeTab]);

  // Associated Jobs Drawer
  const [inspectingOrg, setInspectingOrg] = useState<CompanyProfile | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<CompanyProfile | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formOrgType, setFormOrgType] = useState<CompanyProfile['organizationType']>('government');
  const [formIndustry, setFormIndustry] = useState('সরকারি মন্ত্রণালয় / অধিদপ্তর');
  const [formDistrict, setFormDistrict] = useState('ঢাকা');
  const [formDivision, setFormDivision] = useState('Dhaka');
  const [formWebsite, setFormWebsite] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVerified, setFormVerified] = useState(true);
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Action Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resComp, resJobs] = await Promise.all([
        fetch('/api/admin/companies', { headers: getAdminHeaders() }),
        fetch('/api/admin/jobs', { headers: getAdminHeaders() })
      ]);

      if (resComp.ok) {
        const d = await resComp.json();
        setCompanies(d.companies || []);
      }
      if (resJobs.ok) {
        const d = await resJobs.json();
        setAllJobs(d.jobs || []);
      }
    } catch (err: any) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormName('');
    setFormNameBn('');
    setFormOrgType('government');
    setFormIndustry('সরকারি মন্ত্রণালয় / অধিদপ্তর');
    setFormDistrict('ঢাকা');
    setFormDivision('Dhaka');
    setFormWebsite('');
    setFormLogo('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80');
    setFormDescription('');
    setFormAddress('');
    setFormEmail('');
    setFormPhone('');
    setFormVerified(true);
    setFormStatus('active');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (comp: CompanyProfile) => {
    setEditingOrg(comp);
    setFormName(comp.name);
    setFormNameBn(comp.nameBn || comp.name);
    setFormOrgType(comp.organizationType || 'government');
    setFormIndustry(comp.industry);
    setFormDistrict(comp.district || 'ঢাকা');
    setFormDivision(comp.division || 'Dhaka');
    setFormWebsite(comp.website || '');
    setFormLogo(comp.logo || '');
    setFormDescription(comp.description || '');
    setFormAddress(comp.address || '');
    setFormEmail(comp.contactEmail || '');
    setFormPhone(comp.contactPhone || '');
    setFormVerified(comp.verified);
    setFormStatus(comp.status === 'suspended' ? 'suspended' : 'active');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Real-time Duplicate Check Warning for Create
  const duplicateWarning = useMemo(() => {
    if (editingOrg || !formName.trim()) return null;
    const norm = formName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = companies.find(c => {
      const cNorm = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchName = cNorm === norm;
      const matchWeb = formWebsite && c.website && c.website.toLowerCase().trim() === formWebsite.toLowerCase().trim();
      return matchName || matchWeb;
    });
    if (found) {
      return `সতর্কতা: একই নামে প্রতিষ্ঠান ইতিমধ্যে বিদ্যমান: "${found.name}" (আইডি: ${found.id})`;
    }
    return null;
  }, [formName, formWebsite, editingOrg, companies]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('প্রতিষ্ঠানের নাম আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        name: formName.trim(),
        nameBn: formNameBn.trim() || formName.trim(),
        organizationType: formOrgType,
        industry: formIndustry.trim(),
        district: formDistrict,
        division: formDivision,
        website: formWebsite.trim(),
        logo: formLogo.trim(),
        description: formDescription.trim(),
        address: formAddress.trim(),
        contactEmail: formEmail.trim(),
        contactPhone: formPhone.trim(),
        verified: formVerified,
        status: formStatus
      };

      if (editingOrg) {
        // PUT /api/admin/companies/:id
        const res = await fetch(`/api/admin/companies/${editingOrg.id}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'হালনাগাদ ব্যর্থ');
        setFeedback({ type: 'success', text: 'প্রতিষ্ঠান তথ্য সফলভাবে হালনাগাদ করা হয়েছে!' });
      } else {
        // POST /api/admin/companies
        const res = await fetch('/api/admin/companies', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'তৈরি ব্যর্থ');
        setFeedback({ type: 'success', text: 'নতুন প্রতিষ্ঠান সফলভাবে তৈরি করা হয়েছে!' });
      }

      setIsModalOpen(false);
      fetchData();
      onRefreshData?.();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (comp: CompanyProfile) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${comp.nameBn || comp.name}" প্রতিষ্ঠানটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/companies/${comp.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'মুছে ফেলা ব্যর্থ');
      }
      setFeedback({ type: 'success', text: 'প্রতিষ্ঠান সফলভাবে মুছে ফেলা হয়েছে।' });
      fetchData();
      onRefreshData?.();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleToggleVerify = async (comp: CompanyProfile) => {
    try {
      const res = await fetch(`/api/admin/companies/${comp.id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ verified: !comp.verified })
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          text: `${comp.nameBn || comp.name} এর ভেরিফিকেশন স্ট্যাটাস পরিবর্তন করা হয়েছে।`
        });
        fetchData();
        onRefreshData?.();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nameBn && c.nameBn.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || c.organizationType === typeFilter;
      const matchesStatus = statusFilter === 'all' || (c.status || 'active') === statusFilter;
      const matchesDistrict = districtFilter === 'all' || c.district === districtFilter;

      return matchesSearch && matchesType && matchesStatus && matchesDistrict;
    });
  }, [companies, searchQuery, typeFilter, statusFilter, districtFilter]);

  // Dedicated filtering for Employer Verification tab
  const filteredForVerification = useMemo(() => {
    return companies.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nameBn && c.nameBn.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || c.organizationType === typeFilter;
      const matchesVerify = verificationFilter === 'all' || (verificationFilter === 'verified' ? c.verified : !c.verified);

      return matchesSearch && matchesType && matchesVerify;
    });
  }, [companies, searchQuery, typeFilter, verificationFilter]);

  // Dedicated grouping for Company Jobs tab
  const orgsWithJobs = useMemo(() => {
    return companies.map(c => {
      const orgJobs = allJobs.filter(j => 
        (j.organization && j.organization.toLowerCase() === c.name.toLowerCase()) ||
        (c.nameBn && j.organization && j.organization.toLowerCase() === c.nameBn.toLowerCase())
      );
      return {
        company: c,
        jobs: orgJobs
      };
    }).filter(item => {
      if (companyJobsFilter === 'with_jobs') return item.jobs.length > 0;
      return true;
    }).filter(item => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      const matchesOrg = item.company.name.toLowerCase().includes(q) || (item.company.nameBn && item.company.nameBn.toLowerCase().includes(q));
      const matchesJob = item.jobs.some(j => j.title.toLowerCase().includes(q));
      return matchesOrg || matchesJob;
    });
  }, [companies, allJobs, searchQuery, companyJobsFilter]);

  // Associated jobs for inspecting drawer
  const associatedJobsForInspecting = useMemo(() => {
    if (!inspectingOrg) return [];
    return allJobs.filter(j => 
      (j.organization && j.organization.toLowerCase() === inspectingOrg.name.toLowerCase()) ||
      (inspectingOrg.nameBn && j.organization && j.organization.toLowerCase() === inspectingOrg.nameBn.toLowerCase())
    );
  }, [inspectingOrg, allJobs]);

  return (
    <div className="w-full space-y-6">
      {/* 1. UNIFIED STATS ROW (Identical style, pure white, cohesive polish) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Card 1: Total Companies */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট প্রতিষ্ঠান</span>
            <span className="text-slate-400">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {companies.length}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ডাটাবেজে নিবন্ধিত</span>
        </div>

        {/* Card 2: Government */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সরকারি মন্ত্রণালয় ও দপ্তর</span>
            <span className="text-slate-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {companies.filter(c => c.organizationType === 'government').length}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">বিসিএস ও সরকারি চাকরি</span>
        </div>

        {/* Card 3: Autonomous & Banks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">স্বায়ত্তশাসিত ও ব্যাংক</span>
            <span className="text-slate-400">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {companies.filter(c => c.organizationType === 'autonomous' || c.organizationType === 'bank').length}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ব্যাংক ও করপোরেশন</span>
        </div>

        {/* Card 4: Active Circulars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সক্রিয় চাকরির সার্কুলার</span>
            <span className="text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {allJobs.length}টি
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">চলমান নিয়োগ বিজ্ঞপ্তি</span>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW A: EMPLOYER VERIFICATION CENTER
         ========================================================================= */}
      {activeTab === 'employer-verification' && (
        <div className="space-y-4 animate-fluid-tab">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="প্রতিষ্ঠান বা জেলা দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">সকল প্রতিষ্ঠান ({companies.length})</option>
                <option value="unverified">শুধুমাত্র অপেক্ষমাণ / অযাচাইকৃত ({companies.filter(c => !c.verified).length})</option>
                <option value="verified">শুধুমাত্র যাচাইকৃত ({companies.filter(c => c.verified).length})</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">সকল ধরন</option>
                <option value="government">সরকারি মন্ত্রণালয়/বিভাগ</option>
                <option value="bank">ব্যাংক ও আর্থিক প্রতিষ্ঠান</option>
                <option value="autonomous">স্বায়ত্তশাসিত সংস্থা</option>
                <option value="private">বেসরকারি করপোরেট</option>
                <option value="ngo">এনজিও / উন্নয়ন সংস্থা</option>
              </select>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Verification Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">প্রতিষ্ঠানের নাম ও পরিচিতি</th>
                    <th className="py-3 px-3">ধরন</th>
                    <th className="py-3 px-3">যোগাযোগ ও ওয়েবসাইট</th>
                    <th className="py-3 px-3 text-center">সার্কুলার</th>
                    <th className="py-3 px-3 text-center">ভেরিফিকেশন অবস্থা</th>
                    <th className="py-3 px-4 text-right">অনুমোদন কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredForVerification.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        কোনো প্রতিষ্ঠান পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredForVerification.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {comp.logo ? (
                                <img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
                              ) : (
                                <Building className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{comp.nameBn || comp.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {comp.district || 'ঢাকা'} • {comp.industry || 'সাধারণ'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                            {comp.organizationType === 'government' ? 'সরকারি' :
                             comp.organizationType === 'bank' ? 'ব্যাংক' :
                             comp.organizationType === 'autonomous' ? 'স্বায়ত্তশাসিত' :
                             comp.organizationType === 'private' ? 'প্রাইভেট' : 'অন্যান্য'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-0.5 text-[11px]">
                            {comp.website && (
                              <a
                                href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{comp.website.replace(/^https?:\/\//, '')}</span>
                              </a>
                            )}
                            {(comp.contactEmail || (comp as any).email) && (
                              <div className="text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{comp.contactEmail || (comp as any).email}</span>
                              </div>
                            )}
                            {(comp.contactPhone || (comp as any).phone) && (
                              <div className="text-slate-500 flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{comp.contactPhone || (comp as any).phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setInspectingOrg(comp)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
                          >
                            <Briefcase className="w-3 h-3" />
                            <span>{comp.activeJobsCount || 0}টি</span>
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            comp.verified 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {comp.verified ? <><Check className="w-3 h-3" /> যাচাইকৃত</> : 'অপেক্ষমাণ'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleVerify(comp)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 ${
                                comp.verified
                                  ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{comp.verified ? 'যাচাই প্রত্যাহার' : 'অনুমোদন দিন'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(comp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: COMPANY JOBS TRACKER
         ========================================================================= */}
      {activeTab === 'company-jobs' && (
        <div className="space-y-4 animate-fluid-tab">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="প্রতিষ্ঠান বা সার্কুলারের শিরোনাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={companyJobsFilter}
                onChange={(e) => setCompanyJobsFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="with_jobs">শুধুমাত্র সক্রিয় সার্কুলারযুক্ত প্রতিষ্ঠান</option>
                <option value="all">সকল প্রতিষ্ঠান</option>
              </select>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Company-wise Jobs List */}
          <div className="space-y-4">
            {orgsWithJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center text-xs text-slate-400">
                কোনো সার্কুলার বা প্রতিষ্ঠান পাওয়া যায়নি।
              </div>
            ) : (
              orgsWithJobs.map((item) => (
                <div key={item.company.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {item.company.logo ? (
                          <img src={item.company.logo} alt={item.company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{item.company.nameBn || item.company.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.company.organizationType === 'government' ? 'সরকারি' :
                             item.company.organizationType === 'bank' ? 'ব্যাংক' :
                             item.company.organizationType === 'autonomous' ? 'স্বায়ত্তশাসিত' : 'অন্যান্য'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          অবস্থান: {item.company.district || 'ঢাকা'} • সক্রিয় সার্কুলার: {item.jobs.length}টি
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingOrg(item.company)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>বিস্তারিত ভিউ</span>
                      </button>
                    </div>
                  </div>

                  {item.jobs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      এই প্রতিষ্ঠানের অধীনে বর্তমানে কোনো সক্রিয় সার্কুলার নেই।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.jobs.map((job) => (
                        <div key={job.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2 text-xs">
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{job.title}</div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                              <span>মোট পদ: <strong className="font-mono text-slate-800">{job.totalPosts || 0}টি</strong></span>
                              <span>•</span>
                              <span>আবেদনের শেষ তারিখ: <strong className="font-mono text-slate-800">{job.deadline || 'চলমান'}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              job.status === 'PUBLISHED' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {job.status === 'PUBLISHED' ? 'লাইভ প্রকাশিত' : 'খসড়া'}
                            </span>

                            <Link
                              href={`/jobs/${job.id}`}
                              target="_blank"
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <span>সার্কুলার দেখুন</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: COMPANY DIRECTORY (DEFAULT)
         ========================================================================= */}
      {(!activeTab || activeTab === 'company-directory') && (
        <div className="space-y-4 animate-fluid-tab">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="প্রতিষ্ঠানের নাম, জেলা বা শিল্প খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">সকল ধরন</option>
                <option value="government">সরকারি মন্ত্রণালয়/বিভাগ</option>
                <option value="bank">ব্যাংক ও আর্থিক প্রতিষ্ঠান</option>
                <option value="autonomous">স্বায়ত্তশাসিত সংস্থা</option>
                <option value="private">বেসরকারি করপোরেট</option>
                <option value="ngo">এনজিও / উন্নয়ন সংস্থা</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="active">সক্রিয়</option>
                <option value="suspended">স্থগিত</option>
              </select>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন প্রতিষ্ঠান যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Organizations Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">প্রতিষ্ঠানের নাম ও লোগো</th>
                    <th className="py-3 px-3">ধরন ও ক্যাটাগরি</th>
                    <th className="py-3 px-3">অবস্থান / জেলা</th>
                    <th className="py-3 px-3 text-center">সক্রিয় সার্কুলার</th>
                    <th className="py-3 px-3 text-center">ভেরিফিকেশন</th>
                    <th className="py-3 px-4 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCompanies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {comp.logo ? (
                              <img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{comp.nameBn || comp.name}</span>
                              {comp.nameBn && comp.name !== comp.nameBn && (
                                <span className="text-[10px] text-slate-400 font-mono font-normal">({comp.name})</span>
                              )}
                            </div>
                            {comp.website && (
                              <a
                                href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Globe className="w-2.5 h-2.5" />
                                <span>{comp.website.replace(/^https?:\/\//, '')}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {comp.organizationType === 'government' ? 'সরকারি' :
                           comp.organizationType === 'bank' ? 'ব্যাংক' :
                           comp.organizationType === 'autonomous' ? 'স্বায়ত্তশাসিত' :
                           comp.organizationType === 'private' ? 'প্রাইভেট' : 'অন্যান্য'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{comp.industry}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-700 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{comp.district || 'ঢাকা'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectingOrg(comp)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Briefcase className="w-3 h-3" />
                          <span>{comp.activeJobsCount || 0}টি</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVerify(comp)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors inline-flex items-center gap-1 ${
                            comp.verified 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {comp.verified ? <><Check className="w-3 h-3" /> যাচাইকৃত</> : 'অযাচাইকৃত'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectingOrg(comp)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="সার্কুলার তালিকা দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(comp)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comp)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ASSOCIATED JOBS DRAWER MODAL */}
      {inspectingOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  {inspectingOrg.logo ? (
                    <img src={inspectingOrg.logo} alt={inspectingOrg.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">{inspectingOrg.nameBn || inspectingOrg.name}</h3>
                  <p className="text-xs text-slate-500">মোট সক্রিয় সার্কুলার: {associatedJobsForInspecting.length}টি</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingOrg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {associatedJobsForInspecting.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  এই প্রতিষ্ঠানের অধীনে বর্তমানে কোনো সক্রিয় চাকরি প্রকাশিত নেই।
                </div>
              ) : (
                associatedJobsForInspecting.map((job) => (
                  <div key={job.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        পদ: {job.totalPosts || 0} টি • শেষ তারিখ: {job.deadline}
                      </div>
                    </div>
                    <Link
                      href={`/jobs/${job.id}`}
                      target="_blank"
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <span>দেখুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingOrg(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-700" />
                <span>{editingOrg ? 'প্রতিষ্ঠানের বিবরণ সম্পাদনা' : 'নতুন প্রতিষ্ঠান তৈরি'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম (ইংরেজি) *</label>
                <input
                  type="text"
                  placeholder="যেমন: Bangladesh Railway"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম (বাংলা) *</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলাদেশ রেলওয়ে"
                  value={formNameBn}
                  onChange={(e) => setFormNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের ধরন</label>
                  <select
                    value={formOrgType}
                    onChange={(e) => setFormOrgType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="government">সরকারি মন্ত্রণালয় / বিভাগ</option>
                    <option value="bank">ব্যাংক ও আর্থিক প্রতিষ্ঠান</option>
                    <option value="autonomous">স্বায়ত্তশাসিত সংস্থা</option>
                    <option value="private">বেসরকারি কোম্পানি</option>
                    <option value="ngo">এনজিও / উন্নয়ন সংস্থা</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিল্প / খাত (Industry)</label>
                  <input
                    type="text"
                    placeholder="যেমন: পরিবহন ও যোগাযোগ"
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">হেডকোয়ার্টার জেলা</label>
                  <input
                    type="text"
                    placeholder="যেমন: ঢাকা"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">অফিসিয়াল ওয়েবসাইট</label>
                  <input
                    type="text"
                    placeholder="https://railway.gov.bd"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">লোগো / মনোগ্রাম URL</label>
                <input
                  type="text"
                  placeholder="https://... বা /icons/..."
                  value={formLogo}
                  onChange={(e) => setFormLogo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">যোগাযোগ ইমেইল</label>
                  <input
                    type="email"
                    placeholder="info@railway.gov.bd"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">যোগাযোগ ফোন</label>
                  <input
                    type="text"
                    placeholder="02-9568452"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formVerified}
                    onChange={(e) => setFormVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>অফিসিয়াল ভেরিফাইড প্রতিষ্ঠান</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{editingOrg ? 'হালনাগাদ করুন' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
