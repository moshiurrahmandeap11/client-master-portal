'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Zap, 
  Sliders, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Check,
  X,
  Upload,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { storage } from '@/lib/store';
import { fetchWithAuth } from '@/lib/axios';
import { useCandidateData } from '@/components/shared/CandidateDataProvider';
import { toast, showAlert, showConfirm, showSuccess, showError } from '@/lib/sweetalert';
import { Button } from '@/components/ui/Button';
import { CandidateProfile, EducationRecord, ExperienceRecord } from '@/types';
import { emptyCandidateProfile as mockUserProfile } from '@/data/candidateDefaults';
import { BD_DIVISIONS_EN, BD_DIVISIONS_MAP, getAllDistrictsList, getDivisionForDistrict, getDistrictsForDivision, getUpazilasForDistrict, normalizeToEnglishDistrict, normalizeToEnglishDivision } from '@/constants';

export default function ProfilePage() {
  const { profile: candidateProfile, refresh: refreshCandidateData } = useCandidateData();
  const [profile, setProfile] = useState<CandidateProfile>(mockUserProfile);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'experience' | 'preferences' | 'quota'>('personal');

  // Skills state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  // Experience state
  const [newExpDesignation, setNewExpDesignation] = useState('');
  const [newExpOrg, setNewExpOrg] = useState('');
  const [newExpStartDate, setNewExpStartDate] = useState('');
  const [newExpEndDate, setNewExpEndDate] = useState('');
  const [newExpIsCurrent, setNewExpIsCurrent] = useState(false);
  const [newExpResponsibilities, setNewExpResponsibilities] = useState('');
  const [isSavingExp, setIsSavingExp] = useState(false);

  // Career Preferences state
  const [prefCategories, setPrefCategories] = useState<string[]>([]);
  const [prefOrgTypes, setPrefOrgTypes] = useState<string[]>([]);
  const [prefDivisions, setPrefDivisions] = useState<string[]>([]);
  const [prefSalaryMin, setPrefSalaryMin] = useState<string>('');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Structured Address States
  const [sameAsPresent, setSameAsPresent] = useState<boolean>(true);
  
  // Present Address Fields (Teletalk / Govt / Bank English Standard)
  const [presentCareOf, setPresentCareOf] = useState<string>('');
  const [presentVillageRoad, setPresentVillageRoad] = useState<string>('');
  const [presentDivision, setPresentDivision] = useState<string>('DHAKA');
  const [presentDistrict, setPresentDistrict] = useState<string>('DHAKA');
  const [presentThana, setPresentThana] = useState<string>('MIRPUR');
  const [presentPostOffice, setPresentPostOffice] = useState<string>('');
  const [presentPostCode, setPresentPostCode] = useState<string>('');

  // Permanent Address Fields (Teletalk / Govt / Bank English Standard)
  const [permanentCareOf, setPermanentCareOf] = useState<string>('');
  const [permanentVillageRoad, setPermanentVillageRoad] = useState<string>('');
  const [permanentDivision, setPermanentDivision] = useState<string>('DHAKA');
  const [permanentDistrict, setPermanentDistrict] = useState<string>('DHAKA');
  const [permanentThana, setPermanentThana] = useState<string>('MIRPUR');
  const [permanentPostOffice, setPermanentPostOffice] = useState<string>('');
  const [permanentPostCode, setPermanentPostCode] = useState<string>('');

  // Auto-selected Upazila / Thana Custom Input Modes
  const [homeDistrictCustomMode, setHomeDistrictCustomMode] = useState<boolean>(false);
  const [presentCustomDivisionMode, setPresentCustomDivisionMode] = useState<boolean>(false);
  const [presentCustomDistrictMode, setPresentCustomDistrictMode] = useState<boolean>(false);
  const [presentCustomThanaMode, setPresentCustomThanaMode] = useState<boolean>(false);
  const [permanentCustomDivisionMode, setPermanentCustomDivisionMode] = useState<boolean>(false);
  const [permanentCustomDistrictMode, setPermanentCustomDistrictMode] = useState<boolean>(false);
  const [permanentCustomThanaMode, setPermanentCustomThanaMode] = useState<boolean>(false);
  const [customQuotaMode, setCustomQuotaMode] = useState<boolean>(false);
  const [customQuotaTitle, setCustomQuotaTitle] = useState<string>('');
  const [eduCustomLevelMode, setEduCustomLevelMode] = useState<boolean>(false);
  const [eduCustomBoardMode, setEduCustomBoardMode] = useState<boolean>(false);

  // Education Modal / Form State
  const [showEduModal, setShowEduModal] = useState(false);
  const [isSavingEdu, setIsSavingEdu] = useState(false);
  const [eduLevel, setEduLevel] = useState('স্নাতক (অনার্স)');
  const [eduDegree, setEduDegree] = useState('');
  const [eduBoard, setEduBoard] = useState('');
  const [eduRoll, setEduRoll] = useState('');
  const [eduReg, setEduReg] = useState('');
  const [eduYear, setEduYear] = useState('2021');
  const [eduResult, setEduResult] = useState('');

  // AI Resume / CV PDF Import States
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDraggingResume, setIsDraggingResume] = useState<boolean>(false);
  const [isImportingResume, setIsImportingResume] = useState<boolean>(false);
  const [resumeImportSuccess, setResumeImportSuccess] = useState<string | null>(null);
  const [resumeImportError, setResumeImportError] = useState<string | null>(null);
  const [isResumeCardExpanded, setIsResumeCardExpanded] = useState<boolean>(true);

  const mapGeminiResumeToProfile = (parsed: any, currentProfile: CandidateProfile): CandidateProfile => {
    // Normalize Education
    const educations: EducationRecord[] = (parsed.educations || []).map((e: any, idx: number) => {
      let lvl = 'স্নাতক (অনার্স)';
      const rawLvl = (e.level || '').toLowerCase();
      if (rawLvl.includes('ssc') || rawLvl.includes('secondary') || rawLvl.includes('dakhil')) {
        lvl = 'মাধ্যমিক (এসএসসি / সমমান)';
      } else if (rawLvl.includes('hsc') || rawLvl.includes('higher') || rawLvl.includes('alim') || rawLvl.includes('diploma')) {
        lvl = 'উচ্চ মাধ্যমিক (এইচএসসি / সমমান)';
      } else if (rawLvl.includes('master') || rawLvl.includes('post') || rawLvl.includes('mba') || rawLvl.includes('m.sc')) {
        lvl = 'স্নাতকোত্তর (মাস্টার্স)';
      }

      return {
        id: 'EDU-' + Date.now().toString(36) + '-' + idx,
        level: lvl,
        degree: e.examTitle || e.degree || (lvl === 'মাধ্যমিক (এসএসসি / সমমান)' ? 'এসএসসি' : 'এইচএসসি'),
        boardOrUni: e.boardUniversity || e.institute || 'ঢাকা',
        roll: e.rollNumber || 'N/A',
        reg: e.regNumber || 'N/A',
        year: String(e.passingYear || '2020'),
        result: e.gpaCgpa ? String(e.gpaCgpa) : 'GPA 5.00',
      };
    });

    // Normalize Experiences
    const experiences = (parsed.experiences || []).map((exp: any, idx: number) => ({
      id: 'exp_' + Date.now() + '_' + idx,
      designation: exp.designation || 'কর্মকর্তা',
      organization: exp.organization || 'প্রতিষ্ঠান',
      startDate: exp.startDate || '2022-01',
      endDate: exp.isCurrent ? '' : (exp.endDate || '2024-01'),
      isCurrent: Boolean(exp.isCurrent),
      responsibilities: exp.responsibilities || '',
    }));

    // Normalize Skills
    const skills = (parsed.skills || []).map((s: string, idx: number) => ({
      id: 'sk_' + Date.now() + '_' + idx,
      name: typeof s === 'string' ? s : (s as any).name,
      proficiency: 'INTERMEDIATE',
    }));

    return {
      ...currentProfile,
      name: parsed.name || currentProfile.name,
      nameBn: parsed.nameBn || currentProfile.nameBn || currentProfile.name,
      fatherName: parsed.fatherName || currentProfile.fatherName,
      motherName: parsed.motherName || currentProfile.motherName,
      dob: parsed.dob || currentProfile.dob,
      gender: (parsed.gender === 'female' ? 'female' : 'male') as any,
      maritalStatus: (parsed.maritalStatus === 'married' ? 'married' : 'single') as any,
      religion: parsed.religion || currentProfile.religion || 'ইসলাম (Islam)',
      nid: parsed.nid || currentProfile.nid,
      phone: parsed.phone || currentProfile.phone,
      email: parsed.email || currentProfile.email,
      district: parsed.district ? parsed.district.toUpperCase() : currentProfile.district,
      division: parsed.division ? parsed.division.toUpperCase() : currentProfile.division,
      careerObjective: parsed.careerObjective || currentProfile.careerObjective,
      education: educations.length > 0 ? educations : currentProfile.education,
      experiences: experiences.length > 0 ? experiences : currentProfile.experiences,
      skills: skills.length > 0 ? skills : currentProfile.skills,
    };
  };

  const handleImportResumePdf = async () => {
    if (!resumeFile) {
      toast.fire({ icon: 'warning', title: 'অনুগ্রহ করে একটি সিভি PDF ফাইল নির্বাচন করুন।' });
      return;
    }

    setIsImportingResume(true);
    setResumeImportError(null);
    setResumeImportSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', resumeFile);

      const res = await fetchWithAuth('/api/candidate/import-resume', {
        method: 'POST',
        body: formData,
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('সার্ভার থেকে সঠিক ফরম্যাটে উত্তর পাওয়া যায়নি।');
      }

      if (!res.ok || !data.success || !data.parsed) {
        throw new Error(data.message || data.error || 'সিভি বিশ্লেষণ করতে সমস্যা হয়েছে।');
      }

      const updated = mapGeminiResumeToProfile(data.parsed, profile);
      setProfile(updated);

      if (data.parsed.district) {
        const distUpper = data.parsed.district.toUpperCase();
        setPresentDistrict(distUpper);
        setPermanentDistrict(distUpper);
      }
      if (data.parsed.division) {
        const divUpper = data.parsed.division.toUpperCase();
        setPresentDivision(divUpper);
        setPermanentDivision(divUpper);
      }
      if (data.parsed.presentAddress) {
        setPresentVillageRoad(data.parsed.presentAddress);
      }
      if (data.parsed.permanentAddress) {
        setPermanentVillageRoad(data.parsed.permanentAddress);
      }

      await syncProfileToServer(updated);
      try {
        if (refreshCandidateData) {
          await refreshCandidateData();
        }
      } catch {}

      const eduCount = (data.parsed.educations || []).length;
      const expCount = (data.parsed.experiences || []).length;
      const skillCount = (data.parsed.skills || []).length;

      const successMsg = `সিভি সফলভাবে বিশ্লেষণ হয়েছে! ${eduCount}টি ডিগ্রি, ${expCount}টি অভিজ্ঞতা ও ${skillCount}টি স্কিল আপনার প্রোফাইলে যুক্ত হয়েছে।`;
      setResumeImportSuccess(successMsg);
      toast.fire({ icon: 'success', title: successMsg });
      setResumeFile(null);
    } catch (err: any) {
      const msg = err.message || 'সিভি আপলোড ব্যর্থ হয়েছে।';
      setResumeImportError(msg);
      showError(msg, 'ত্রুটি');
    } finally {
      setIsImportingResume(false);
    }
  };

  // Transliterate / Normalize Bengali Address data to English Standard
  const toEnDigits = (str: string) => str.replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09E6 + 0x30));

  const calculateAge = (dobString: string): string => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} বছর ${months} মাস`;
  };

  const convertBnAddressToEn = (str: string): string => {
    if (!str) return '';
    let res = str
      .replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09E6 + 0x30))
      .replace(/বাড়ি|বাড়ি|বাসা/gi, 'HOUSE')
      .replace(/রোড|রাস্তা/gi, 'ROAD')
      .replace(/ফ্ল্যাট/gi, 'FLAT')
      .replace(/গ্রাম/gi, 'VILL')
      .replace(/পোস্ট|ডাকঘর/gi, 'PO')
      .replace(/থানা|উপজেলা/gi, 'THANA')
      .replace(/জেলা/gi, 'DIST');
    
    return res.trim().replace(/,\s*$/, '');
  };

  const populateAddressFromProfile = (p: CandidateProfile) => {
    const pAddr = p.presentAddressDetails || {};
    const permAddr = p.permanentAddressDetails || {};
    
    const pCareOf = (pAddr.careOf || p.fatherName || (p as any).biodata?.fatherName || '').trim();

    const pDistrict = pAddr.district || p.district || 'DHAKA';
    const normDistrict = normalizeToEnglishDistrict(pDistrict);
    const normDiv = normalizeToEnglishDivision(pAddr.division || p.division || getDivisionForDistrict(normDistrict));
    
    // Parse raw address if structured details not yet present
    const rawAddr = p.address || '';
    const postCodeMatch = rawAddr.match(/(\d{4}|[০-৯]{4})/);
    const pCode = toEnDigits(pAddr.postCode || (postCodeMatch ? postCodeMatch[1] : ''));

    const rawVillage = pAddr.villageRoad || (rawAddr ? rawAddr.replace(/(\d{4}|[০-৯]{4})/, '').trim().replace(/,\s*$/, '') : '');
    const pVillage = rawVillage.trim();
    
    let defaultThana = pAddr.upazilaThana || '';
    if (!defaultThana) {
      const upazilas = getUpazilasForDistrict(normDistrict);
      for (const u of upazilas) {
        if (rawAddr.toLowerCase().includes(u.toLowerCase())) {
          defaultThana = u;
          break;
        }
      }
      if (!defaultThana) defaultThana = upazilas[0] || '';
    }

    const normThana = defaultThana.trim();
    const normPostOffice = (pAddr.postOffice || normThana).trim();

    setPresentCareOf(pCareOf);
    setPresentVillageRoad(pVillage);
    setPresentDivision(normDiv);
    setPresentDistrict(normDistrict);
    setPresentThana(normThana);
    setPresentPostOffice(normPostOffice);
    setPresentPostCode(pCode);

    const isSame = p.sameAsPresentAddress ?? true;
    setSameAsPresent(isSame);

    const permDist = normalizeToEnglishDistrict(permAddr.district || pDistrict);
    const permDiv = normalizeToEnglishDivision(permAddr.division || p.division || getDivisionForDistrict(permDist));

    if (isSame) {
      setPermanentCareOf(pCareOf);
      setPermanentVillageRoad(pVillage);
      setPermanentDivision(normDiv);
      setPermanentDistrict(normDistrict);
      setPermanentThana(normThana);
      setPermanentPostOffice(normPostOffice);
      setPermanentPostCode(pCode);
    } else {
      const rawPermCare = (permAddr.careOf || pCareOf).trim();
      setPermanentCareOf(rawPermCare);

      const rawPermVillage = (permAddr.villageRoad || pVillage).trim();
      setPermanentVillageRoad(rawPermVillage);

      setPermanentDivision(permDiv);
      setPermanentDistrict(permDist);
      setPermanentThana((permAddr.upazilaThana || normThana).trim());
      setPermanentPostOffice((permAddr.postOffice || normPostOffice).trim());
      setPermanentPostCode(toEnDigits(permAddr.postCode || pCode));
    }
  };

  const populatePreferencesFromProfile = (p: any) => {
    if (!p) return;
    const prefs = p.careerPreferences;
    if (prefs && typeof prefs === 'object') {
      if (Array.isArray(prefs.preferredCategories)) setPrefCategories(prefs.preferredCategories);
      if (Array.isArray(prefs.preferredOrgTypes)) setPrefOrgTypes(prefs.preferredOrgTypes);
      if (Array.isArray(prefs.preferredDivisions)) setPrefDivisions(prefs.preferredDivisions);
      if (prefs.preferredSalaryMin !== undefined && prefs.preferredSalaryMin !== null && prefs.preferredSalaryMin !== '') {
        setPrefSalaryMin(String(prefs.preferredSalaryMin));
      }
    }
  };

  useEffect(() => {
    const local = storage.getUser();
    setProfile(local);
    if (typeof window !== 'undefined') {
      const searchTab = new URLSearchParams(window.location.search).get('tab');
      if (searchTab && ['personal', 'education', 'skills', 'experience', 'preferences', 'quota'].includes(searchTab)) {
        setActiveTab(searchTab as any);
      }
    }
    populateAddressFromProfile(local);
    populatePreferencesFromProfile(local);
    setIsLoaded(true);
  }, []);

  // Synchronize profile data from TanStack Query candidate context (zero duplicate requests!)
  useEffect(() => {
    if (candidateProfile) {
      const cleanedIncoming = Object.fromEntries(
        Object.entries(candidateProfile).map(([k, v]) => [k, v === null ? undefined : v]),
      );
      const normalized = {
        ...mockUserProfile,
        ...cleanedIncoming,
        education: Array.isArray(candidateProfile.education) ? candidateProfile.education : Array.isArray((candidateProfile as any).educations) ? (candidateProfile as any).educations : [],
        skills: Array.isArray(candidateProfile.skills) ? candidateProfile.skills : [],
        experiences: Array.isArray(candidateProfile.experiences) ? candidateProfile.experiences : [],
        documents: Array.isArray(candidateProfile.documents) ? candidateProfile.documents : [],
      };
      setProfile(normalized);
      populateAddressFromProfile(normalized);
      populatePreferencesFromProfile(normalized);
      storage.updateUser(normalized);
      setIsLoaded(true);
    }
  }, [candidateProfile]);

  // Auto-sync permanent address whenever present address changes and sameAsPresent is checked
  useEffect(() => {
    if (sameAsPresent) {
      setPermanentCareOf(presentCareOf);
      setPermanentVillageRoad(presentVillageRoad);
      setPermanentDivision(presentDivision);
      setPermanentDistrict(presentDistrict);
      setPermanentThana(presentThana);
      setPermanentPostOffice(presentPostOffice);
      setPermanentPostCode(presentPostCode);
    }
  }, [sameAsPresent, presentCareOf, presentVillageRoad, presentDivision, presentDistrict, presentThana, presentPostOffice, presentPostCode]);

  const handlePresentDivisionChange = (div: string) => {
    setPresentDivision(div);
    const districts = getDistrictsForDivision(div);
    const exists = districts.some(d => d.en === presentDistrict);
    const newDistrict = exists ? presentDistrict : (districts[0]?.en || 'DHAKA');
    setPresentDistrict(newDistrict);
    const upazilas = getUpazilasForDistrict(newDistrict);
    if (!upazilas.includes(presentThana)) {
      setPresentThana(upazilas[0] || 'MIRPUR');
      setPresentCustomThanaMode(false);
    }
  };

  const handlePermanentDivisionChange = (div: string) => {
    setPermanentDivision(div);
    const districts = getDistrictsForDivision(div);
    const exists = districts.some(d => d.en === permanentDistrict);
    const newDistrict = exists ? permanentDistrict : (districts[0]?.en || 'DHAKA');
    setPermanentDistrict(newDistrict);
    const upazilas = getUpazilasForDistrict(newDistrict);
    if (!upazilas.includes(permanentThana)) {
      setPermanentThana(upazilas[0] || 'MIRPUR');
      setPermanentCustomThanaMode(false);
    }
  };

  const handlePresentDistrictChange = (dist: string) => {
    setPresentDistrict(dist);
    setPresentDivision(getDivisionForDistrict(dist));
    const upazilas = getUpazilasForDistrict(dist);
    if (!upazilas.includes(presentThana)) {
      setPresentThana(upazilas[0] || 'SADAR');
      setPresentCustomThanaMode(false);
    }
  };

  const handlePermanentDistrictChange = (dist: string) => {
    setPermanentDistrict(dist);
    setPermanentDivision(getDivisionForDistrict(dist));
    const upazilas = getUpazilasForDistrict(dist);
    if (!upazilas.includes(permanentThana)) {
      setPermanentThana(upazilas[0] || 'SADAR');
      setPermanentCustomThanaMode(false);
    }
  };

  const syncProfileToServer = async (profileToSave: CandidateProfile): Promise<boolean> => {
    try {
      // Optimistically update local state & dispatch change event immediately
      setProfile(profileToSave);
      storage.updateUser(profileToSave);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cs_user_changed'));
      }
      refreshCandidateData().catch(() => {});

      const response = await fetchWithAuth('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(profileToSave)
      });
      const data = await response.json();
      if (!response.ok || !data.profile) throw new Error(data.message || data.error || 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে');
      const mergedProfile = {
        ...profileToSave,
        ...data.profile,
        education: (Array.isArray(data.profile?.education) && data.profile.education.length > 0)
          ? data.profile.education
          : (Array.isArray(profileToSave.education) ? profileToSave.education : (data.profile?.education || [])),
      };
      setProfile(mergedProfile);
      storage.updateUser(mergedProfile);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cs_user_changed'));
      }
      refreshCandidateData().catch(() => {});
      return true;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে', 'সংরক্ষণ ব্যর্থ');
      return false;
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine structured fields into standard text address strings for backward compatibility
    const combinedPresent = `${presentVillageRoad}${presentThana ? ', ' + presentThana : ''}${presentDistrict ? ', ' + presentDistrict : ''}${presentPostCode ? '-' + presentPostCode : ''}`;
    const combinedPerm = sameAsPresent 
      ? combinedPresent 
      : `${permanentVillageRoad}${permanentThana ? ', ' + permanentThana : ''}${permanentDistrict ? ', ' + permanentDistrict : ''}${permanentPostCode ? '-' + permanentPostCode : ''}`;

    const updatedProfile: CandidateProfile = {
      ...profile,
      division: presentDivision,
      district: presentDistrict,
      address: combinedPresent,
      permanentAddress: combinedPerm,
      sameAsPresentAddress: sameAsPresent,
      presentAddressDetails: {
        careOf: presentCareOf,
        villageRoad: presentVillageRoad,
        division: presentDivision,
        district: presentDistrict,
        upazilaThana: presentThana,
        postOffice: presentPostOffice,
        postCode: presentPostCode
      },
      permanentAddressDetails: {
        careOf: sameAsPresent ? presentCareOf : permanentCareOf,
        villageRoad: sameAsPresent ? presentVillageRoad : permanentVillageRoad,
        division: sameAsPresent ? presentDivision : permanentDivision,
        district: sameAsPresent ? presentDistrict : permanentDistrict,
        upazilaThana: sameAsPresent ? presentThana : permanentThana,
        postOffice: sameAsPresent ? presentPostOffice : permanentPostOffice,
        postCode: sameAsPresent ? presentPostCode : permanentPostCode
      }
    };

    if (!await syncProfileToServer(updatedProfile)) return;
    setSavedSuccess(true);
    toast.fire({
      icon: 'success',
      title: 'প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!'
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDegree || !eduResult) return;
    setIsSavingEdu(true);
    try {
      const newEdu: EducationRecord = {
        id: 'EDU-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
        level: eduLevel,
        degree: eduDegree,
        boardOrUni: eduBoard || 'অন্যান্য',
        roll: eduRoll || 'N/A',
        reg: eduReg || 'N/A',
        year: eduYear,
        result: eduResult
      };
      const updated = {
        ...profile,
        education: [newEdu, ...(profile.education || [])]
      };
      if (!await syncProfileToServer(updated)) return;
      toast.fire({ icon: 'success', title: 'শিক্ষাগত যোগ্যতা যুক্ত করা হয়েছে' });
      setShowEduModal(false);
      setEduDegree('');
      setEduResult('');
    } finally {
      setIsSavingEdu(false);
    }
  };

  const handleDeleteEducation = async (idx: number) => {
    const confirmed = await showConfirm('আপনি কি সত্যিই এই শিক্ষাগত যোগ্যতা মুছে ফেলতে চান?');
    if (!confirmed) return;
    const updatedList = (profile.education || []).filter((_, i) => i !== idx);
    const updated = { ...profile, education: updatedList };
    if (!await syncProfileToServer(updated)) return;
    toast.fire({ icon: 'success', title: 'শিক্ষাগত তথ্য সফলভাবে মোছা হয়েছে' });
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setIsSavingSkill(true);
    try {
      const res = await fetchWithAuth('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName.trim(), proficiency: newSkillProficiency })
      });
      if (res.ok) {
        const d = await res.json();
        const updatedSkills = d.skills || d.data || [...(profile.skills || []), { id: 'sk_' + Date.now(), name: newSkillName.trim(), proficiency: newSkillProficiency }];
        const updated = { ...profile, skills: updatedSkills };
        setProfile(updated);
        storage.updateUser(updated);
        window.dispatchEvent(new Event('cs_user_changed'));
        setNewSkillName('');
        setSavedSuccess(true);
        toast.fire({ icon: 'success', title: 'নতুন স্কিল যুক্ত করা হয়েছে' });
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    const confirmed = await showConfirm('আপনি কি সত্যিই এই স্কিলটি মুছে ফেলতে চান?');
    if (!confirmed) return;
    try {
      const response = await fetchWithAuth('/api/user/skills/' + encodeURIComponent(skillId), { method: 'DELETE' });
      if (!response.ok) throw new Error('Skill deletion failed');
      const d = await response.json();
      const updatedSkills = d.skills || (profile.skills || []).filter((s: any) => (typeof s === 'string' ? s !== skillId : s.id !== skillId && s.name !== skillId));
      const updated = { ...profile, skills: updatedSkills };
      setProfile(updated);
      storage.updateUser(updated);
      window.dispatchEvent(new Event('cs_user_changed'));
      toast.fire({ icon: 'success', title: 'স্কিল সফলভাবে মোছা হয়েছে' });
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesignation.trim() || !newExpOrg.trim()) return;
    setIsSavingExp(true);
    try {
      const res = await fetchWithAuth('/api/user/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designation: newExpDesignation.trim(),
          organization: newExpOrg.trim(),
          startDate: newExpStartDate,
          endDate: newExpIsCurrent ? '' : newExpEndDate,
          isCurrent: newExpIsCurrent,
          responsibilities: newExpResponsibilities.trim()
        })
      });
      if (res.ok) {
        const d = await res.json();
        const updatedExp = d.experiences || d.data || [...(profile.experiences || []), {
          id: 'exp_' + Date.now(),
          designation: newExpDesignation.trim(),
          organization: newExpOrg.trim(),
          startDate: newExpStartDate,
          endDate: newExpIsCurrent ? '' : newExpEndDate,
          isCurrent: newExpIsCurrent,
          responsibilities: newExpResponsibilities.trim()
        }];
        const updated = { ...profile, experiences: updatedExp };
        setProfile(updated);
        storage.updateUser(updated);
        window.dispatchEvent(new Event('cs_user_changed'));
        setNewExpDesignation('');
        setNewExpOrg('');
        setNewExpStartDate('');
        setNewExpEndDate('');
        setNewExpResponsibilities('');
        setSavedSuccess(true);
        toast.fire({ icon: 'success', title: 'কর্মঅভিজ্ঞতা যুক্ত করা হয়েছে' });
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add experience:', err);
    } finally {
      setIsSavingExp(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    const confirmed = await showConfirm('আপনি কি সত্যিই এই কর্মঅভিজ্ঞতা মুছে ফেলতে চান?');
    if (!confirmed) return;
    try {
      const response = await fetchWithAuth('/api/user/experience/' + encodeURIComponent(expId), { method: 'DELETE' });
      if (!response.ok) throw new Error('Experience deletion failed');
      const d = await response.json();
      const updatedExp = d.experiences || (profile.experiences || []).filter((e: any) => e.id !== expId);
      const updated = { ...profile, experiences: updatedExp };
      setProfile(updated);
      storage.updateUser(updated);
      window.dispatchEvent(new Event('cs_user_changed'));
      toast.fire({ icon: 'success', title: 'অভিজ্ঞতা সফলভাবে মোছা হয়েছে' });
    } catch (err) {
      console.error('Failed to delete experience:', err);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      const prefsPayload = {
        preferredCategories: prefCategories,
        preferredOrgTypes: prefOrgTypes,
        preferredDivisions: prefDivisions,
        preferredSalaryMin: prefSalaryMin ? Number(prefSalaryMin) : undefined
      };

      const updatedProfile: CandidateProfile = {
        ...profile,
        careerPreferences: prefsPayload as any,
        careerObjective: (profile.careerObjective || '').trim(),
        professionalSummary: (profile.professionalSummary || '').trim(),
        currentPosition: (profile.currentPosition || '').trim(),
        currentOrganization: (profile.currentOrganization || '').trim(),
      };

      const saved = await syncProfileToServer(updatedProfile);
      if (saved) {
        setSavedSuccess(true);
        toast.fire({
          icon: 'success',
          title: 'ক্যারিয়ার পছন্দ সফলভাবে সংরক্ষণ করা হয়েছে!'
        });
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save career preferences:', err);
      toast.fire({
        icon: 'error',
        title: 'ক্যারিয়ার পছন্দ সংরক্ষণ ব্যর্থ হয়েছে'
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };


  if (!isLoaded) {
    return (
      <div className="space-y-6 w-full animate-pulse" suppressHydrationWarning>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            স্মার্ট ক্যান্ডিডেট প্রোফাইল
          </h1>
        </div>

        {/* Profile Section Tabs Skeleton */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Form Grid Skeleton */}
        <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Address Fields Skeleton */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="h-5 w-56 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-36 bg-slate-200 rounded"></div>
                  <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <div className="h-10 w-44 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const PROFILE_TABS = [
    { id: 'personal', label: 'ব্যক্তিগত তথ্য' },
    { id: 'education', label: `শিক্ষাগত যোগ্যতা (${(profile.education || []).length})` },
    { id: 'skills', label: `দক্ষতা ও স্কিলস (${(profile.skills || []).length})` },
    { id: 'experience', label: `অভিজ্ঞতা (${(profile.experiences || []).length})` },
    { id: 'preferences', label: 'ক্যারিয়ার পছন্দ' },
    { id: 'quota', label: 'কোটা সুবিধা' },
  ] as const;

  return (
    <div className="space-y-6 w-full" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            স্মার্ট ক্যান্ডিডেট প্রোফাইল
          </h1>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs animate-in fade-in self-start sm:self-auto">
            <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
          </div>
        )}
      </div>

      {/* AI Resume / CV PDF Import Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800/40 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 text-[11px] font-semibold mb-1">
                <span>AI রেজ্যুমে অটোপাইলট</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>Gemini OCR</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                বিদ্যমান সিভি (PDF) থেকে ১-ক্লিকে প্রোফাইল তৈরি করুন
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5 max-w-2xl leading-relaxed">
                আপনার বিদ্যমান জীবনবৃত্তান্ত / রেজ্যুমে PDF আপলোড করুন। AI স্বয়ংক্রিয়ভাবে আপনার শিক্ষাগত যোগ্যতা, চাকুরির অভিজ্ঞতা, ব্যক্তিগত বিবরণ ও স্কিল পড়ে নিয়ে প্রোফাইল তৈরি করে দেবে।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsResumeCardExpanded(!isResumeCardExpanded)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors shrink-0 cursor-pointer"
            title={isResumeCardExpanded ? 'সংকোচন করুন' : 'প্রসারিত করুন'}
          >
            {isResumeCardExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isResumeCardExpanded && (
          <div className="mt-4 pt-4 border-t border-emerald-800/40 relative z-10 space-y-3.5">
            {/* Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingResume(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingResume(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingResume(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                    toast.fire({ icon: 'warning', title: 'শুধুমাত্র PDF ফাইল আপলোড করা যাবে।' });
                    return;
                  }
                  setResumeFile(file);
                  setResumeImportError(null);
                  setResumeImportSuccess(null);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all duration-200 cursor-pointer ${
                isDraggingResume
                  ? 'border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-500/20'
                  : resumeFile
                  ? 'border-emerald-400/80 bg-emerald-950/40'
                  : 'border-emerald-700/50 hover:border-emerald-500/70 bg-black/20 hover:bg-black/30'
              }`}
              onClick={() => {
                const input = document.getElementById('resume-pdf-input');
                if (input) input.click();
              }}
            >
              <input
                id="resume-pdf-input"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                      toast.fire({ icon: 'warning', title: 'শুধুমাত্র PDF ফাইল আপলোড করা যাবে।' });
                      return;
                    }
                    setResumeFile(file);
                    setResumeImportError(null);
                    setResumeImportSuccess(null);
                  }
                }}
              />

              {resumeFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-emerald-200/70">
                        সাইজ: {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • PDF ফাইল নির্বাচিত
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        setResumeImportError(null);
                        setResumeImportSuccess(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={isImportingResume}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImportResumePdf();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isImportingResume ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>সিভি বিশ্লেষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>এআই দিয়ে তথ্য ইম্পোর্ট করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      আপনার সিভি বা রেজ্যুমে PDF এখানে ড্র্যাগ করুন অথবা ক্লিক করে ফাইল সিলেক্ট করুন
                    </p>
                    <p className="text-[11px] text-emerald-200/60 mt-0.5">
                      (সর্বোচ্চ ১৫ MB, বাংলা বা ইংরেজি যেকোনো স্ট্যান্ডার্ড কারিকুলাম ভিটা / জীবনবৃত্তান্ত)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Feedback */}
            {resumeImportSuccess && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resumeImportSuccess}</span>
              </div>
            )}
            {resumeImportError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resumeImportError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Section Tabs (Liquid Glass Capsule with Smooth Sliding Transition) */}
      <div className="p-1.5 bg-slate-100/90 backdrop-blur-md rounded-xl border border-slate-200/80 inline-flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
        {PROFILE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-950 font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-slate-200/80 ring-1 ring-slate-900/[0.03]'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/50 font-medium'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Information */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSaveProfile} className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6" suppressHydrationWarning>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পূর্ণ নাম (ইংরেজি ক্যাপিটাল লেটার)</label>
              <input
                type="text"
                value={profile.name ?? ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পূর্ণ নাম (বাংলায়)</label>
              <input
                type="text"
                value={profile.nameBn ?? ''}
                onChange={(e) => setProfile({ ...profile, nameBn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পিতার নাম (ইংরেজি ক্যাপিটাল)</label>
              <input
                type="text"
                value={profile.fatherName ?? ''}
                onChange={(e) => setProfile({ ...profile, fatherName: e.target.value.toUpperCase() })}
                placeholder="MD. ABDUR RAHMAN"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পিতার নাম (বাংলায়)</label>
              <input
                type="text"
                value={profile.fatherNameBn || ''}
                onChange={(e) => setProfile({ ...profile, fatherNameBn: e.target.value })}
                placeholder="মোঃ আব্দুর রহমান"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মাতার নাম (ইংরেজি ক্যাপিটাল)</label>
              <input
                type="text"
                value={profile.motherName ?? ''}
                onChange={(e) => setProfile({ ...profile, motherName: e.target.value.toUpperCase() })}
                placeholder="FATEMA BEGUM"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মাতার নাম (বাংলায়)</label>
              <input
                type="text"
                value={profile.motherNameBn || ''}
                onChange={(e) => setProfile({ ...profile, motherNameBn: e.target.value })}
                placeholder="মোসাঃ ফাতেমা বেগম"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">জন্ম তারিখ (YYYY-MM-DD)</label>
                {profile.dob && (
                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                    বয়স: {calculateAge(profile.dob)}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={profile.dob ?? ''}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">প্রার্থীর জাতীয় পরিচয়পত্র (NID / Smart Card)</label>
              <input
                type="text"
                value={profile.nid ?? ''}
                onChange={(e) => setProfile({ ...profile, nid: e.target.value })}
                placeholder="10, 13 বা 17 ডিজিটের NID নম্বর"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পিতার NID নম্বর (ঐচ্ছিক / ভেরিফিকেশন সহায়ক)</label>
              <input
                type="text"
                value={profile.fatherNid && !profile.fatherNid.startsWith('/') && !profile.fatherNid.startsWith('http') ? profile.fatherNid : ''}
                onChange={(e) => setProfile({ ...profile, fatherNid: e.target.value })}
                placeholder="১০, ১৩ বা ১৭ ডিজিটের NID নম্বর"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মাতার NID নম্বর (ঐচ্ছিক / ভেরিফিকেশন সহায়ক)</label>
              <input
                type="text"
                value={profile.motherNid && !profile.motherNid.startsWith('/') && !profile.motherNid.startsWith('http') ? profile.motherNid : ''}
                onChange={(e) => setProfile({ ...profile, motherNid: e.target.value })}
                placeholder="১০, ১৩ বা ১৭ ডিজিটের NID নম্বর"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মোবাইল নম্বর (এসএমএস প্রাপ্তির জন্য)</label>
              <input
                type="tel"
                value={profile.phone ?? ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={profile.email ?? ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">নিজ জেলা (Home District — কোটা ও যোগ্যতায় জরুরি)</label>
                <button
                  type="button"
                  onClick={() => setHomeDistrictCustomMode(!homeDistrictCustomMode)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                >
                  {homeDistrictCustomMode ? '৬৪ জেলার তালিকা থেকে বাছুন' : 'অন্যান্য / কাস্টম জেলা লিখুন'}
                </button>
              </div>
              {homeDistrictCustomMode ? (
                <input
                  type="text"
                  value={profile.district ?? ''}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="যেমন: ঢাকা, বগুড়া, নোয়াখালী..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                  required
                />
              ) : (
                <select
                  value={profile.district ?? ''}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setHomeDistrictCustomMode(true);
                      setProfile({ ...profile, district: '' });
                    } else {
                      setProfile({ ...profile, district: e.target.value });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none cursor-pointer"
                >
                  {getAllDistrictsList().map(d => (
                    <option key={d.en} value={d.bn}>{d.bn} ({d.en}) — {d.division}</option>
                  ))}
                  <option value="__custom__">অন্যান্য (কাস্টম জেলা লিখুন)...</option>
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">লিঙ্গ (Gender)</label>
              <select
                value={profile.gender || 'male'}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
              >
                <option value="male">পুরুষ (Male)</option>
                <option value="female">নারী (Female)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">বৈবাহিক অবস্থা (Marital Status)</label>
              <select
                value={profile.maritalStatus || 'single'}
                onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
              >
                <option value="single">অবিবাহিত (Single)</option>
                <option value="married">বিবাহিত (Married)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">ধর্ম (Religion)</label>
              <select
                value={(profile as any).religion || 'ইসলাম'}
                onChange={(e) => setProfile({ ...profile, religion: e.target.value } as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
              >
                <option value="ইসলাম">ইসলাম (Islam)</option>
                <option value="হিন্দু">হিন্দু (Hinduism)</option>
                <option value="বৌদ্ধ">বৌদ্ধ (Buddhism)</option>
                <option value="খ্রিস্টান">খ্রিস্টান (Christianity)</option>
                <option value="অন্যান্য">অন্যান্য (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">জাতীয়তা (Nationality)</label>
              <input
                type="text"
                value={profile.nationality || 'বাংলাদেশি (Bangladeshi)'}
                onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
              />
            </div>

            {/* STRUCTURED PRESENT & PERMANENT ADDRESS SECTION (TELETALK & GOVT/BANK ENGLISH STANDARD) */}
            <div className="col-span-1 md:col-span-2 space-y-5 pt-3">
              
              {/* 1. Present Address Card (Clean Header without Icons or Subtitle) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="pb-3 border-b border-slate-200/80">
                  <h4 className="font-bold text-sm text-slate-900">বর্তমান ঠিকানা (Present Address — English Standard)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Row 1 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">অভিভাবক / পিতা (Care Of — English)</label>
                    <input
                      type="text"
                      value={presentCareOf}
                      onChange={(e) => setPresentCareOf(e.target.value.toUpperCase())}
                      placeholder="e.g. MD. RAFIQUL ISLAM"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">গ্রাম / রোড / বাসা (Village / Road — English)</label>
                    <input
                      type="text"
                      value={presentVillageRoad}
                      onChange={(e) => setPresentVillageRoad(e.target.value.toUpperCase())}
                      placeholder="e.g. HOUSE 12, ROAD 5, MIRPUR-10"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                      required
                    />
                  </div>

                  {/* Row 2: Division & District */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">বিভাগ (Division — English)</label>
                      <button
                        type="button"
                        onClick={() => setPresentCustomDivisionMode(!presentCustomDivisionMode)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                      >
                        {presentCustomDivisionMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম বিভাগ'}
                      </button>
                    </div>
                    {presentCustomDivisionMode ? (
                      <input
                        type="text"
                        value={presentDivision}
                        onChange={(e) => setPresentDivision(e.target.value.toUpperCase())}
                        placeholder="e.g. DHAKA"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                      />
                    ) : (
                      <select
                        value={presentDivision}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setPresentCustomDivisionMode(true);
                          } else {
                            handlePresentDivisionChange(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 cursor-pointer font-bold"
                      >
                        {BD_DIVISIONS_EN.map((div) => (
                          <option key={div} value={div}>
                            {div} ({BD_DIVISIONS_MAP[div]?.bn || div})
                          </option>
                        ))}
                        <option value="__custom__">OTHER (TYPE CUSTOM DIVISION)...</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">জেলা (District — English)</label>
                      <button
                        type="button"
                        onClick={() => setPresentCustomDistrictMode(!presentCustomDistrictMode)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                      >
                        {presentCustomDistrictMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম জেলা'}
                      </button>
                    </div>
                    {presentCustomDistrictMode ? (
                      <input
                        type="text"
                        value={presentDistrict}
                        onChange={(e) => setPresentDistrict(e.target.value.toUpperCase())}
                        placeholder="e.g. DHAKA"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                      />
                    ) : (
                      <select
                        value={presentDistrict}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setPresentCustomDistrictMode(true);
                          } else {
                            handlePresentDistrictChange(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 cursor-pointer font-bold"
                      >
                        {getDistrictsForDivision(presentDivision).map((d) => (
                          <option key={d.en} value={d.en}>
                            {d.en} ({d.bn})
                          </option>
                        ))}
                        <option value="__custom__">OTHER (TYPE CUSTOM DISTRICT)...</option>
                      </select>
                    )}
                  </div>

                  {/* Row 3: Upazila / Thana & Post Office / Code */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">উপজেলা / থানা (Upazila / Thana — English)</label>
                      <button
                        type="button"
                        onClick={() => setPresentCustomThanaMode(!presentCustomThanaMode)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                      >
                        {presentCustomThanaMode ? 'তালিকা থেকে বাছুন' : 'অন্যান্য / কাস্টম লিখুন'}
                      </button>
                    </div>

                    {presentCustomThanaMode ? (
                      <input
                        type="text"
                        value={presentThana}
                        onChange={(e) => setPresentThana(e.target.value.toUpperCase())}
                        placeholder="e.g. MIRPUR"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                        required
                      />
                    ) : (
                      <select
                        value={presentThana}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setPresentCustomThanaMode(true);
                          } else {
                            setPresentThana(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 cursor-pointer font-bold"
                      >
                        {getUpazilasForDistrict(presentDistrict).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                        <option value="__custom__">OTHER (TYPE CUSTOM)...</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">ডাকঘর ও পোস্ট কোড (Post Office & Code)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={presentPostOffice}
                        onChange={(e) => setPresentPostOffice(e.target.value.toUpperCase())}
                        placeholder="e.g. MIRPUR"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                      />
                      <input
                        type="text"
                        value={presentPostCode}
                        onChange={(e) => setPresentPostCode(e.target.value)}
                        placeholder="e.g. 1216"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Permanent Address Card (Clean Header without Icons or Subtitle) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">স্থায়ী ঠিকানা (Permanent Address — English Standard)</h4>
                  </div>

                  {/* 1-Click Same as Present Checkbox */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg cursor-pointer transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={sameAsPresent}
                      onChange={(e) => setSameAsPresent(e.target.checked)}
                      className="w-3.5 h-3.5 text-slate-800 rounded border-slate-300 focus:ring-slate-400 cursor-pointer accent-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>বর্তমান ঠিকানার মতোই একই (Same as Present)</span>
                    </span>
                  </label>
                </div>

                {sameAsPresent ? (
                  <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span className="font-medium">
                        স্থায়ী ঠিকানা হিসেবে বর্তমান ঠিকানা স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে: <strong className="font-semibold text-slate-900 font-mono">{presentVillageRoad || 'VILLAGE/ROAD'}, {presentThana || 'THANA'}, {presentDistrict}, {presentDivision}-{presentPostCode || 'CODE'}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-md shrink-0">
                      AUTO-SYNCED
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fadeIn">
                    {/* Row 1 */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">অভিভাবক / পিতা (Care Of — English)</label>
                      <input
                        type="text"
                        value={permanentCareOf}
                        onChange={(e) => setPermanentCareOf(e.target.value.toUpperCase())}
                        placeholder="e.g. MD. RAFIQUL ISLAM"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">গ্রাম / রোড / বাসা (Village / Road — English)</label>
                      <input
                        type="text"
                        value={permanentVillageRoad}
                        onChange={(e) => setPermanentVillageRoad(e.target.value.toUpperCase())}
                        placeholder="e.g. PERMANENT VILLAGE / ROAD"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                      />
                    </div>

                    {/* Row 2: Division & District */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">স্থায়ী বিভাগ (Division — English)</label>
                        <button
                          type="button"
                          onClick={() => setPermanentCustomDivisionMode(!permanentCustomDivisionMode)}
                          className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                        >
                          {permanentCustomDivisionMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম বিভাগ'}
                        </button>
                      </div>
                      {permanentCustomDivisionMode ? (
                        <input
                          type="text"
                          value={permanentDivision}
                          onChange={(e) => setPermanentDivision(e.target.value.toUpperCase())}
                          placeholder="e.g. DHAKA"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                        />
                      ) : (
                        <select
                          value={permanentDivision}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setPermanentCustomDivisionMode(true);
                            } else {
                              handlePermanentDivisionChange(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 cursor-pointer font-bold"
                        >
                          {BD_DIVISIONS_EN.map((div) => (
                            <option key={div} value={div}>
                              {div} ({BD_DIVISIONS_MAP[div]?.bn || div})
                            </option>
                          ))}
                          <option value="__custom__">OTHER (TYPE CUSTOM DIVISION)...</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">স্থায়ী জেলা (District — English)</label>
                        <button
                          type="button"
                          onClick={() => setPermanentCustomDistrictMode(!permanentCustomDistrictMode)}
                          className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                        >
                          {permanentCustomDistrictMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম জেলা'}
                        </button>
                      </div>
                      {permanentCustomDistrictMode ? (
                        <input
                          type="text"
                          value={permanentDistrict}
                          onChange={(e) => setPermanentDistrict(e.target.value.toUpperCase())}
                          placeholder="e.g. DHAKA"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                        />
                      ) : (
                        <select
                          value={permanentDistrict}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setPermanentCustomDistrictMode(true);
                            } else {
                              handlePermanentDistrictChange(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 cursor-pointer font-bold"
                        >
                          {getDistrictsForDivision(permanentDivision).map((d) => (
                            <option key={d.en} value={d.en}>
                              {d.en} ({d.bn})
                            </option>
                          ))}
                          <option value="__custom__">OTHER (TYPE CUSTOM DISTRICT)...</option>
                        </select>
                      )}
                    </div>

                    {/* Row 3: Auto-selected Upazila & Post Office / Code */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">স্থায়ী উপজেলা / থানা (Upazila / Thana — English)</label>
                        <button
                          type="button"
                          onClick={() => setPermanentCustomThanaMode(!permanentCustomThanaMode)}
                          className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                        >
                          {permanentCustomThanaMode ? 'তালিকা থেকে বাছুন' : 'অন্যান্য / কাস্টম লিখুন'}
                        </button>
                      </div>

                      {permanentCustomThanaMode ? (
                        <input
                          type="text"
                          value={permanentThana}
                          onChange={(e) => setPermanentThana(e.target.value.toUpperCase())}
                          placeholder="e.g. MIRPUR"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                        />
                      ) : (
                        <select
                          value={permanentThana}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setPermanentCustomThanaMode(true);
                            } else {
                              setPermanentThana(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 cursor-pointer font-bold"
                        >
                          {getUpazilasForDistrict(permanentDistrict).map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                          <option value="__custom__">OTHER (TYPE CUSTOM)...</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">ডাকঘর ও পোস্ট কোড (Post Office & Code)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={permanentPostOffice}
                          onChange={(e) => setPermanentPostOffice(e.target.value.toUpperCase())}
                          placeholder="e.g. MIRPUR"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 uppercase font-mono"
                        />
                        <input
                          type="text"
                          value={permanentPostCode}
                          onChange={(e) => setPermanentPostCode(e.target.value)}
                          placeholder="e.g. 1216"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              প্রোফাইল তথ্য সেভ করুন
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Education CRUD */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              সর্বনিম্ন এসএসসি থেকে শুরু করে আপনার সর্বোচ্চ ডিগ্রি যুক্ত করুন:
            </span>
            <Button
              onClick={() => setShowEduModal(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              নতুন শিক্ষাগত যোগ্যতা যোগ করুন
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(profile.education || []).map((edu, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                      {edu.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{edu.degree}</span>
                    {edu.verificationStatus === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900 text-white border border-slate-900 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> যাচাইকৃত
                      </span>
                    )}
                    {edu.verificationStatus === 'NEEDS_CORRECTION' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        সংশোধন প্রয়োজন
                      </span>
                    )}
                    {edu.verificationStatus === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        বাতিল
                      </span>
                    )}
                    {edu.verificationStatus === 'PENDING_REVIEW' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        যাচাই অপেক্ষমান
                      </span>
                    )}
                  </div>
                  {edu.verificationRemarks && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 mt-1 inline-block">
                      ভেরিফিকেশন মন্তব্য: {edu.verificationRemarks}
                    </div>
                  )}
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-1">
                    <span>প্রতিষ্ঠান/বোর্ড: <strong>{edu.boardOrUni}</strong></span>
                    <span>•</span>
                    <span>রোল: {edu.roll}</span>
                    <span>•</span>
                    <span>পাস: {edu.year}</span>
                    <span>•</span>
                    <span className="text-slate-800 font-semibold">ফলাফল: {edu.result}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEducation(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors self-end sm:self-center"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Education Modal */}
          {showEduModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-base text-slate-900">শিক্ষাগত রেকর্ড যুক্ত করুন</h3>
                  <button onClick={() => setShowEduModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleAddEducation} className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">পর্যায় (Level)</label>
                      <button
                        type="button"
                        onClick={() => setEduCustomLevelMode(!eduCustomLevelMode)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                      >
                        {eduCustomLevelMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম পর্যায় লিখুন'}
                      </button>
                    </div>
                    {eduCustomLevelMode ? (
                      <input
                        type="text"
                        value={eduLevel}
                        onChange={(e) => setEduLevel(e.target.value)}
                        placeholder="যেমন: ও-লেভেল, এ-লেভেল, ডিপ্লোমা ইন নার্সিং..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none"
                        required
                      />
                    ) : (
                      <select
                        value={eduLevel}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setEduCustomLevelMode(true);
                            setEduLevel('');
                          } else {
                            setEduLevel(e.target.value);
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none cursor-pointer"
                      >
                        <option value="জেএসসি (JSC) / জেডিসি (JDC)">জেএসসি (JSC) / জেডিসি (JDC) / ৮ম শ্রেণি</option>
                        <option value="মাধ্যমিক (SSC)">মাধ্যমিক (SSC) / দাখিল</option>
                        <option value="উচ্চ মাধ্যমিক (HSC)">উচ্চ মাধ্যমিক (HSC) / আলিম</option>
                        <option value="ডিপ্লোমা ইন ইঞ্জিনিয়ারিং">ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / কারিগরি / মেডিকেল</option>
                        <option value="ডিগ্রি (পাস কোর্স)">ডিগ্রি (পাস কোর্স) - ৩ বছর মেয়াদী</option>
                        <option value="স্নাতক (অনার্স)">স্নাতক (অনার্স) / সমমান - ৪ বছর মেয়াদী</option>
                        <option value="স্নাতকোত্তর (মাস্টার্স)">স্নাতকোত্তর (মাস্টার্স) / কামিল</option>
                        <option value="উচ্চতর গবেষণা (এমফিল / পিএইচডি)">উচ্চতর গবেষণা (এমফিল / পিএইচডি)</option>
                        <option value="__custom__">অন্যান্য / কাস্টম শিক্ষাগত পর্যায় লিখুন...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ডিগ্রির নাম ও বিষয় (যেমন: বিএসসি ইন সিএসই)</label>
                    <input
                      type="text"
                      placeholder="যেমন: বিএসসি ইন কম্পিউটার সায়েন্স"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">বোর্ড / বিশ্ববিদ্যালয়</label>
                      <input
                        type="text"
                        placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                        value={eduBoard}
                        onChange={(e) => setEduBoard(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">পাসের বছর</label>
                      <input
                        type="text"
                        value={eduYear}
                        onChange={(e) => setEduYear(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">রোল নম্বর</label>
                      <input
                        type="text"
                        placeholder="180214"
                        value={eduRoll}
                        onChange={(e) => setEduRoll(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">রেজিস্ট্রেশন</label>
                      <input
                        type="text"
                        placeholder="201755123"
                        value={eduReg}
                        onChange={(e) => setEduReg(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">GPA / CGPA</label>
                      <input
                        type="text"
                        placeholder="৩.৫০"
                        value={eduResult}
                        onChange={(e) => setEduResult(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEduModal(false)}
                    >
                      বাতিল
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSavingEdu}
                      loadingText="সংরক্ষণ হচ্ছে..."
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Quota Information */}
      {activeTab === 'quota' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">কোটা ও বিশেষ সুবিধা যাচাই</h3>
            <p className="text-xs text-slate-500">
              সরকারি চাকরিতে বয়সসীমা ও সংরক্ষিত কোটা সুবিধার জন্য প্রযোজ্য অপশনটি নির্বাচন করুন। সঠিক প্রমাণ ছাড়া কোটা ক্লেইম করা দণ্ডনীয় অপরাধ।
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={!profile.quota || profile.quota === 'none'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'none' as any, quotaDetails: '' };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">সাধারণ প্রার্থী (কোনো কোটা প্রযোজ্য নয়)</strong>
                <span className="text-slate-500">বয়সসীমা সাধারণ নিয়মে ১৮ হতে ৩০ বছর পর্যন্ত।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={profile.quota === 'freedom_fighter'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'freedom_fighter' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">বীর মুক্তিযোদ্ধা / শহীদ মুক্তিযোদ্ধার সন্তান কোটা</strong>
                <span className="text-slate-500">সরকারি নিয়মে আবেদনের বয়সসীমা ৩২ বছর পর্যন্ত কার্যকর হবে।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={profile.quota === 'disabled'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'disabled' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">শারীরিক প্রতিবন্ধী প্রার্থী কোটা</strong>
                <span className="text-slate-500">সমাজসেবা অধিদপ্তর কর্তৃক প্রদত্ত প্রতিবন্ধী পরিচয়পত্র থাকতে হবে (বয়স ৩২ বছর)।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'tribal'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'tribal' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">ক্ষুদ্র নৃ-গোষ্ঠী / আদিবাসী কোটা</strong>
                <span className="text-slate-500">জেলা প্রশাসক বা সার্কেল চিফ কর্তৃক প্রদত্ত আদিবাসী সনদপত্র থাকতে হবে (বয়স ৩২ বছর)।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'ansar'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'ansar' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">আনসার ও গ্রাম প্রতিরক্ষা বাহিনী (Ansar & VDP) কোটা</strong>
                <span className="text-slate-500">আনসার ও ভিডিপি মৌলিক প্রশিক্ষণ সনদপত্রধারী প্রার্থীরা প্রযোজ্য হবেন।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'orphan'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'orphan' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">এতিম ও সমাজসেবা অধিদপ্তর নিবন্ধিত নিবাসী কোটা</strong>
                <span className="text-slate-500">সরকারি বা অনুমোদিত শিশু পরিবারের নিবাসী প্রার্থীরা প্রযোজ্য হবেন।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'ward'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'ward' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div>
                <strong className="text-slate-800 block">পোষ্য / বিভাগীয় প্রার্থী কোটা (Departmental / Ward Quota)</strong>
                <span className="text-slate-500">সংশ্লিষ্ট প্রতিষ্ঠান/মন্ত্রণালয়ে কর্মরত চাকরিজীবীদের সন্তানদের ক্ষেত্রে প্রযোজ্য।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={customQuotaMode || (profile.quota as any) === 'custom'}
                onChange={() => {
                  setCustomQuotaMode(true);
                  const u = { ...profile, quota: 'custom' as any };
                  syncProfileToServer(u);
                }}
                className="accent-slate-800 text-slate-800"
              />
              <div className="flex-1">
                <strong className="text-slate-800 block">অন্যান্য / কাস্টম কোটা (Custom Quota)</strong>
                <span className="text-slate-500">অন্যান্য বিশেষ কোটা সুবিধা থাকলে নিজে নাম লিখে উল্লেখ করুন।</span>
                {(customQuotaMode || (profile.quota as any) === 'custom') && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customQuotaTitle || (profile as any).customQuotaName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomQuotaTitle(val);
                        const u = { ...profile, quota: 'custom' as any, customQuotaName: val };
                        syncProfileToServer(u);
                      }}
                      placeholder="কাস্টম কোটার নাম লিখুন (যেমন: ক্রীড়াবিদ কোটা, রেলওয়ে পোষ্য কোটা...)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>

          {profile.quota && profile.quota !== 'none' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-4">
              <div className="flex items-start gap-2.5">
                <div>
                  <strong className="text-slate-900 block font-semibold">কোটা প্রমাণক সনদ সংযুক্তির নিয়মাবলী</strong>
                  <span className="text-slate-600">
                    নির্বাচিত কোটার সুবিধা পাওয়ার জন্য স্মার্ট ডকুমেন্ট ভল্টে কোটা প্রমাণক বা প্রত্যয়নপত্র আপলোড থাকা বাধ্যতামূলক।
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/vault"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>ডকুমেন্ট ভল্টে সনদ আপলোড করুন</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab: Skills Management */}
      {activeTab === 'skills' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              প্রফেশনাল ও টেকনিক্যাল স্কিলস (Skills & Competencies)
            </h3>
            <p className="text-xs text-slate-500">
              স্মার্ট জব ম্যাচিংয়ে নির্ভুল রিকমেন্ডেশন পেতে আপনার অর্জিত দক্ষতা ও দক্ষতা স্তর নির্বাচন করুন।
            </p>
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">নতুন স্কিল যুক্ত করুন</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">দক্ষতার নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: এমএস এক্সেল, পাইথন, জাভাস্ক্রিপ্ট, অ্যাকাউন্টিং..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">দক্ষতা স্তর (Proficiency)</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                >
                  <option value="BEGINNER">প্রাথমিক (Beginner)</option>
                  <option value="INTERMEDIATE">মাঝারি (Intermediate)</option>
                  <option value="ADVANCED">উন্নত (Advanced)</option>
                  <option value="EXPERT">বিশেষজ্ঞ (Expert)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-bold">জনপ্রিয় স্কিল:</span>
                {['এমএস এক্সেল', 'জাভাস্ক্রিপ্ট', 'পাইথন', 'অ্যাকাউন্টিং', 'ইংরেজি টাইপিং', 'গ্রাফিক ডিজাইন'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewSkillName(s)}
                    className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-slate-700 font-semibold"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newSkillName.trim()}
                loading={isSavingSkill}
                loadingText="যোগ হচ্ছে..."
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="ml-auto"
              >
                স্কিল যোগ করুন
              </Button>
            </div>
          </form>

          {/* Current Skills List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">সংরক্ষিত দক্ষতা তালিকা ({(profile.skills || []).length} টি)</h4>
            {(profile.skills || []).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                এখনও কোনো স্কিল যোগ করা হয়নি। উপরের ফরম থেকে আপনার দক্ষতা যোগ করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(profile.skills || []).map((s: any, idx: number) => {
                  const sName = typeof s === 'string' ? s : s.name;
                  const sId = typeof s === 'string' ? s : (s.id || s.name);
                  const sProf = typeof s === 'string' ? 'INTERMEDIATE' : (s.proficiency || 'INTERMEDIATE');

                  let profBadge = 'bg-slate-100 text-slate-700';
                  let profLabel = 'মাঝারি';
                  if (sProf === 'EXPERT') { profBadge = 'bg-purple-50 text-purple-700 border-purple-200'; profLabel = 'বিশেষজ্ঞ'; }
                  else if (sProf === 'ADVANCED') { profBadge = 'bg-slate-100 text-slate-800 border-slate-200'; profLabel = 'উন্নত'; }
                  else if (sProf === 'BEGINNER') { profBadge = 'bg-amber-50 text-amber-700 border-amber-200'; profLabel = 'প্রাথমিক'; }

                  return (
                    <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                      <div className="space-y-1 truncate">
                        <div className="font-bold text-xs text-slate-900 truncate">{sName}</div>
                        <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border ${profBadge}`}>
                          {profLabel}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(sId)}
                        title="মুছুন"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Work Experience */}
      {activeTab === 'experience' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              কাজের অভিজ্ঞতা (Employment & Work Experience)
            </h3>
            <p className="text-xs text-slate-500">
              আপনার পূর্ববর্তী বা বর্তমান চাকরির তথ্য যোগ করুন। ফ্রেশার প্রার্থীদের ক্ষেত্রে এটি পূরণ করা বাধ্যতামূলক নয়।
            </p>
          </div>

          {/* Add Experience Form */}
          <form onSubmit={handleAddExperience} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">নতুন কাজের অভিজ্ঞতা যুক্ত করুন</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">পদবী (Designation)</label>
                <input
                  type="text"
                  placeholder="যেমন: সহকারী কর্মকর্তা, সফটওয়্যার ডেভেলপার..."
                  value={newExpDesignation}
                  onChange={(e) => setNewExpDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">প্রতিষ্ঠান বা কোম্পানির নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: রূপালী ব্যাংক লিমিটেড, গ্রামীণফোন..."
                  value={newExpOrg}
                  onChange={(e) => setNewExpOrg(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">শুরুর তারিখ (Start Date)</label>
                <input
                  type="date"
                  value={newExpStartDate}
                  onChange={(e) => setNewExpStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">শেষের তারিখ (End Date)</label>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExpIsCurrent}
                      onChange={(e) => setNewExpIsCurrent(e.target.checked)}
                      className="accent-slate-800 rounded"
                    />
                    <span>বর্তমানে কর্মরত</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={newExpIsCurrent}
                  value={newExpEndDate}
                  onChange={(e) => setNewExpEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white disabled:bg-slate-100 border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">সংক্ষিপ্ত দায়িত্ব বা ভূমিকা (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="আপনার প্রধান কাজ বা দায়িত্ব সংক্ষেপে লিখুন..."
                  value={newExpResponsibilities}
                  onChange={(e) => setNewExpResponsibilities(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newExpDesignation.trim() || !newExpOrg.trim()}
                loading={isSavingExp}
                loadingText="সংরক্ষণ হচ্ছে..."
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                অভিজ্ঞতা যোগ করুন
              </Button>
            </div>
          </form>

          {/* Current Experience List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">সংরক্ষিত অভিজ্ঞতার তালিকা ({(profile.experiences || []).length} টি)</h4>
            {(profile.experiences || []).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                কোনো কাজের অভিজ্ঞতা যুক্ত নেই। প্রযোজ্য হলে উপরের ফর্ম ব্যবহার করে অভিজ্ঞতা যোগ করুন।
              </div>
            ) : (
              <div className="space-y-3">
                {(profile.experiences || []).map((exp: any) => (
                  <div key={exp.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900">{exp.designation}</div>
                      <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                        <span>{exp.organization}</span>
                        <span>•</span>
                        <span className="text-slate-800 font-semibold">
                          {exp.startDate || 'N/A'} হতে {exp.isCurrent ? 'বর্তমান পর্যন্ত' : (exp.endDate || 'N/A')}
                        </span>
                      </div>
                      {exp.responsibilities && (
                        <p className="text-xs text-slate-500 pt-1 leading-relaxed">{exp.responsibilities}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      title="মুছুন"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Career Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              ক্যারিয়ার ও কর্মসংস্থান অগ্রাধিকার (Career Preferences)
            </h3>
            <p className="text-xs text-slate-500">
              আপনার পছন্দের ক্যাটাগরি, প্রতিষ্ঠানের ধরন এবং প্রত্যাশিত বেতন নির্ধারণ করুন যাতে স্মার্ট ম্যাচিং ইঞ্জিন প্রাসঙ্গিক চাকরিগুলোকে তালিকার শীর্ষে প্রদর্শন করতে পারে।
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Preferred Categories */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">পছন্দের চাকরির ক্ষেত্র বা ক্যাটাগরি (একাধিক নির্বাচনযোগ্য)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'govt', label: 'সরকারি চাকরি' },
                  { id: 'bank', label: 'ব্যাংক ও আর্থিক' },
                  { id: 'teacher', label: 'শিক্ষক নিয়োগ' },
                  { id: 'defense', label: 'প্রতিরক্ষা ও বাহিনী' },
                  { id: 'railway', label: 'বাংলাদেশ রেলওয়ে' },
                  { id: 'ngo', label: 'এনজিও ও উন্নয়ন' },
                  { id: 'private', label: 'প্রাইভেট ও কর্পোরেট' },
                  { id: 'engineer', label: 'প্রকৌশল ও কারিগরি' }
                ].map((cat) => {
                  const isChecked = prefCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`p-3 rounded-xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                        isChecked ? 'bg-white border-slate-400 text-slate-950 shadow-xs ring-1 ring-slate-900/5' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setPrefCategories([...prefCategories, cat.id]);
                          else setPrefCategories(prefCategories.filter(c => c !== cat.id));
                        }}
                        className="accent-slate-800 rounded"
                      />
                      <span>{cat.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Preferred Org Types */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">পছন্দের প্রতিষ্ঠানের ধরন</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'government', label: 'সরকারি প্রতিষ্ঠান' },
                  { id: 'bank', label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' },
                  { id: 'autonomous', label: 'স্বায়ত্তশাসিত সংস্থা' },
                  { id: 'ngo', label: 'এনজিও ও আন্তর্জাতিক সংস্থা' },
                  { id: 'private_company', label: 'প্রাইভেট ও করপোরেট কোম্পানি' },
                  { id: 'multinational', label: 'মাল্টিন্যাশনাল কোম্পানি' }
                ].map((org) => {
                  const isChecked = prefOrgTypes.includes(org.id);
                  return (
                    <label
                      key={org.id}
                      className={`p-3 rounded-xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                        isChecked ? 'bg-white border-slate-400 text-slate-950 shadow-xs ring-1 ring-slate-900/5' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setPrefOrgTypes([...prefOrgTypes, org.id]);
                          else setPrefOrgTypes(prefOrgTypes.filter(o => o !== org.id));
                        }}
                        className="accent-slate-800 rounded"
                      />
                      <span>{org.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Preferred Divisions & Minimum Salary */}
            {/* Professional Summary & Career Objectives (Matches Admin 360 Workspace) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">ক্যারিয়ার উদ্দেশ্য (Career Objective)</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: সরকারি বা স্বায়ত্তশাসিত প্রতিষ্ঠানে আইসিটি বা সাধারণ প্রশাসনিক পদে দায়িত্বশীল ভূমিকা পালন করা..."
                  value={profile.careerObjective || ''}
                  onChange={(e) => setProfile({ ...profile, careerObjective: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">পেশাগত সারসংক্ষেপ (Professional Summary)</label>
                <textarea
                  rows={2}
                  placeholder="আপনার পূর্ববর্তী কাজের অভিজ্ঞতা বা সামগ্রিক দক্ষতার সংক্ষিপ্ত বিবরণ..."
                  value={profile.professionalSummary || ''}
                  onChange={(e) => setProfile({ ...profile, professionalSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">বর্তমান পদবি (Current Position — যদি থাকে)</label>
                <input
                  type="text"
                  placeholder="যেমন: কম্পিউটার অপারেটর / ডাটা এন্ট্রি অ্যাসিস্ট্যান্ট"
                  value={profile.currentPosition || ''}
                  onChange={(e) => setProfile({ ...profile, currentPosition: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">বর্তমান প্রতিষ্ঠান (Current Organization — যদি থাকে)</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলাদেশ কম্পিউটার কাউন্সিল / ফ্রিল্যান্সার"
                  value={profile.currentOrganization || ''}
                  onChange={(e) => setProfile({ ...profile, currentOrganization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">পছন্দের কর্মসংস্থান বিভাগ</label>
                <div className="grid grid-cols-2 gap-2">
                  {['DHAKA', 'CHITTAGONG', 'RAJSHAHI', 'KHULNA', 'BARISAL', 'SYLHET', 'RANGPUR', 'MYMENSINGH'].map((div) => {
                    const isChecked = prefDivisions.includes(div);
                    return (
                      <label
                        key={div}
                        className={`p-2.5 rounded-xl border cursor-pointer font-bold transition-all flex items-center gap-2 text-[11px] ${
                          isChecked ? 'bg-white border-slate-400 text-slate-950 shadow-xs ring-1 ring-slate-900/5' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setPrefDivisions([...prefDivisions, div]);
                            else setPrefDivisions(prefDivisions.filter(d => d !== div));
                          }}
                          className="accent-slate-800 rounded"
                        />
                        <span>{BD_DIVISIONS_MAP[div]?.bn || div}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">প্রত্যাশিত সর্বনিম্ন মাসিক মূল বেতন (BDT)</label>
                  <input
                    type="number"
                    placeholder="যেমন: ২৫০০০"
                    value={prefSalaryMin}
                    onChange={(e) => setPrefSalaryMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 focus:bg-white outline-none"
                  />
                  <p className="text-[11px] text-slate-400">সরকারি চাকরির ক্ষেত্রে স্কেল অনুযায়ী স্বয়ংক্রিয়ভাবে গণনা হবে।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
                  <strong>টিপস:</strong> আপনি যে ক্যাটাগরি ও বিভাগগুলো নির্বাচন করবেন, সেই ফিল্ডের নতুন সার্কুলার প্রকাশিত হওয়ামাত্রই আপনার ড্যাশবোর্ডে অগ্রাধিকার ভিত্তিতে নোটিফিকেশন পৌঁছাবে।
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSavingPrefs}
              loadingText="সংরক্ষণ হচ্ছে..."
              leftIcon={<Save className="w-4 h-4" />}
            >
              পছন্দসমূহ সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
